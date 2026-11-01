import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_fallback_secret_for_rent_a_house";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Helper to parse cookies from Request headers
 */
export function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookieList = cookieHeader.split(";");
  for (const c of cookieList) {
    const trimmed = c.trim();
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const cookieName = trimmed.slice(0, eqIdx).trim();
      const cookieValue = trimmed.slice(eqIdx + 1).trim();
      if (cookieName === name) {
        try {
          return decodeURIComponent(cookieValue);
        } catch {
          return cookieValue;
        }
      }
    }
  }
  return null;
}

/**
 * Extracts and verifies the authenticated user from the Request
 */
export async function getAuthenticatedUser(req?: Request) {
  let token: string | null = null;

  // 1. Check from Request Cookie Header
  if (req) {
    token = getCookie(req, "auth_token") || getCookie(req, "token");
  }

  // 2. Fallback to Next.js cookies() store
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("auth_token")?.value || cookieStore.get("token")?.value || null;
    } catch {
      // outside Next.js request context
    }
  }

  // 3. Fallback to Authorization Header
  if (!token && req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatar: true,
      isEmailVerified: true,
      isApproved: true,
      masjidId: true,
      masjid: {
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          location: true,
          coverImage: true,
          status: true,
          city: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return user;
}

import { cookies } from "next/headers";

/**
 * Helper to get the current scoped masjidId for multi-tenant browsing
 */
export async function getAdminMasjidScope() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  let userRole = null;
  let userId = null;
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      userRole = decoded.role;
      userId = decoded.userId;
    }
  }

  // 1. If logged in as MASJID_ADMIN, strictly enforce their assigned masjid
  if (userRole === "MASJID_ADMIN" && userId) {
    const adminPerm = await prisma.masjidAdminPermission.findFirst({
      where: { userId }
    });
    return adminPerm?.masjidId || null;
  }

  // 2. If logged in as SUPER_ADMIN, allow impersonation via the selected scope cookie
  if (userRole === "SUPER_ADMIN") {
    const selectedMasjidId = cookieStore.get("selected_masjid_id")?.value;
    return selectedMasjidId || null;
  }

  // 3. Regular users and public visitors always see the global view
  return null;
}
