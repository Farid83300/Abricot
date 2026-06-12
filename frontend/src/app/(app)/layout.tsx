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
    // Redirection en cours via le useEffect ci-dessus.
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="border-border bg-surface flex items-center justify-between border-b px-8 py-4">
        <span className="text-primary text-xl font-bold">ABRICOT</span>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={
              pathname === "/dashboard"
                ? "text-primary font-medium"
                : "text-text-secondary hover:text-ink"
            }
          >
            Tableau de bord
          </Link>
          <Link
            href="/projects"
            className={
              pathname.startsWith("/projects")
                ? "text-primary font-medium"
                : "text-text-secondary hover:text-ink"
            }
          >
            Projets
          </Link>
        </nav>

        <Link
          href="/account"
          className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
        >
          {user.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </Link>
      </header>

      <main className="p-8">{children}</main>
    </div>
  );
}
