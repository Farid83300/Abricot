"use client";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
        <span className="text-xl font-bold text-primary">ABRICOT</span>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={
              pathname === "/dashboard"
                ? "font-medium text-primary"
                : "text-text-secondary hover:text-ink"
            }
          >
            Tableau de bord
          </Link>
          <Link
            href="/projects"
            className={
              pathname.startsWith("/projects")
                ? "font-medium text-primary"
                : "text-text-secondary hover:text-ink"
            }
          >
            Projets
          </Link>
        </nav>

        <Link
          href="/account"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
        >
          {initials}
        </Link>
      </header>

      <main className="p-8">{children}</main>
    </div>
  );
}
