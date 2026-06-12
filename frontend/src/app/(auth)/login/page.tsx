import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-ink mb-6 text-3xl font-semibold">Connexion</h2>
      {/* TODO Étape 4 : formulaire de connexion */}
      <p className="text-text-secondary mt-6 text-sm">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
