// Erreur API typée — porte le message et le détail de validation
// renvoyés par l'enveloppe { success: false, message, details }.
// Isolée dans son propre fichier pour être importable à la fois par
// lib/api.ts (mode réel) et lib/mockApi.ts (mode démo) sans import circulaire.
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
