import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again after a minute." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      if (email.toLowerCase().endsWith("@rnn.com")) {
        user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().replace("@rnn.com", "@rn.com") },
        });
      } else if (email.toLowerCase().endsWith("@rn.com")) {
        user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().replace("@rn.com", "@rnn.com") },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { error: "This account has been deleted. Please contact your administrator to restore access." },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account has been suspended by the administrator. Please contact support." },
        { status: 403 }
      );
    }

    // Governance Rule: Require Super Admin Approval for both Masjid Admins and Community Users
    if (!user.isApproved && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "⏳ Account Pending Approval: Your account is awaiting Super Admin verification. You will be able to log in once approved." },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}${isProduction ? "; Secure" : ""}`;
    response.headers.set("Set-Cookie", `auth_token=${token}; ${cookieOptions}`);

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
