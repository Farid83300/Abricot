import Link from "next/link";
import { formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import type { Task } from "@/types/api";

interface Props {
  task: Task;
  projectNames: Record<string, string>;
}

export default function TaskCard({ task, projectNames }: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-5">
      {/* Infos gauche */}
      <div className="flex-1 pr-8">
        <h3 className="mb-1 font-semibold text-ink">{task.title}</h3>
        <p className="mb-3 text-sm text-text-secondary line-clamp-1">
          {task.description}
        </p>

        <div className="mt-1 text-xs text-text-secondary">
          {/* Ligne 1 : projet | échéance avec icône calendrier | commentaires */}
          <div className="mb-1.5 flex items-center gap-4">
            {/* Projet */}
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              {projectNames[task.projectId] ?? "Projet"}
            </span>

            {/* Échéance + icône calendrier */}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Nombre de commentaires */}
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {task.comments?.length ?? 0}
            </span>
          </div>

          {/* Ligne 2 : assignés — toujours affichée, "Non assigné" si vide */}
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm-7 8v-2a4 4 0 014-4h6a4 4 0 014 4v2"
              />
            </svg>
            <span>
              {task.assignees && task.assignees.length > 0
                ? task.assignees.map((a) => a.user.name).join(", ")
                : "Non assigné"}
            </span>
          </div>
        </div>
      </div>

      {/* Droite : statut + bouton */}
      <div className="flex flex-col items-end gap-3">
        <StatusBadge status={task.status} />
        <Link
          href={`/projects/${task.projectId}`}
          className="rounded-lg bg-ink px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Voir
        </Link>
      </div>
    </div>
  );
}
