"use client";

import { useState } from "react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import TaskCommentsSection from "@/components/projects/TaskCommentsSection";
import TaskActionsMenu from "@/components/projects/TaskActionsMenu";
import EditTaskModal from "@/components/projects/EditTaskModal";
import { deleteTask } from "@/lib/api";
import { formatDate, STATUS_LABELS } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/api";

export type StatusFilter = TaskStatus | "ALL";
type ViewMode = "list" | "calendar";

interface Props {
  projectId: string;
  tasks: Task[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  onTasksChanged: () => void;
}

export default function ProjectTaskList({
  projectId,
  tasks,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onTasksChanged,
}: Props) {
  const [view, setView] = useState<ViewMode>("list");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => statusFilter === "ALL" || t.status === statusFilter);

  async function handleDelete(task: Task) {
    if (!confirm(`Supprimer la tâche "${task.title}" ?`)) return;
    try {
      await deleteTask(projectId, task.id);
      onTasksChanged();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold text-ink">Tâches</h2>
          <p className="text-sm text-text-secondary">Par ordre de priorité</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-1 rounded-lg bg-status-progress-bg p-1">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium sm:flex-initial ${
                view === "list"
                  ? "bg-surface text-primary"
                  : "text-text-secondary"
              }`}
            >
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Liste
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium sm:flex-initial ${
                view === "calendar"
                  ? "bg-surface text-primary"
                  : "text-text-secondary"
              }`}
            >
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Calendrier
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as StatusFilter)
            }
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-ink focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:w-auto"
          >
            <option value="ALL">Statut</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Rechercher une tâche"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:w-56"
          />
        </div>
      </div>

      {view === "calendar" ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          Vue calendrier à venir.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">
              Aucune tâche.
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-ink">{task.title}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="mb-3 text-sm text-text-secondary">
                      {task.description}
                    </p>

                    {/* Échéance + assignés : deux lignes séparées comme sur la maquette */}
                    <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          Échéance :
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span className="mt-2.5">
                        Assigné à :{" "}
                        {task.assignees.map((a) => a.user.name).join(", ")}
                      </span>
                    </div>
                  </div>

                  <TaskActionsMenu
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => handleDelete(task)}
                  />
                </div>

                <TaskCommentsSection
                  projectId={projectId}
                  taskId={task.id}
                  initialComments={task.comments}
                />
              </div>
            ))
          )}
        </div>
      )}

      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          projectId={projectId}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null);
            onTasksChanged();
          }}
        />
      )}
    </div>
  );
}
