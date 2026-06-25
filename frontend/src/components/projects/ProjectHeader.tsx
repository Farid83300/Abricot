import Image from "next/image";
import Link from "next/link";
import type { Project, ProjectRole } from "@/types/api";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface Props {
  project: Project;
  userRole: ProjectRole;
  onCreateTask: () => void;
  onEdit: () => void;
  onOpenAI: () => void;
}

export default function ProjectHeader({
  project,
  userRole,
  onCreateTask,
  onEdit,
  onOpenAI,
}: Props) {
  const memberCount = (project.members?.length ?? 0) + 1;

  // OWNER et ADMIN peuvent modifier le projet et gérer les contributeurs
  const canEdit = userRole === "OWNER" || userRole === "ADMIN";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/projects"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-ink"
            aria-label="Retour"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-ink">
                {project.name}
              </h1>
              {/* Bouton Modifier — visible uniquement pour OWNER et ADMIN */}
              {canEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Modifier
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={onCreateTask}
            className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
          >
            Créer une tâche
          </button>
          <button
            type="button"
            onClick={onOpenAI}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
          >
            <Image
              src="/ai-star.svg"
              alt=""
              width={16}
              height={16}
              style={{ width: "16px", height: "16px" }}
              className="brightness-0 invert"
            />
            IA
          </button>
        </div>
      </div>

      {/* Bandeau contributeurs — label à gauche, pills à droite */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="text-md font-medium text-ink">
          Contributeurs {memberCount} personne{memberCount > 1 ? "s" : ""}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {project.owner && (
            <span className="whitespace-nowrap rounded-full bg-status-progress-bg px-3 py-1 text-xs font-medium text-status-progress-text">
              {getInitials(project.owner.name)} Propriétaire
            </span>
          )}
          {project.members?.map((m) => (
            <span
              key={m.id}
              className="whitespace-nowrap rounded-full bg-border px-3 py-1 text-xs font-medium text-text-secondary"
            >
              {getInitials(m.user.name)} {m.user.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
