"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { getLocalUser } from "@/lib/local-auth";
import { getQuizResults } from "@/lib/study-storage";
import { getDayCounts, getStreaks } from "@/lib/streak";
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Quiz generator", icon: ClipboardCheck },
  { href: "/flashcards", label: "Flashcards", icon: BookOpen },
  { href: "/likely-questions", label: "Likely questions", icon: Sparkles },
  { href: "/planner", label: "Study planner", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: Zap },
];

export function AppShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Student");
  useEffect(() => {
    const user = getLocalUser();
    if (!user) router.replace("/login");
    else setName(user.name);
  }, [router]);
  function logout() {
    localStorage.removeItem("quizme_user");
    window.location.assign("/");
  }
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
  className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-xl shadow-slate-900/5 transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}
>
  <div className="flex shrink-0 items-center justify-between px-2">
    <Link
      href="/dashboard"
      className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-slate-950"
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
        <Sparkles className="size-[18px]" />
      </span>
      <span>QuizMe<span className="text-violet-600">.</span></span>
    </Link>
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
      aria-label="Close menu"
    >
      <X className="size-5" />
    </button>
  </div>

  <div className="mb-3 mt-8 shrink-0 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
    Your workspace
  </div>

  {/* flex-1 + overflow-y-auto: this is the part that scrolls on short screens */}
  <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main navigation">
    {navItems.map((item) => {
      const Icon = item.icon;
      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          <Icon className={`size-[18px] ${active ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"}`} />
          {item.label}
          {active && <ChevronRight className="ml-auto size-4" aria-hidden="true" />}
        </Link>
      );
    })}
  </nav>

  {/* shrink-0: the bottom block always keeps its full size */}
  <div className="shrink-0 pt-4">
    <StreakCard />
    <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-extrabold text-violet-700">
        {name.trim().charAt(0).toUpperCase() || "S"}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{name}</span>
      <button
        type="button"
        onClick={logout}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  </div>
</aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
          aria-label="Close navigation"
        />
      )}
      <main className="min-h-screen lg:pl-72">
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight text-slate-950">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white">
              <Sparkles className="size-4" />
            </span>
            QuizMe
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-5" />
          </button>
        </header>
        <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-slate-200/80 bg-white/90 px-8 py-5 backdrop-blur lg:flex xl:px-10">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900">{title}</p>
            {description && <p className="mt-1 truncate text-xs text-slate-500">{description}</p>}
          </div>
          <div className="ml-6 flex shrink-0 items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-violet-100 text-sm font-extrabold text-violet-700">
              {name.trim().charAt(0).toUpperCase() || "S"}
            </span>
            <span className="max-w-40 truncate text-sm font-bold text-slate-700">{name}</span>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 md:p-8 xl:px-10">{children}</div>
      </main>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}



function StreakCard() {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    setStreak(getStreaks(getDayCounts(getQuizResults())).current);
  }, []);

  return (
    <div className="shrink-0 overflow-hidden rounded-2xl bg-slate-950 p-4 text-white [@media(max-height:700px)]:hidden">
      <div className="mb-4 grid size-9 place-items-center rounded-xl bg-violet-500">
        <Zap className="size-4" aria-hidden="true" />
      </div>
      <p className="text-sm font-bold">
        {streak > 0 ? `${streak}-day streak` : "Start your streak"}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        {streak > 0 ? "Finish a quiz today to keep it going." : "Finish a quiz to light up today."}
      </p>
    </div>
  );
}