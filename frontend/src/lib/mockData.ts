import type { Comment, Project, ProjectMember, Task, User } from "@/types/api";

// Jeu de données figées pour le mode démo (voir env.ts / mockApi.ts).
// Sert de valeurs initiales à mockApi.ts, qui en garde une copie mutable
// en mémoire pour que la démo reste interactive pendant la session.

export const CURRENT_USER_ID = "u1";

export const mockUsers: User[] = [
  { id: "u1", email: "camille.dubois@abricot.io", name: "Camille Dubois" },
  { id: "u2", email: "karim.haddad@abricot.io", name: "Karim Haddad" },
  { id: "u3", email: "lea.bernard@abricot.io", name: "Léa Bernard" },
  { id: "u4", email: "thomas.petit@abricot.io", name: "Thomas Petit" },
  { id: "u5", email: "nora.aziz@abricot.io", name: "Nora Aziz" },
];

function findUser(id: string): User {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error(`mockData: utilisateur ${id} introuvable`);
  return user;
}

function member(id: string, userId: string, role: ProjectMember["role"]): ProjectMember {
  return { id, role, user: findUser(userId), joinedAt: "2026-07-01T09:00:00.000Z" };
}

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Refonte site vitrine",
    description:
      "Nouvelle identité visuelle et refonte complète du site vitrine Abricot.",
    ownerId: "u1",
    owner: findUser("u1"),
    members: [member("pm1", "u2", "ADMIN"), member("pm2", "u3", "CONTRIBUTOR")],
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "p2",
    name: "Application mobile Abricot",
    description:
      "Développement de l'application mobile iOS et Android pour le suivi de projets en mobilité.",
    ownerId: "u2",
    owner: findUser("u2"),
    members: [member("pm3", "u1", "CONTRIBUTOR"), member("pm4", "u4", "CONTRIBUTOR")],
    createdAt: "2026-07-05T09:00:00.000Z",
  },
  {
    id: "p3",
    name: "Campagne marketing Q4",
    description:
      "Préparation et lancement de la campagne marketing du dernier trimestre.",
    ownerId: "u1",
    owner: findUser("u1"),
    members: [member("pm5", "u3", "ADMIN")],
    createdAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "p4",
    name: "Migration infrastructure",
    description: "Migration des services vers la nouvelle infrastructure cloud.",
    ownerId: "u4",
    owner: findUser("u4"),
    members: [member("pm6", "u1", "ADMIN"), member("pm7", "u2", "CONTRIBUTOR")],
    createdAt: "2026-07-15T09:00:00.000Z",
  },
];

function comment(id: string, taskId: string, authorId: string, content: string): Comment {
  return {
    id,
    content,
    taskId,
    authorId,
    author: findUser(authorId),
    createdAt: "2026-08-05T14:30:00.000Z",
  };
}

