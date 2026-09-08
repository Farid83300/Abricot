// Active le mode démo (données bouchonnées, pas de backend requis) quand
// NEXT_PUBLIC_MOCK_MODE=true est défini — utilisé pour le déploiement Vercel
// sans base de données ni API. Absent en local : comportement réel inchangé.
export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";
