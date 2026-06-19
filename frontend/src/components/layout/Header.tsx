"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/types/api";

interface Props {
  user: User;
}

export default function Header({ user }: Props) {
  const pathname = usePathname();

  const initials = user.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isDashboard = pathname === "/dashboard";
  const isProjects = pathname.startsWith("/projects");

  return (
    <header className="flex h-23.5 items-center justify-between border-b border-border bg-surface px-37.5">
      {/* Logo */}
      <Link href="/dashboard">
        <Image
          src="/logo.svg"
          alt="Abricot"
          width={150}
          height={20}
          style={{ width: "150px", height: "auto" }}
          priority
        />
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-2">
        {/* Tableau de bord */}
        <Link
          href="/dashboard"
          className={`flex h-19.5 w-62 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
            isDashboard
              ? "bg-ink text-white"
              : "text-text-secondary hover:text-ink"
          }`}
        >
          <Image
            src="/dashboard-header.svg"
            alt=""
            width={16}
            height={16}
            style={{ width: "16px", height: "16px" }}
            className={
              isDashboard
                ? "brightness-0 invert"
                : "brightness-0 opacity-50"
            }
          />
          Tableau de bord
        </Link>

        {/* Projets */}
        <Link
          href="/projects"
          className={`flex h-19.5 w-62 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
            isProjects
              ? "bg-ink text-white"
              : "text-text-secondary hover:text-ink"
          }`}
        >
          <Image
            src="/projects-header.svg"
            alt=""
            width={18}
            height={14}
            style={{ width: "18px", height: "auto" }}
            className={isProjects ? "brightness-0 invert" : ""}
          />
          Projets
        </Link>
      </nav>

      {/* Avatar */}
      <Link
        href="/account"
        className="flex h-15 w-15 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
      >
        {initials}
      </Link>
    </header>
  );
}
