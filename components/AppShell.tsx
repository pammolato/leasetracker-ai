"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Leases", href: "/leases" },
  { label: "Payments", href: "/payments" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">LeaseTracker AI</h1>
            <p className="text-sm text-slate-600">Commercial Lease Management</p>
          </div>
          <nav aria-label="Main" className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = item.href !== null && pathname === item.href;
              const className = active
                ? "rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-slate-600";

              if (item.href === null) {
                return (
                  <span key={item.label} className={className}>
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
