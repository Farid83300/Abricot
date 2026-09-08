import { ApiError } from "@/lib/apiError";
import { CURRENT_USER_ID, mockProjects, mockTasks, mockUsers } from "@/lib/mockData";
import type {
  AddContributorPayload,
  AuthResponse,
  CreateCommentPayload,
  CreateCommentResponse,
  CreateProjectResponse,
  CreateTaskPayload,
  CreateTaskResponse,
  DashboardProjectsResponse,
  DashboardTasksResponse,
  Project,
  ProjectInput,
  ProjectsResponse,
  ProjectTasksResponse,
  ProjectWithTasks,
  ProfileResponse,
  SearchUsersResponse,
  SingleProjectResponse,
  Task,
  UpdateProfilePayload,
  UpdateProfileResponse,
  UpdateProjectPayload,
  UpdateProjectResponse,
  UpdateTaskPayload,
  UpdateTaskResponse,
  User,
} from "@/types/api";

// Implémentation "mode démo" de lib/api.ts : mêmes signatures, mais lit/mute
// un magasin en mémoire (initialisé depuis mockData.ts) au lieu d'appeler le
// backend. Les créations/modifications/suppressions sont réelles en mémoire
// le temps de la session — un rechargement de page réinitialise les données.
// Voir lib/env.ts (IS_MOCK_MODE) pour le point de bascule.

const users: User[] = mockUsers.map((u) => ({ ...u }));
let projects: Project[] = mockProjects.map((p) => ({
  ...p,
  members: p.members?.map((m) => ({ ...m })),
}));
let tasks: Task[] = mockTasks.map((t) => ({
  ...t,
  assignees: t.assignees.map((a) => ({ ...a })),
  comments: t.comments.map((c) => ({ ...c })),
}));

let nextId = 100;
function generateId(prefix: string): string {
  nextId += 1;
  return `mock-${prefix}-${nextId}`;
}

function currentUser(): User {
  const user = users.find((u) => u.id === CURRENT_USER_ID);
  if (!user) throw new ApiError("Utilisateur non trouvé");
  return user;
}

function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function requireProject(projectId: string): Project {
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new ApiError("Projet introuvable");
  return project;
}

function requireTask(projectId: string, taskId: string): Task {
  const task = tasks.find((t) => t.id === taskId && t.projectId === projectId);
  if (!task) throw new ApiError("Tâche introuvable");
  return task;
}

function delay<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

// ============================================================
// Auth
// ============================================================

export function login(): Promise<AuthResponse> {
  return delay({ user: currentUser(), token: "mock-token" });
}

export function register(): Promise<AuthResponse> {
  return delay({ user: currentUser(), token: "mock-token" });
}

export function getProfile(): Promise<ProfileResponse> {
  return delay({ user: currentUser() });
}

export function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  const user = currentUser();
  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email;
  return delay({ user: { ...user } });
}

export function updatePassword(): Promise<null> {
  return delay(null);
}

// ============================================================
// Dashboard
// ============================================================

export function getAssignedTasks(): Promise<DashboardTasksResponse> {
  const assignedTasks = tasks.filter((t) =>
    t.assignees.some((a) => a.userId === CURRENT_USER_ID),
  );
  return delay({ tasks: assignedTasks });
}

export function getProjectsWithTasks(): Promise<DashboardProjectsResponse> {
  const projectsWithTasks: ProjectWithTasks[] = projects
    .map((p) => ({ ...p, tasks: tasks.filter((t) => t.projectId === p.id) }))
    .filter((p) => p.tasks.length > 0);
  return delay({ projects: projectsWithTasks });
}

// ============================================================
// Projets
// ============================================================

export function getProjects(): Promise<ProjectsResponse> {
  return delay({ projects: [...projects] });
}

export function getProject(projectId: string): Promise<SingleProjectResponse> {
  return delay({ project: requireProject(projectId) });
}

export function getProjectTasks(projectId: string): Promise<ProjectTasksResponse> {
  requireProject(projectId);
  return delay({ tasks: tasks.filter((t) => t.projectId === projectId) });
}

export function createProject(payload: ProjectInput): Promise<CreateProjectResponse> {
  const owner = currentUser();
  const members = (payload.contributors ?? [])
    .map((email) => findUserByEmail(email))
    .filter((u): u is User => Boolean(u))
    .map((u) => ({
      id: generateId("member"),
      role: "CONTRIBUTOR" as const,
      user: u,
      joinedAt: new Date().toISOString(),
    }));

  const project: Project = {
    id: generateId("project"),
    name: payload.name,
    description: payload.description ?? "",
    ownerId: owner.id,
    owner,
    members,
    createdAt: new Date().toISOString(),
  };
  projects = [...projects, project];
  return delay({ project });
}

