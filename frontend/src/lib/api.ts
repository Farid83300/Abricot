import type {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  Project,
  RegisterPayload,
  Task,
  User,
} from "@/types/api";

// ============================================================
// Configuration
// ============================================================

// Vide = URLs relatives → proxy Next.js → backend:8000 (évite le CORS)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const TOKEN_COOKIE_NAME = "abricot_token";

// ============================================================
// Stockage du token (cookie, pas localStorage)
// ============================================================

export function getToken(): string | null {
  if (typeof document === "undefined") return null; // SSR safety

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  if (typeof document === "undefined") return;

  // 7 jours, SameSite=Strict pour limiter le risque CSRF.
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
}

// ============================================================
// Erreur API typée — exploite l'enveloppe { success, error, details }
// ============================================================

export class ApiError extends Error {
  details?: { field: string; message: string }[];

  constructor(message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

// ============================================================
// Wrapper fetch générique
// ============================================================

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
  return apiFetch<User>("/api/auth/profile");
}

// ============================================================
// Tableau de bord
// ============================================================

export function getAssignedTasks() {
  return apiFetch<Task[]>("/api/dashboard/assigned-tasks");
}

export function getProjectsWithTasks() {
  return apiFetch<Project[]>("/api/dashboard/projects-with-tasks");
}

// ============================================================
// Projets
// ============================================================

export function getProjects() {
  return apiFetch<Project[]>("/api/projects");
}

export function getProjectTasks(projectId: string) {
  return apiFetch<Task[]>(`/api/projects/${projectId}/tasks`);
}

// ============================================================
// Utilisateurs
// ============================================================

export function getUsers() {
  return apiFetch<User[]>("/api/users");
}