function assignee(id: string, taskId: string, userId: string) {
  return { id, userId, taskId, user: findUser(userId), assignedAt: "2026-07-02T09:00:00.000Z" };
}

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Créer la maquette de la page d'accueil",
    description: "Proposer 2-3 déclinaisons de la page d'accueil sur Figma.",
    status: "TODO",
    priority: "HIGH",
    dueDate: "2026-09-15T00:00:00.000Z",
    projectId: "p1",
    creatorId: "u1",
    assignees: [assignee("a1", "t1", "u1")],
    comments: [],
  },
  {
    id: "t2",
    title: "Intégrer le header responsive",
    description: "Header + menu mobile en suivant la maquette validée.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: "2026-09-20T00:00:00.000Z",
    projectId: "p1",
    creatorId: "u1",
    assignees: [assignee("a2", "t2", "u1"), assignee("a3", "t2", "u3")],
    comments: [
      comment("c1", "t2", "u3", "Le menu mobile est prêt, je pousse la branche ce soir."),
    ],
  },
  {
    id: "t3",
    title: "Rédiger les contenus de la page À propos",
    description: "Texte de présentation de l'équipe et des valeurs Abricot.",
    status: "DONE",
    priority: "LOW",
    dueDate: "2026-08-30T00:00:00.000Z",
    projectId: "p1",
    creatorId: "u1",
    assignees: [assignee("a4", "t3", "u3")],
    comments: [],
  },
  {
    id: "t4",
    title: "Mettre en place le formulaire de contact",
    description: "Formulaire avec validation + envoi d'email de confirmation.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2026-09-25T00:00:00.000Z",
    projectId: "p1",
    creatorId: "u2",
    assignees: [assignee("a5", "t4", "u2")],
    comments: [],
  },
  {
    id: "t5",
    title: "Concevoir le design system mobile",
    description: "Composants réutilisables (boutons, cartes, inputs) pour l'app mobile.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2026-09-18T00:00:00.000Z",
    projectId: "p2",
    creatorId: "u2",
    assignees: [assignee("a6", "t5", "u1"), assignee("a7", "t5", "u4")],
    comments: [
      comment("c2", "t5", "u1", "Je pars sur la charte graphique du site vitrine pour rester cohérent."),
    ],
  },
  {
    id: "t6",
    title: "Implémenter l'authentification",
    description: "Login / inscription + gestion du token côté app mobile.",
    status: "TODO",
    priority: "URGENT",
    dueDate: "2026-09-12T00:00:00.000Z",
    projectId: "p2",
    creatorId: "u2",
    assignees: [assignee("a8", "t6", "u2")],
    comments: [],
  },
  {
    id: "t7",
    title: "Écrire les tests end-to-end",
    description: "Couvrir les parcours critiques (auth, création de tâche).",
    status: "TODO",
    priority: "LOW",
    dueDate: "2026-10-01T00:00:00.000Z",
    projectId: "p2",
    creatorId: "u2",
    assignees: [assignee("a9", "t7", "u4")],
    comments: [],
  },
  {
    id: "t8",
    title: "Définir le planning éditorial",
    description: "Calendrier de publication pour le trimestre.",
    status: "DONE",
    priority: "MEDIUM",
    dueDate: "2026-08-20T00:00:00.000Z",
    projectId: "p3",
    creatorId: "u1",
    assignees: [assignee("a10", "t8", "u1")],
    comments: [],
  },
  {
    id: "t9",
    title: "Créer les visuels réseaux sociaux",
    description: "Bannières et posts pour LinkedIn et Instagram.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: "2026-09-10T00:00:00.000Z",
    projectId: "p3",
    creatorId: "u1",
    assignees: [assignee("a11", "t9", "u3")],
    comments: [
      comment("c3", "t9", "u1", "Pense à décliner un format carré pour Instagram."),
    ],
  },
  {
    id: "t10",
    title: "Auditer l'infrastructure actuelle",
    description: "État des lieux des services et de leurs dépendances.",
    status: "DONE",
    priority: "HIGH",
    dueDate: "2026-08-15T00:00:00.000Z",
    projectId: "p4",
    creatorId: "u4",
    assignees: [assignee("a12", "t10", "u1")],
    comments: [],
  },
  {
    id: "t11",
    title: "Planifier la migration base de données",
    description: "Fenêtre de bascule + stratégie de rollback.",
    status: "TODO",
    priority: "URGENT",
    dueDate: "2026-09-22T00:00:00.000Z",
    projectId: "p4",
    creatorId: "u4",
    assignees: [assignee("a13", "t11", "u1"), assignee("a14", "t11", "u4")],
    comments: [],
  },
  {
    id: "t12",
    title: "Mettre à jour la documentation technique",
    description: "Documenter la nouvelle architecture pour l'équipe.",
    status: "CANCELLED",
    priority: "LOW",
    dueDate: "2026-09-05T00:00:00.000Z",
    projectId: "p4",
    creatorId: "u4",
    assignees: [assignee("a15", "t12", "u2")],
    comments: [],
  },
];
