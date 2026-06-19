"use client";

import { useEffect, useState } from "react";
import { getProjectsWithTasks } from "@/lib/api";
import ProjectCard from "@/components/projects/ProjectCard";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import type { ProjectWithTasks } from "@/types/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getProjectsWithTasks()
      .then((result) => {
        setProjects(Array.isArray(result.projects) ? result.projects : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Mes projets</h1>
          <p className="mt-1 text-sm text-text-secondary">Gérez vos projets</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          + Créer un projet
        </button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          Chargement...
        </p>
      ) : projects.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          Aucun projet pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
