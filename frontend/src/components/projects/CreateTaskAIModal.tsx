"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (description: string) => void;
}

export default function CreateTaskAIModal({
  isOpen,
  onClose,
  onGenerate,
}: Props) {
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!description.trim()) return;
    onGenerate(description.trim());
    setDescription("");
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
        aria-labelledby="ai-create-title"
        className="fixed top-1/2 left-1/2 z-50 flex h-125 w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-surface p-8 shadow-xl"
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

        <div className="flex items-center gap-2">
          <Image
            src="/ai-star-orange.svg"
            alt=""
            width={18}
            height={18}
            style={{ width: "18px", height: "18px" }}
          />
          <h2 id="ai-create-title" className="text-2xl font-semibold text-ink">
            Créer une tâche
          </h2>
        </div>

        {/* Espace flexible — vide, comme sur la maquette */}
        <div className="flex-1" />

        {/* Barre de saisie collée en bas */}
        <div className="flex items-center gap-3 rounded-full bg-background px-5 py-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Décrivez les tâches que vous souhaitez ajouter..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-text-placeholder focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Générer"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}
