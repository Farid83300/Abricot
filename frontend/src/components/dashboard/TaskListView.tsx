"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";
import type { Task } from "@/types/api";

interface Props {
  tasks: Task[];
  projectNames: Record<string, string>;
}

export default function TaskListView({ tasks, projectNames }: Props) {
  const [search, setSearch] = useState("");

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-7.5 rounded-xl border border-border bg-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-ink">Mes tâches assignées</h2>
          <p className="text-sm text-text-secondary">Par ordre de priorité</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une tâche"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-border bg-background py-2 pr-10 pl-4 text-sm text-ink placeholder:text-text-placeholder focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
          <svg
            className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            {search ? "Aucune tâche trouvée." : "Aucune tâche assignée."}
          </p>
        ) : (
          filtered.map((task) => (
            <TaskCard key={task.id} task={task} projectNames={projectNames} />
          ))
        )}
      </div>
    </div>
  );
}
