"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, updatePassword, updateProfile } from "@/lib/api";

export default function AccountPage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setIsProfileSubmitting(true);

    try {
      await updateProfile({ name, email });
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError("Une erreur est survenue.");
      }
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsPasswordSubmitting(true);

    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message);
      } else {
        setPasswordError("Une erreur est survenue.");
      }
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-ink">Mon compte</h1>
      <p className="mb-8 text-sm text-text-secondary">{user.name}</p>

      {/* Informations personnelles */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold text-ink">
          Informations personnelles
        </h2>

        {profileError && (
          <div className="mb-4 rounded-lg border border-status-todo-text bg-status-todo-bg px-4 py-3 text-sm text-status-todo-text">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 rounded-lg border border-status-done-text bg-status-done-bg px-4 py-3 text-sm text-status-done-text">
            Informations mises à jour avec succès.
          </div>
        )}

        <form
          onSubmit={handleProfileSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="account-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Nom
            </label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="account-email"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isProfileSubmitting}
            className="self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProfileSubmitting
              ? "Enregistrement..."
              : "Modifier les informations"}
          </button>
        </form>
      </div>

      {/* Mot de passe */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold text-ink">Mot de passe</h2>

        {passwordError && (
          <div className="mb-4 rounded-lg border border-status-todo-text bg-status-todo-bg px-4 py-3 text-sm text-status-todo-text">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 rounded-lg border border-status-done-text bg-status-done-bg px-4 py-3 text-sm text-status-done-text">
            Mot de passe mis à jour avec succès.
          </div>
        )}

        <form
          onSubmit={handlePasswordSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="current-password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Mot de passe actuel
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Nouveau mot de passe
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPasswordSubmitting || !currentPassword || !newPassword}
            className="self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPasswordSubmitting
              ? "Enregistrement..."
              : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
