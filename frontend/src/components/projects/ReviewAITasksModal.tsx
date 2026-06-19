"use client";

import { useState } from "react";

export interface DraftTask {
  id: string;
  title: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  drafts: DraftTask[];
  isCreating: boolean;
  onClose: () => void;
  onUpdateDraft: (
    id: string,
    field: "title" | "description",
    value: string,
  ) => void;
  onRemoveDraft: (id: string) => void;
  onConfirm: () => void;
  onAddMore: (description: string) => void;
}

export default function ReviewAITasksModal({
  isOpen,
  drafts,
  isCreating,
  onClose,
  onUpdateDraft,
  onRemoveDraft,
  onConfirm,
  onAddMore,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState("");

  function handleAddMore() {
    if (!newDescription.trim()) return;
    onAddMore(newDescription.trim());
    setNewDescription("");
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
        aria-labelledby="ai-review-title"
        className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-surface p-8 shadow-xl"
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
          id="ai-review-title"
          className="mb-6 flex items-center gap-2 text-2xl font-semibold text-ink"
        >
          <span className="text-primary">✦</span> Vos tâches...
        </h2>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {drafts.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">
              Aucune tâche générée.
            </p>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                {editingId === draft.id ? (
                  <>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) =>
                        onUpdateDraft(draft.id, "title", e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="mb-1 w-full border-b border-dashed border-primary bg-transparent font-semibold text-ink focus:outline-none"
                    />
                    <textarea
                      value={draft.description}
                      onChange={(e) =>
                        onUpdateDraft(draft.id, "description", e.target.value)
                      }
                      rows={2}
                      className="mb-3 w-full border-b border-dashed border-primary bg-transparent text-sm text-text-secondary focus:outline-none"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-ink">{draft.title}</h3>
                    <p className="mb-3 text-sm text-text-secondary">
                      {draft.description}
                    </p>
                  </>
                )}

                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onRemoveDraft(draft.id)}
                    className="flex items-center gap-1 text-text-secondary hover:text-status-todo-text"
                  >
                    🗑 Supprimer
                  </button>
                  <span className="text-border">|</span>
                  <button
                    type="button"
                    onClick={() => setEditingId(draft.id)}
                    className="flex items-center gap-1 text-text-secondary hover:text-ink"
                  >
                    ✎ Modifier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={drafts.length === 0 || isCreating}
          className="mt-4 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? "Création..." : "+ Ajouter les tâches"}
        </button>

        {/* Barre de saisie persistante pour ajouter d'autres tâches */}
        <div className="mt-6 flex items-center gap-3 rounded-full bg-background px-5 py-3">
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddMore();
            }}
            placeholder="Décrivez les tâches que vous souhaitez ajouter..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-text-placeholder focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddMore}
            disabled={!newDescription.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Générer d'autres tâches"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}
