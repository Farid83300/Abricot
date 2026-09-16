import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex h-17 items-center border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-37.5">
        <div className="relative h-7 w-20">
          <Image
            src="/logo-black.svg"
            alt="Abricot"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        <span className="text-sm text-text-secondary">Abricot 2025</span>
      </div>
    </footer>
  );
}
