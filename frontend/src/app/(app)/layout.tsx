"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-[94px] items-center justify-between border-b border-border bg-surface px-8">
        {/* Logo */}
        <Link href="/dashboard" className="ml-[50px]">
          <Image
            src="/logo.svg"
            alt="Abricot"
            width={150}
            height={20}
            className="w-[150px]"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {/* Tableau de bord */}
          <Link
            href="/dashboard"
            className={`flex h-[78px] w-[248px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
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
              className={`h-4 w-4 ${
                isDashboard
                  ? "brightness-0 invert"
                  : "brightness-0 opacity-50"
              }`}
            />
            Tableau de bord
          </Link>

          {/* Projets */}
          <Link
            href="/projects"
            className={`flex h-[78px] w-[248px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
              isProjects
                ? "bg-ink text-white"
                : "text-text-secondary hover:text-ink"
            }`}
          >
            <Image
              src="/projects-header.svg"
              alt=""
              width={18}
              height={15}
              className={`h-4 w-auto ${
                isProjects ? "brightness-0 invert" : ""
              }`}
            />
            Projets
          </Link>
        </nav>

        {/* Avatar */}
        <Link
          href="/account"
          className="mr-[50px] flex h-15 w-15 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
        >
          {initials}
        </Link>
      </header>

      <main className="flex-1 px-[150px] py-8">{children}</main>

      {/* Footer */}
      <footer className="flex h-[68px] items-center justify-between border-t border-border bg-surface px-[50px]">
        <Image
          src="/logo-black.svg"
          alt="Abricot"
          width={80}
          height={26}
          className="ml-[30px] w-[101px]"
        />
        <span className="mr-[30px] text-sm text-text-secondary">Abricot 2025</span>
      </footer>
    </div>
  );
}
