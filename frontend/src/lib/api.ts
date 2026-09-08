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
import { IS_MOCK_MODE } from "@/lib/env";
import * as mockApi from "@/lib/mockApi";
import { ApiError } from "@/lib/apiError";

export { ApiError };

// Vide en dev : les requêtes passent par le proxy Next.js (next.config.ts)
// pour éviter le CORS avec le backend sur le port 8000.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_COOKIE_NAME = "abricot_token";
// Utilisé uniquement en mode démo (IS_MOCK_MODE) pour que getToken() renvoie
// toujours une valeur, sans dépendre du cookie réel.
const MOCK_TOKEN = "mock-token";

// ============================================================
// Gestion du token JWT (cookie plutôt que localStorage, cf. README backend)
// ============================================================

export function getToken(): string | null {
  if (IS_MOCK_MODE) return MOCK_TOKEN;
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
// Authentification
// ============================================================

export function register(payload: RegisterPayload) {
  if (IS_MOCK_MODE) return mockApi.register();
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  if (IS_MOCK_MODE) return mockApi.login();
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  if (IS_MOCK_MODE) return mockApi.getProfile();
  return apiFetch<ProfileResponse>("/api/auth/profile");
}

export function updateProfile(payload: UpdateProfilePayload) {
  if (IS_MOCK_MODE) return mockApi.updateProfile(payload);
  return apiFetch<UpdateProfileResponse>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updatePassword(payload: UpdatePasswordPayload) {
  if (IS_MOCK_MODE) return mockApi.updatePassword();
  return apiFetch<null>("/api/auth/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ============================================================
// Dashboard
// ============================================================

export function getAssignedTasks() {
  if (IS_MOCK_MODE) return mockApi.getAssignedTasks();
  return apiFetch<DashboardTasksResponse>("/api/dashboard/assigned-tasks");
}

// Ne renvoie que les projets ayant au moins une tâche (filtre côté API),
// à la différence de getProjects() qui liste tous les projets.
export function getProjectsWithTasks() {
  if (IS_MOCK_MODE) return mockApi.getProjectsWithTasks();
  return apiFetch<DashboardProjectsResponse>(
    "/api/dashboard/projects-with-tasks",
  );
}

// ============================================================
// Projets
// ============================================================

export function getProjects() {
  if (IS_MOCK_MODE) return mockApi.getProjects();
  return apiFetch<ProjectsResponse>("/api/projects");
}

export function getProject(projectId: string) {
  if (IS_MOCK_MODE) return mockApi.getProject(projectId);
  return apiFetch<SingleProjectResponse>(`/api/projects/${projectId}`);
}

export function getProjectTasks(projectId: string) {
  if (IS_MOCK_MODE) return mockApi.getProjectTasks(projectId);
  return apiFetch<ProjectTasksResponse>(`/api/projects/${projectId}/tasks`);
}

export function createProject(payload: ProjectInput) {
  if (IS_MOCK_MODE) return mockApi.createProject(payload);
  return apiFetch<CreateProjectResponse>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
) {
  if (IS_MOCK_MODE) return mockApi.updateProject(projectId, payload);
  return apiFetch<UpdateProjectResponse>(`/api/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Réservé au OWNER — le backend vérifie les permissions
export function deleteProject(projectId: string) {
  if (IS_MOCK_MODE) return mockApi.deleteProject(projectId);
  return apiFetch<void>(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
}

// Ajoute un contributeur par email (pas par ID, contrairement aux assignees de tâche)
export function addContributor(
  projectId: string,
  payload: AddContributorPayload,
) {
  if (IS_MOCK_MODE) return mockApi.addContributor(projectId, payload);
  return apiFetch<Project>(`/api/projects/${projectId}/contributors`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function removeContributor(projectId: string, userId: string) {
  if (IS_MOCK_MODE) return mockApi.removeContributor(projectId, userId);
  return apiFetch<void>(`/api/projects/${projectId}/contributors/${userId}`, {
    method: "DELETE",
  });
}

// ============================================================
// Tâches
// Le statut n'est volontairement pas accepté ici : l'API force toujours
// TODO à la création, quel que soit le payload envoyé.
// ============================================================

export function createTask(projectId: string, payload: CreateTaskPayload) {
  if (IS_MOCK_MODE) return mockApi.createTask(projectId, payload);
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
  if (IS_MOCK_MODE) return mockApi.updateTask(projectId, taskId, payload);
  return apiFetch<UpdateTaskResponse>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteTask(projectId: string, taskId: string) {
  if (IS_MOCK_MODE) return mockApi.deleteTask(projectId, taskId);
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
  if (IS_MOCK_MODE) return mockApi.createComment(projectId, taskId, payload);
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
  if (IS_MOCK_MODE) return mockApi.searchUsers(query);
  return apiFetch<SearchUsersResponse>(
    `/api/users/search?query=${encodeURIComponent(query)}`,
  );
}
