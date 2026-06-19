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
      {/* Colonne gauche : pleine largeur jusqu'à lg, puis ~1/3 */}
      <div className="flex w-full flex-col bg-background px-6 pt-8 pb-10 sm:px-10 sm:pt-10 lg:w-1/3 lg:px-12 lg:pt-12">
        <div className="mx-auto flex w-full max-w-xs flex-1 flex-col">
          {children}
        </div>
      </div>

      {/* Colonne droite : ~2/3, visible uniquement à partir de lg (1024px) */}
      <div className="relative hidden lg:block lg:w-2/3">
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
