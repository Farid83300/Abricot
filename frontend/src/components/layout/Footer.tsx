import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex h-17 items-center justify-between border-t border-border bg-surface px-4 sm:px-12.5">
      <Image
        src="/logo-black.svg"
        alt="Abricot"
        width={80}
        height={27}
        style={{ width: "80px", height: "auto" }}
        priority
      />
      <span className="text-sm text-text-secondary">Abricot 2025</span>
    </footer>
  );
}
