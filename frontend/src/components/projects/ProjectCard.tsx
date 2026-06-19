import Link from "next/link";
import { calculateProgress } from "@/lib/utils";
import type { ProjectWithTasks } from "@/types/api";

interface Props {
  project: ProjectWithTasks;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProjectCard({ project }: Props) {
  const { percent, done, total } = calculateProgress(project.tasks);
  const memberCount = (project.members?.length ?? 0) + 1; // +1 pour le owner

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
    >
      <h3 className="mb-1 font-semibold text-ink">{project.name}</h3>
      <p className="mb-4 text-sm text-text-secondary line-clamp-2">
        {project.description}
      </p>

      {/* Progression */}
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-text-secondary">Progression</span>
        <span className="font-medium text-ink">{percent}%</span>
      </div>
      <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mb-4 text-xs text-text-secondary">
        {done}/{total} tâches terminées
      </p>

      {/* Équipe */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <svg
          className="h-4 w-4"
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
        Équipe ({memberCount})
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Propriétaire */}
        {project.owner && (
          <span className="rounded-full bg-status-progress-bg px-3 py-1 text-xs font-medium text-status-progress-text">
            {getInitials(project.owner.name)} Propriétaire
          </span>
        )}
        {/* Contributeurs */}
        {project.members?.slice(0, 2).map((m) => (
          <span
            key={m.id}
            className="rounded-full bg-border px-3 py-1 text-xs font-medium text-text-secondary"
          >
            {getInitials(m.user.name)}
          </span>
        ))}
      </div>
    </Link>
  );
}
