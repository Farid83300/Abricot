import Link from "next/link";

export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-ink mb-6 text-3xl font-semibold">Inscription</h2>
      {/* TODO Étape 4 : formulaire d'inscription */}
      <p className="text-text-secondary mt-6 text-sm">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
