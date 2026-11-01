import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

interface LogoProps {
  className?: string;
  theme?: "light" | "dark";
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`rounded-2xl bg-[#194331] border border-[#BF8B36]/50 flex items-center justify-center text-[#BF8B36] font-bold shadow-xs ${className}`}>
      <span className="text-xl">🕌</span>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  theme = "light",
}) => {
  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 rounded-2xl bg-[#194331] border border-[#BF8B36]/50 flex items-center justify-center text-[#BF8B36] font-bold text-xl shadow-xs group-hover:scale-105 transition-transform duration-200">
        🕌
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center text-xl md:text-2xl font-serif font-extrabold tracking-tight whitespace-nowrap">
          <span className="text-[#BF8B36]">MO</span>
          <span className={theme === "dark" ? "text-white" : "text-[#194331]"}>sQuE</span>
        </div>
        <span className="text-[9px] font-mono font-bold tracking-widest text-[#BF8B36] uppercase -mt-1">
          Masjid Platform
        </span>
      </div>
    </Link>
  );
};
