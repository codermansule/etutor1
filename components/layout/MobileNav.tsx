"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  navItems: { href: string; label: string }[];
}

export default function MobileNav({ navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:text-sky-400"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 pb-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-110"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
