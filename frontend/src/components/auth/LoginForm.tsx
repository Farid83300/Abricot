"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo — fixé en haut, centré, taille croissante par breakpoint */}
      <Image
        src="/logo.svg"
        alt="Abricot"
        width={160}
        height={54}
        className="mx-auto h-auto w-56 sm:w-64 lg:w-68"
        priority
      />

      {/* Bloc formulaire — centré verticalement dans l'espace restant */}
      <div className="flex flex-1 flex-col justify-center">
        <h2 className="mb-8 text-3xl font-semibold text-primary">Connexion</h2>

        {/* Bandeau d'erreur */}
        {error && (
          <div className="mb-4 rounded-lg border border-status-todo-text bg-status-todo-bg px-4 py-3 text-sm text-status-todo-text">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Mot de passe */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Connexion en cours..." : "Se connecter"}
          </button>

          {/* Mot de passe oublié — juste sous le bouton, centré */}
          <div className="mt-3 text-center">
            <Link href="#" className="text-sm text-primary hover:underline">
              Mot de passe oublié?
            </Link>
          </div>
        </form>

        {/* Lien inscription */}
        <p className="mt-10 text-sm text-text-secondary">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
