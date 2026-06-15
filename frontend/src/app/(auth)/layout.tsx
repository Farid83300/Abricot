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
      {/* Colonne gauche : ~1/3 */}
      <div className="flex w-full flex-col justify-center bg-background px-10 py-12 sm:w-1/3 sm:px-12">
        <div className="mx-auto w-full max-w-xs">
          {children}
        </div>
      </div>

      {/* Colonne droite : ~2/3, masquée sur mobile */}
      <div className="relative hidden sm:block sm:w-2/3">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="66vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
