import type { Project, ProjectRole, Task, TaskStatus } from "@/types/api";

// Formate une date ISO en "9 mars", "15 juin"…
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(dateString));
}

// Mapping statut API → label français
export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

// Mapping statut → classes Tailwind (bg + text)
export const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-status-todo-bg text-status-todo-text",
  IN_PROGRESS: "bg-status-progress-bg text-status-progress-text",
  DONE: "bg-status-done-bg text-status-done-text",
  CANCELLED: "bg-status-todo-bg text-status-todo-text",
};

// Calcule le rôle d'un utilisateur sur un projet
export function getProjectRole(project: Project, userId: string): ProjectRole {
  if (project.ownerId === userId) return "OWNER";
  const member = project.members?.find((m) => m.user.id === userId);
  if (!member) return "NONE";
  return member.role;
}

export function calculateProgress(tasks: Task[]): {
  percent: number;
  done: number;
  total: number;
} {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { percent, done, total };
}
