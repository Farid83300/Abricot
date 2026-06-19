"use client";

import { useState } from "react";
import { createComment } from "@/lib/api";
import type { Comment } from "@/types/api";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCommentDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

interface Props {
  projectId: string;
  taskId: string;
  initialComments: Comment[];
}

export default function TaskCommentsSection({
  projectId,
  taskId,
  initialComments,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSend() {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await createComment(projectId, taskId, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, result.comment]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-sm font-medium text-ink"
      >
        Commentaires ({comments.length})
        <svg
          className={`h-4 w-4 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-xs font-semibold text-text-secondary">
                {getInitials(comment.author.name)}
              </span>
              <div className="flex-1 rounded-xl bg-background p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatCommentDate(comment.createdAt ?? "")}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{comment.content}</p>
              </div>
            </div>
          ))}

          {/* Zone d'ajout */}
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {/* Initiales de l'utilisateur connecté — à passer en prop si besoin */}
              ··
            </span>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows={2}
                className="w-full rounded-xl bg-background p-3 text-sm text-ink placeholder:text-text-placeholder focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newComment.trim() || isSubmitting}
                  className="rounded-lg bg-border px-4 py-2 text-sm font-semibold text-text-secondary enabled:bg-ink enabled:text-white enabled:hover:opacity-90 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
