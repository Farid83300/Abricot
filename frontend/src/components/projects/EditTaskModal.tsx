"use client";

import { useEffect, useState } from "react";
import { ApiError, searchUsers, updateTask } from "@/lib/api";
import type { Task, TaskStatus, User } from "@/types/api";

interface Props {
  isOpen: boolean;
  projectId: string;
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "TODO",
    label: "À faire",
    activeClass: "bg-status-todo-bg text-status-todo-text",
  },
  {
    value: "IN_PROGRESS",
    label: "En cours",
    activeClass: "bg-status-progress-bg text-status-progress-text",
  },
  {
    value: "DONE",
    label: "Terminée",
    activeClass: "bg-status-done-bg text-status-done-text",
  },
];

function formatDateForInput(dateString?: string): string {
  if (!dateString) return "";
  return dateString.slice(0, 10); // "2024-03-10T00:00:00.000Z" → "2024-03-10"
}

export default function EditTaskModal({
  isOpen,
  projectId,
  task,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    task.assignees.map((a) => a.user),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialise les champs à l'ouverture sur cette tâche
  useEffect(() => {
    if (isOpen) {
      // Règle trop stricte pour ce pattern standard (réinitialiser un formulaire à l'ouverture) :
      // cf. https://github.com/facebook/react/issues/34743
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(formatDateForInput(task.dueDate));
      setStatus(task.status);
      setSelectedUsers(task.assignees.map((a) => a.user));
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
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
      await updateTask(projectId, task.id, {
        title,
        description,
        dueDate,
        status,
        assigneeIds: selectedUsers.map((u) => u.id),
      });
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
        aria-labelledby="edit-task-modal-title"
        className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-5 shadow-xl sm:p-8"
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
          id="edit-task-modal-title"
          className="mb-6 text-2xl font-semibold text-ink"
        >
          Modifier
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
              htmlFor="edit-task-title"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Titre
            </label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-description"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Description
            </label>
            <input
              id="edit-task-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-due-date"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Échéance
            </label>
            <input
              id="edit-task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-assignee-search"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Assigné à :
            </label>
            <input
              id="edit-task-assignee-search"
              type="text"
              placeholder="Choisir un ou plusieurs collaborateurs"
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

          {/* Pills de statut — actives ici, contrairement à la création */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Statut :
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    status === option.value
                      ? option.activeClass
                      : "bg-border text-text-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title || !description}
            className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </>
  );
}
