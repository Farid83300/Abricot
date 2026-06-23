"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/types/api";

interface Props {
  user: User;
}

export default function Header({ user }: Props) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

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
  const isAccount = pathname.startsWith("/account");

  // Ferme le menu mobile quand on change de page (pendant le rendu, pas dans un effet)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  const navLinkClasses = (isActive: boolean) =>
    `flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors lg:h-19.5 lg:w-62 ${
      isActive ? "bg-ink text-white" : "text-text-secondary hover:text-ink"
    }`;

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 lg:h-23.5 lg:px-37.5">
      {/* Logo */}
      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
        <Image
          src="/logo.svg"
          alt="Abricot"
          width={150}
          height={20}
          className="h-auto w-27.5 sm:w-32.5 lg:w-47.5"
          priority
        />
      </Link>

      {/* Navigation desktop (à partir de 1024px uniquement) */}
      <nav className="hidden items-center gap-2 lg:flex">
        <Link href="/dashboard" className={navLinkClasses(isDashboard)}>
          <Image
            src="/dashboard-header.svg"
            alt=""
            width={16}
            height={16}
            style={{ width: "16px", height: "16px" }}
            className={
              isDashboard ? "brightness-0 invert" : ""
            }
          />
          Tableau de bord
        </Link>

        <Link href="/projects" className={navLinkClasses(isProjects)}>
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

      {/* Bloc droit : avatar + bouton hamburger (visible jusqu'à 1024px) */}
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          onClick={() => setIsMenuOpen(false)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-12 sm:w-12 sm:text-sm lg:h-15 lg:w-15 ${
            isAccount
              ? "bg-primary-hover text-white"
              : "bg-avatar text-ink"
          }`}
        >
          {initials}
        </Link>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Ouvrir le menu de navigation"
          aria-expanded={isMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink lg:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menu déroulant mobile/tablette (jusqu'à 1024px) */}
      {isMenuOpen && (
        <nav className="absolute top-full right-0 left-0 z-50 flex flex-col gap-2 border-b border-border bg-surface p-4 shadow-md lg:hidden">
          <Link href="/dashboard" className={navLinkClasses(isDashboard)}>
            <Image
              src="/dashboard-header.svg"
              alt=""
              width={16}
              height={16}
              style={{ width: "16px", height: "16px" }}
              className={
                isDashboard ? "brightness-0 invert" : "opacity-50 brightness-0"
              }
            />
            Tableau de bord
          </Link>

          <Link href="/projects" className={navLinkClasses(isProjects)}>
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
      )}
    </header>
  );
}
