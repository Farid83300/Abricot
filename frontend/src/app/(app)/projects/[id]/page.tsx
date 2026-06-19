"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createTask, getProject, getProjectTasks } from "@/lib/api";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectTaskList, {
  type StatusFilter,
} from "@/components/projects/ProjectTaskList";
import EditProjectModal from "@/components/projects/EditProjectModal";
import CreateTaskModal from "@/components/projects/CreateTaskModal";
import CreateTaskAIModal from "@/components/projects/CreateTaskAIModal";
import ReviewAITasksModal, {
  type DraftTask,
} from "@/components/projects/ReviewAITasksModal";
import type { Project, Task } from "@/types/api";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // --- IA (façade) ---
  const [isAICreateOpen, setIsAICreateOpen] = useState(false);
  const [isAIReviewOpen, setIsAIReviewOpen] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<DraftTask[]>([]);
  const [isCreatingAITasks, setIsCreatingAITasks] = useState(false);

  function loadData() {
    setIsLoading(true);
    Promise.all([getProject(id), getProjectTasks(id)])
      .then(([projectResult, tasksResult]) => {
        setProject(projectResult.project);
        setTasks(Array.isArray(tasksResult.tasks) ? tasksResult.tasks : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    // Règle trop stricte pour ce pattern standard (chargement initial des données) :
    // cf. https://github.com/facebook/react/issues/34743
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Simulation locale de génération de tâches — à remplacer plus tard
  // par un vrai appel à une API d'IA si cette fonctionnalité est développée.
  function generateDraftTasks(description: string): DraftTask[] {
    const sentences = description
      .split(/[.,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const base = sentences.length > 0 ? sentences : [description];

    return base.slice(0, 3).map((sentence, index) => ({
      id: `draft-${Date.now()}-${index}`,
      title: sentence.length > 50 ? sentence.slice(0, 50) + "..." : sentence,
      description: sentence,
    }));
  }

  function handleAIGenerate(description: string) {
    setAiDrafts(generateDraftTasks(description));
    setIsAICreateOpen(false);
    setIsAIReviewOpen(true);
  }

  function handleUpdateDraft(
    draftId: string,
    field: "title" | "description",
    value: string,
  ) {
    setAiDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, [field]: value } : d)),
    );
  }

  function handleRemoveDraft(draftId: string) {
    setAiDrafts((prev) => prev.filter((d) => d.id !== draftId));
  }

  async function handleConfirmAITasks() {
    setIsCreatingAITasks(true);
    try {
      for (const draft of aiDrafts) {
        await createTask(id, {
          title: draft.title,
          description: draft.description,
        });
      }
      setIsAIReviewOpen(false);
      setAiDrafts([]);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingAITasks(false);
    }
  }

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">
        Chargement...
      </p>
    );
  }

  if (!project) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">
        Projet introuvable.
      </p>
    );
  }

  return (
    <div>
      <ProjectHeader
        project={project}
        onCreateTask={() => setIsCreateTaskModalOpen(true)}
        onEdit={() => setIsEditModalOpen(true)}
        onOpenAI={() => setIsAICreateOpen(true)}
      />

      <ProjectTaskList
        projectId={id}
        tasks={tasks}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        project={project}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadData}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        projectId={id}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSuccess={loadData}
      />

      <CreateTaskAIModal
        isOpen={isAICreateOpen}
        onClose={() => setIsAICreateOpen(false)}
        onGenerate={handleAIGenerate}
      />

      <ReviewAITasksModal
        isOpen={isAIReviewOpen}
        drafts={aiDrafts}
        isCreating={isCreatingAITasks}
        onClose={() => setIsAIReviewOpen(false)}
        onUpdateDraft={handleUpdateDraft}
        onRemoveDraft={handleRemoveDraft}
        onConfirm={handleConfirmAITasks}
      />
    </div>
  );
}
