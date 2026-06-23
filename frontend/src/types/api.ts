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

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
  assigneeIds?: string[];
}

export interface CreateTaskResponse {
  task: Task;
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

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

// ============================================================
// Réponses spécifiques des endpoints
// ============================================================

export interface DashboardTasksResponse {
  tasks: Task[];
}

export interface DashboardProjectsResponse {
  projects: ProjectWithTasks[];
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface ProfileResponse {
  user: User;
}

export interface SearchUsersResponse {
  users: User[];
}

export interface CreateProjectResponse {
  project: Project;
}

// Réponse de GET /projects/:id
export interface SingleProjectResponse {
  project: Project;
}

// Réponse de GET /projects/:id/tasks
export interface ProjectTasksResponse {
  tasks: Task[];
}

// ============================================================
// Enveloppe de réponse API
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
// Auth
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
// Payloads CRUD
// ============================================================

export interface ProjectInput {
  name: string;
  description?: string;
  contributors?: string[];
}

export interface AddContributorPayload {
  email: string;
  role?: "ADMIN" | "CONTRIBUTOR";
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate?: string;
  status?: TaskStatus;
  assigneeIds?: string[];
}

export interface CreateCommentPayload {
  content: string;
}

export interface CreateCommentResponse {
  comment: Comment;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}

export interface UpdateProjectResponse {
  project: Project;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
