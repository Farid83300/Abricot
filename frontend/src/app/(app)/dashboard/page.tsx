"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedTasks, getProjects } from "@/lib/api";
import TaskListView from "@/components/dashboard/TaskListView";
import TaskKanbanView from "@/components/dashboard/TaskKanbanView";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import type { Task } from "@/types/api";

type View = "list" | "kanban";

export default function DashboardPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([getAssignedTasks(), getProjects()])
      .then(([tasksResult, projectsResult]) => {
        const taskArray = Array.isArray(tasksResult.tasks)
          ? tasksResult.tasks
          : [];
        setTasks(taskArray);

        const projectArray = Array.isArray(projectsResult.projects)
          ? projectsResult.projects
          : [];

        const names: Record<string, string> = {};
        projectArray.forEach((p) => {
          names[p.id] = p.name;
        });
        setProjectNames(names);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tableau de bord</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Bonjour {firstName}, voici un aperçu de vos projets et tâches
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          + Créer un projet
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "list"
              ? "bg-status-progress-bg text-ink"
              : "text-text-secondary hover:text-ink"
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Liste
        </button>
        <button
          onClick={() => setView("kanban")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            view === "kanban"
              ? "bg-status-progress-bg text-ink"
              : "text-text-secondary hover:text-ink"
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
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 012-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          Kanban
        </button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          Chargement...
        </p>
      ) : view === "list" ? (
        <TaskListView tasks={tasks} projectNames={projectNames} />
      ) : (
        <TaskKanbanView tasks={tasks} projectNames={projectNames} />
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
