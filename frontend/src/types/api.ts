// ============================================================
// Enums — valeurs exactes attendues par l'API (back fait foi)
// ============================================================

/** Statut d'une tâche. CANCELLED existe en base mais n'apparaît
 *  pas dans nos maquettes : on le garde pour rester fidèle à l'API. */
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

/** Priorité d'une tâche. Aucun champ dans les modales de création/édition :
 *  toute tâche créée depuis l'UI aura "MEDIUM" par défaut. */
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/** Rôle d'un membre dans project_members.
 *  ⚠️ Le propriétaire N'EST PAS dans cette table (voir Project.ownerId) :
 *  ces deux valeurs ne couvrent donc PAS le rôle "propriétaire". */
export type ProjectMemberRole = "ADMIN" | "CONTRIBUTOR";

/** Rôle calculé côté FRONT pour la logique de permissions.
 *  "OWNER" est déduit (user.id === project.ownerId), jamais reçu de l'API. */
export type ProjectRole = "OWNER" | "ADMIN" | "CONTRIBUTOR" | "NONE";

// ============================================================
// Entités — miroir des schémas Swagger / Prisma
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  role: ProjectMemberRole;
  user: User;
  joinedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAssignee {
  id: string;
  userId: string;
  taskId: string;
  user: User;
  assignedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  creatorId: string;
  assignees: TaskAssignee[];
  comments: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// Enveloppe de réponse API — vu dans swagger.ts (Success / Error)
// ============================================================

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: { field: string; message: string }[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================
// Payloads d'authentification
// ============================================================

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================
// Payloads de création / modification — basés sur les modales Figma
// ============================================================

export interface ProjectInput {
  name: string;
  description: string;
  /** IDs des contributeurs sélectionnés dans la modale */
  memberIds?: string[];
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate?: string;
  status?: TaskStatus;
  /** IDs des utilisateurs assignés */
  assigneeIds?: string[];
}
