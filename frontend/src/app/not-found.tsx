"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {user && <Header user={user} />}

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">

        <p className="mb-2 text-2xl font-bold text-primary sm:text-5xl">
        Erreur 404
        </p>
        <h1 className="mb-3 text-3xl font-semibold text-ink sm:text-2xl">
          Page introuvable
        </h1>
        <p className="mb-8 max-w-md text-sm text-text-secondary sm:text-base">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;adresse ou retournez à l&apos;accueil.
        </p>

        <Link
          href={user ? "/dashboard" : "/login"}
          className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          {user ? "Retour au tableau de bord" : "Se connecter"}
        </Link>
      </main>

      <Footer />
    </div>
  );
}
