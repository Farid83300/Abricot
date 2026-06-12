"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const AUTH_IMAGES: Record<string, string> = {
  "/login": "/login.png",
  "/register": "/signin.png",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const imageSrc = AUTH_IMAGES[pathname] ?? "/login.png";

  return (
    <div className="flex min-h-screen">
      {/* Colonne gauche : formulaire */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:w-1/2 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-primary mb-8 text-2xl font-bold">ABRICOT</h1>
          {children}
        </div>
      </div>

      {/* Colonne droite : visuel décoratif, masqué sur mobile */}
      <div className="relative hidden sm:block sm:w-1/2">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
