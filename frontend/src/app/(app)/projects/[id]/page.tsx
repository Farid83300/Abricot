"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  createTask,
  deleteProject,
  getProject,
  getProjectTasks,
} from "@/lib/api";
import { getProjectRole } from "@/lib/utils";
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
import type { Project, ProjectRole, Task } from "@/types/api";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
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
    setAccessError(null);
    Promise.all([getProject(id), getProjectTasks(id)])
      .then(([projectResult, tasksResult]) => {
        setProject(projectResult.project);
        setTasks(Array.isArray(tasksResult.tasks) ? tasksResult.tasks : []);
      })
      .catch((err) => {
        // Distingue "accès refusé" (non membre) de "projet introuvable"
        if (
          err instanceof ApiError &&
          err.message.toLowerCase().includes("accès")
        ) {
          setAccessError("Vous n'avez pas accès à ce projet.");
        } else {
          setAccessError("Projet introuvable.");
        }
      })
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

  // Flux IA en deux temps : saisie (CreateTaskAIModal) → révision (ReviewAITasksModal)
  function handleAIGenerate(description: string) {
    setAiDrafts(generateDraftTasks(description));
    setIsAICreateOpen(false);
    setIsAIReviewOpen(true);
  }

  function handleAddMoreDrafts(description: string) {
    setAiDrafts((prev) => [...prev, ...generateDraftTasks(description)]);
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

  // Suppression du projet — réservée au OWNER (vérifiée aussi côté backend)
  async function handleDelete() {
    if (
      !confirm(
        `Supprimer le projet "${project?.name}" ? Cette action est irréversible.`,
      )
    )
      return;

    try {
      await deleteProject(id);
      router.push("/projects");
    } catch (err) {
      console.error(err);
    }
  }

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">
        Chargement...
      </p>
    );
  }

  // Accès refusé ou projet introuvable — message explicite + lien de retour
  if (accessError) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-sm text-status-todo-text">{accessError}</p>
        <Link
          href="/projects"
          className="text-sm font-medium text-primary hover:underline"
        >
          Retour à mes projets
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <p className="py-12 text-center text-sm text-text-secondary">
        Projet introuvable.
      </p>
    );
  }

  // Calcule le rôle de l'utilisateur connecté sur ce projet
  // OWNER = ownerId correspond à user.id (hors table project_members)
  // ADMIN / CONTRIBUTOR = via la table project_members
  const userRole: ProjectRole = user
    ? getProjectRole(project, user.id)
    : "NONE";

  return (
    <div>
      <ProjectHeader
        project={project}
        userRole={userRole}
        onCreateTask={() => setIsCreateTaskModalOpen(true)}
        onEdit={() => setIsEditModalOpen(true)}
        onOpenAI={() => setIsAICreateOpen(true)}
        onDelete={handleDelete}
      />

      <ProjectTaskList
        projectId={id}
        tasks={tasks}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onTasksChanged={loadData}
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
        onAddMore={handleAddMoreDrafts}
      />
    </div>
  );
}
