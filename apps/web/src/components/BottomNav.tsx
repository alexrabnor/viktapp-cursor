"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/statistics", label: "Statistik", icon: StatisticsIcon },
  { href: "/history", label: "Historik", icon: HistoryIcon },
  { href: "/settings", label: "Inställningar", icon: SettingsIcon },
];

function IconShell({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "flex h-11 w-11 items-center justify-center rounded-2xl",
        active ? "bg-zinc-900 text-white shadow-sm" : "bg-white/70 text-zinc-600",
        "ring-1 ring-black/5",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={[
        "fixed bottom-0 left-0 right-0 z-50",
        "mx-auto w-full max-w-md",
        "border-t border-black/5",
        "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "px-3 pb-3 pt-2",
      ].join(" ")}
      aria-label="Bottennavigation"
    >
      <div className="flex items-center justify-between gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 text-[11px] font-medium"
              aria-current={active ? "page" : undefined}
            >
              <IconShell active={active}>
                <Icon />
              </IconShell>
              <span className={active ? "text-zinc-900" : "text-zinc-600"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 13.2C4 10.746 4 9.519 4.764 8.683C5.528 7.847 6.74 7.653 9.163 7.265L13.838 6.52C16.251 6.133 17.457 5.94 18.231 6.562C19.005 7.183 19.005 8.409 19.005 10.86V16.3C19.005 18.09 19.005 18.985 18.448 19.57C17.89 20.155 16.993 20.155 15.2 20.155H8.8C7.007 20.155 6.11 20.155 5.552 19.57C4.995 18.985 4.995 18.09 4.995 16.3V13.2H4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.5H10.5M7.5 13.5H14.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatisticsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 20V11.5C6 10.395 6.895 9.5 8 9.5H9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13 20V6.8C13 5.806 13.806 5 14.8 5H16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.5 20V13.5C9.5 12.67 10.17 12 11 12H12.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 20H18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 7H3V3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 7.5C5.2 4.8 8.2 3 11.7 3C17 3 21.3 7.3 21.3 12.6C21.3 17.9 17 22.2 11.7 22.2C7 22.2 3.2 19 2.3 14.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 8.6V12.3L15 14.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 15.2C13.768 15.2 15.2 13.768 15.2 12C15.2 10.232 13.768 8.8 12 8.8C10.232 8.8 8.8 10.232 8.8 12C8.8 13.768 10.232 15.2 12 15.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 12C19.4 10.87 20.3 10.14 20.75 9.1C21.12 8.25 20.9 7.25 20.2 6.55L19.7 6.05C19 5.35 18 5.13 17.15 5.5C16.11 5.95 15.38 6.85 14.25 6.85C13.12 6.85 12.39 5.95 11.35 5.5C10.5 5.13 9.5 5.35 8.8 6.05L8.3 6.55C7.6 7.25 7.38 8.25 7.75 9.1C8.2 10.14 9.1 10.87 9.1 12C9.1 13.13 8.2 13.86 7.75 14.9C7.38 15.75 7.6 16.75 8.3 17.45L8.8 17.95C9.5 18.65 10.5 18.87 11.35 18.5C12.39 18.05 13.12 17.15 14.25 17.15C15.38 17.15 16.11 18.05 17.15 18.5C18 18.87 19 18.65 19.7 17.95L20.2 17.45C20.9 16.75 21.12 15.75 20.75 14.9C20.3 13.86 19.4 13.13 19.4 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

