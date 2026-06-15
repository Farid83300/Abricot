"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        // Erreurs par champ (ex: email déjà utilisé, mot de passe trop court)
        if (err.details && err.details.length > 0) {
          const errors: Record<string, string> = {};
          err.details.forEach(({ field, message }) => {
            errors[field] = message;
          });
          setFieldErrors(errors);
        } else {
          setError(err.message);
        }
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Logo */}
      <Image
        src="/logo.svg"
        alt="Abricot"
        width={160}
        height={54}
        className="mb-20 h-auto w-auto"
        priority
      />

      {/* Titre */}
      <h2 className="mb-8 text-3xl font-semibold text-primary">Inscription</h2>

      {/* Bandeau d'erreur global */}
      {error && (
        <div className="mb-4 rounded-lg border border-status-todo-text bg-status-todo-bg px-4 py-3 text-sm text-status-todo-text">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Nom */}
        <div className="mb-5">
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Nom
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs text-status-todo-text">
              {fieldErrors.name}
            </p>
          )}
        </div>

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
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-status-todo-text">
              {fieldErrors.email}
            </p>
          )}
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-status-todo-text">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
        </button>
      </form>

      {/* Lien connexion */}
      <p className="mt-16 text-sm text-text-secondary">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
