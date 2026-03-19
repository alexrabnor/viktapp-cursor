import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={[
        "vikttappCardEnter",
        "group relative overflow-hidden rounded-2xl",
        "bg-gradient-to-b from-white/90 to-white/70 shadow-sm ring-1 ring-black/5",
        "backdrop-blur supports-[backdrop-filter]:bg-white/70",
        "p-4 transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md",
        "active:translate-y-0",
        // subtle gradient overlay that intensifies on hover
        "after:absolute after:inset-0 after:opacity-0 after:transition-opacity after:duration-300",
        "after:bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.18),transparent_55%)]",
        "hover:after:opacity-100",
        // dark mode overlay
        "dark:after:bg-[radial-gradient(circle_at_20%_0%,rgba(236,72,153,0.12),transparent_55%)]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </section>
  );
}

