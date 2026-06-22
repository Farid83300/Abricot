import TaskKanbanCard from "./TaskKanbanCard";
import type { Task, TaskStatus } from "@/types/api";

interface Props {
  tasks: Task[];
  projectNames: Record<string, string>;
}

// CANCELLED est volontairement absent : les tâches annulées ne figurent pas dans le kanban
const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "À faire" },
  { status: "IN_PROGRESS", label: "En cours" },
  { status: "DONE", label: "Terminées" },
];

export default function TaskKanbanView({ tasks, projectNames }: Props) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0">
      {COLUMNS.map(({ status, label }) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            className="w-72 shrink-0 snap-start sm:w-auto sm:shrink"
          >
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-semibold text-ink">{label}</h2>
              <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-text-secondary">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {columnTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-text-secondary">
                  Aucune tâche
                </p>
              ) : (
                columnTasks.map((task) => (
                  <TaskKanbanCard
                    key={task.id}
                    task={task}
                    projectNames={projectNames}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
