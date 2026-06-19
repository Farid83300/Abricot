"use client";

import { useEffect, useState } from "react";
import {
  addContributor,
  ApiError,
  removeContributor,
  searchUsers,
  updateProject,
} from "@/lib/api";
import type { Project, User } from "@/types/api";

interface Props {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

function memberToUser(project: Project): User[] {
  return (
    project.members?.map((m) => ({
      id: m.user.id,
      email: m.user.email,
      name: m.user.name,
    })) ?? []
  );
}

export default function EditProjectModal({
  isOpen,
  project,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialise les champs à l'ouverture (ou si le projet affiché change)
  useEffect(() => {
    if (isOpen) {
      // Règle trop stricte pour ce pattern standard (réinitialiser un formulaire à l'ouverture) :
      // cf. https://github.com/facebook/react/issues/34743
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(project.name);
      setDescription(project.description);
      setSelectedUsers(memberToUser(project));
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen, project]);

  // Recherche dynamique de contributeurs
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      // Règle trop stricte pour ce pattern standard (vider un résultat de recherche) :
      // cf. https://github.com/facebook/react/issues/34743
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchUsers(searchQuery)
        .then((result) => setSearchResults(result.users))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  function toggleUser(user: User) {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Met à jour titre + description
      await updateProject(project.id, { name, description });

      // 2. Calcule la différence entre membres initiaux et sélection actuelle
      const initialIds = new Set(memberToUser(project).map((u) => u.id));
      const selectedIds = new Set(selectedUsers.map((u) => u.id));

      const toAdd = selectedUsers.filter((u) => !initialIds.has(u.id));
      const toRemove = memberToUser(project).filter(
        (u) => !selectedIds.has(u.id),
      );

      for (const user of toAdd) {
        await addContributor(project.id, { email: user.email });
      }
      for (const user of toRemove) {
        await removeContributor(project.id, user.id);
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-8 shadow-xl"
      >
        <button
          onClick={onClose}
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

        <h2
          id="edit-modal-title"
          className="mb-6 text-2xl font-semibold text-ink"
        >
          Modifier un projet
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
          <div>
            <label
              htmlFor="edit-project-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Titre*
            </label>
            <input
              id="edit-project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-project-description"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Description*
            </label>
            <input
              id="edit-project-description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-contributor-search"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Contributeurs
            </label>
            <input
              id="edit-contributor-search"
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />

            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-white">
                {searchResults.map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => {
                      toggleUser(user);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-background"
                  >
                    <span className="text-sm text-ink">{user.name}</span>
                    <span className="text-xs text-text-secondary">
                      {user.email}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="flex items-center gap-1 rounded-full bg-border px-3 py-1 text-xs text-ink"
                  >
                    {user.name}
                    <button
                      type="button"
                      onClick={() => toggleUser(user)}
                      className="text-text-secondary hover:text-status-todo-text"
                      aria-label={`Retirer ${user.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name || !description}
            className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </>
  );
}
