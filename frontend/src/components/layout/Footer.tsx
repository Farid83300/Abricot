import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex h-17 items-center justify-between border-t border-border bg-surface px-4 sm:px-12.5">
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
    </footer>
  );
}