export function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<UpdateProjectResponse> {
  const project = requireProject(projectId);
  if (payload.name !== undefined) project.name = payload.name;
  if (payload.description !== undefined) project.description = payload.description;
  return delay({ project: { ...project } });
}

export function deleteProject(projectId: string): Promise<void> {
  requireProject(projectId);
  projects = projects.filter((p) => p.id !== projectId);
  tasks = tasks.filter((t) => t.projectId !== projectId);
  return delay(undefined);
}

export function addContributor(
  projectId: string,
  payload: AddContributorPayload,
): Promise<Project> {
  const project = requireProject(projectId);
  const user = findUserByEmail(payload.email);
  if (!user) {
    throw new ApiError("Aucun utilisateur trouvé avec cet email", [
      { field: "email", message: "Aucun utilisateur trouvé avec cet email" },
    ]);
  }
  const members = project.members ?? [];
  if (!members.some((m) => m.user.id === user.id)) {
    members.push({
      id: generateId("member"),
      role: payload.role ?? "CONTRIBUTOR",
      user,
      joinedAt: new Date().toISOString(),
    });
  }
  project.members = members;
  return delay({ ...project });
}

export function removeContributor(projectId: string, userId: string): Promise<void> {
  const project = requireProject(projectId);
  project.members = (project.members ?? []).filter((m) => m.user.id !== userId);
  return delay(undefined);
}

// ============================================================
// Tâches
// ============================================================

export function createTask(
  projectId: string,
  payload: CreateTaskPayload,
): Promise<CreateTaskResponse> {
  requireProject(projectId);
  const assignees = (payload.assigneeIds ?? [])
    .map((userId) => users.find((u) => u.id === userId))
    .filter((u): u is User => Boolean(u))
    .map((u) => ({
      id: generateId("assignee"),
      userId: u.id,
      taskId: "",
      user: u,
      assignedAt: new Date().toISOString(),
    }));

  const task: Task = {
    id: generateId("task"),
    title: payload.title,
    description: payload.description ?? "",
    status: "TODO",
    priority: payload.priority ?? "MEDIUM",
    dueDate: payload.dueDate,
    projectId,
    creatorId: CURRENT_USER_ID,
    assignees: assignees.map((a) => ({ ...a, taskId: "" })),
    comments: [],
  };
  task.assignees = task.assignees.map((a) => ({ ...a, taskId: task.id }));
  tasks = [...tasks, task];
  return delay({ task });
}

export function updateTask(
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<UpdateTaskResponse> {
  const task = requireTask(projectId, taskId);
  if (payload.title !== undefined) task.title = payload.title;
  if (payload.description !== undefined) task.description = payload.description;
  if (payload.status !== undefined) task.status = payload.status;
  if (payload.priority !== undefined) task.priority = payload.priority;
  if (payload.dueDate !== undefined) task.dueDate = payload.dueDate;
  if (payload.assigneeIds !== undefined) {
    task.assignees = payload.assigneeIds
      .map((userId) => users.find((u) => u.id === userId))
      .filter((u): u is User => Boolean(u))
      .map((u) => ({
        id: generateId("assignee"),
        userId: u.id,
        taskId: task.id,
        user: u,
        assignedAt: new Date().toISOString(),
      }));
  }
  return delay({ task: { ...task } });
}

export function deleteTask(projectId: string, taskId: string): Promise<void> {
  requireTask(projectId, taskId);
  tasks = tasks.filter((t) => t.id !== taskId);
  return delay(undefined);
}

// ============================================================
// Commentaires
// ============================================================

export function createComment(
  projectId: string,
  taskId: string,
  payload: CreateCommentPayload,
): Promise<CreateCommentResponse> {
  const task = requireTask(projectId, taskId);
  const author = currentUser();
  const comment = {
    id: generateId("comment"),
    content: payload.content,
    taskId,
    authorId: author.id,
    author,
    createdAt: new Date().toISOString(),
  };
  task.comments = [...task.comments, comment];
  return delay({ comment });
}

// ============================================================
// Utilisateurs
// ============================================================

export function searchUsers(query: string): Promise<SearchUsersResponse> {
  const q = query.trim().toLowerCase();
  const results = users.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
  return delay({ users: results });
}
