import type {
  ApiResponse,
  AddContributorPayload,
  AuthResponse,
  CreateProjectResponse,
  CreateCommentPayload,
  CreateCommentResponse,
  DashboardProjectsResponse,
  DashboardTasksResponse,
  LoginPayload,
  ProfileResponse,
  Project,
  ProjectInput,
  ProjectsResponse,
  ProjectTasksResponse,
  RegisterPayload,
  SearchUsersResponse,
  SingleProjectResponse,
  UpdateProjectPayload,
  UpdateProjectResponse,
  CreateTaskPayload,
  CreateTaskResponse,
  UpdateTaskPayload,
  UpdateTaskResponse,
  UpdateProfilePayload,
  UpdatePasswordPayload,
  UpdateProfileResponse,
} from "@/types/api";

// Vide en dev : les requêtes passent par le proxy Next.js (next.config.ts)
// pour éviter le CORS avec le backend sur le port 8000.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_COOKIE_NAME = "abricot_token";

// ============================================================
// Gestion du token JWT (cookie plutôt que localStorage, cf. README backend)
// ============================================================

export function getToken(): string | null {
  if (typeof document === "undefined") return null; // SSR : pas de document
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  if (typeof document === "undefined") return;
  // 7 jours, SameSite=Strict pour limiter le risque CSRF
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; max-age=0; path=/`;
}

// ============================================================
// Erreur API typée — porte le message et le détail de validation
// renvoyés par l'enveloppe { success: false, message, details }
// ============================================================

export class ApiError extends Error {
  details?: { field: string; message: string }[];
  constructor(
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

// Wrapper fetch central : injecte le token, déballe l'enveloppe
// { success, data }, et transforme les échecs en ApiError.
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const json: ApiResponse<T> = await response.json();
  if (!json.success) {
    throw new ApiError(json.message, json.details);
  }
  return json.data;
}

// ============================================================
// Auth
// ============================================================

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return apiFetch<ProfileResponse>("/api/auth/profile");
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiFetch<UpdateProfileResponse>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updatePassword(payload: UpdatePasswordPayload) {
  return apiFetch<null>("/api/auth/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ============================================================
// Dashboard
// ============================================================

export function getAssignedTasks() {
  return apiFetch<DashboardTasksResponse>("/api/dashboard/assigned-tasks");
}

// Ne renvoie que les projets ayant au moins une tâche (filtre côté API),
// à la différence de getProjects() qui liste tous les projets.
export function getProjectsWithTasks() {
  return apiFetch<DashboardProjectsResponse>(
    "/api/dashboard/projects-with-tasks",
  );
}

// ============================================================
// Projets
// ============================================================

export function getProjects() {
  return apiFetch<ProjectsResponse>("/api/projects");
}

export function getProject(projectId: string) {
  return apiFetch<SingleProjectResponse>(`/api/projects/${projectId}`);
}

export function getProjectTasks(projectId: string) {
  return apiFetch<ProjectTasksResponse>(`/api/projects/${projectId}/tasks`);
}

export function createProject(payload: ProjectInput) {
  return apiFetch<CreateProjectResponse>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
) {
  return apiFetch<UpdateProjectResponse>(`/api/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Ajoute un contributeur par email (pas par ID, contrairement aux assignees de tâche)
export function addContributor(
  projectId: string,
  payload: AddContributorPayload,
) {
  return apiFetch<Project>(`/api/projects/${projectId}/contributors`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function removeContributor(projectId: string, userId: string) {
  return apiFetch<void>(`/api/projects/${projectId}/contributors/${userId}`, {
    method: "DELETE",
  });
}

// ============================================================
// Tâches
// ============================================================

// Le statut n'est volontairement pas accepté ici : l'API force toujours
// TODO à la création, quel que soit le payload envoyé.
export function createTask(projectId: string, payload: CreateTaskPayload) {
  return apiFetch<CreateTaskResponse>(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload,
) {
  return apiFetch<UpdateTaskResponse>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteTask(projectId: string, taskId: string) {
  return apiFetch<void>(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// ============================================================
// Commentaires
// ============================================================

export function createComment(
  projectId: string,
  taskId: string,
  payload: CreateCommentPayload,
) {
  return apiFetch<CreateCommentResponse>(
    `/api/projects/${projectId}/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

// ============================================================
// Utilisateurs
// ============================================================

// query minimum 2 caractères côté API
export function searchUsers(query: string) {
  return apiFetch<SearchUsersResponse>(
    `/api/users/search?query=${encodeURIComponent(query)}`,
  );
}
