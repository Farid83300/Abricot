"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/lib/api";
import type { User } from "@/types/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la liste des utilisateurs
  useEffect(() => {
    if (isOpen) {
      getUsers().then(setUsers).catch(console.error);
    }
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  function toggleUser(id: string) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // On ajoutera l'appel API createProject() à la prochaine étape
      // quand on aura confirmé la route exacte du back
      console.log("Créer projet :", { name, description, selectedUserIds });
      onSuccess();
      onClose();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setName("");
    setDescription("");
    setSelectedUserIds([]);
    setError(null);
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Fond sombre */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modale */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-8 shadow-xl"
      >
        {/* Bouton fermer */}
        <button
          onClick={() => {
            onClose();
            handleReset();
          }}
          className="absolute top-5 right-5 text-text-secondary hover:text-ink"
          aria-label="Fermer"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 id="modal-title" className="mb-6 text-2xl font-semibold text-ink">
          Créer un projet
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-status-todo-text bg-status-todo-bg px-4 py-3 text-sm text-status-todo-text">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Titre */}
          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Titre*
            </label>
            <input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="project-description"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Description*
            </label>
            <input
              id="project-description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Contributeurs */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Contributeurs
            </label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-white">
              {users.length === 0 ? (
                <p className="p-3 text-sm text-text-secondary">Chargement...</p>
              ) : (
                users.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-background"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-ink">{user.name}</span>
                    <span className="text-xs text-text-secondary">
                      {user.email}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedUserIds.length > 0 && (
              <p className="mt-1 text-xs text-text-secondary">
                {selectedUserIds.length} collaborateur
                {selectedUserIds.length > 1 ? "s" : ""} sélectionné
                {selectedUserIds.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isSubmitting || !name || !description}
            className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Création en cours..." : "Ajouter un projet"}
          </button>
        </form>
      </div>
    </>
  );
}
