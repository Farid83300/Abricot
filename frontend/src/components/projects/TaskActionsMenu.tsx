"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskActionsMenu({ onEdit, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // L'écouteur n'est attaché que quand le menu est ouvert pour éviter un listener permanent
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-ink"
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-background"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-status-todo-text hover:bg-status-todo-bg"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
