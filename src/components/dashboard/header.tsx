"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard/types";

export function DashboardHeader() {
  const [degraded, setDegraded] = useState(0);
  const [total, setTotal] = useState(0);
  const [time, setTime] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) return;
        const data: DashboardData = await res.json();
        setTotal(data.services.length);
        setDegraded(
          data.services.length -
            data.services.filter((s) => s.state === "running").length,
        );
      } catch {
        /* ignore */
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b bg-background/90 px-5 py-3 backdrop-blur-xl">
      <a href="/" className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
          AH
        </span>
        <h1 className="text-base font-semibold">Asep Haryana</h1>
      </a>
      <div className="flex items-center gap-2.5">
        <Badge
          variant="outline"
          className={`h-auto gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            degraded > 0
              ? "border-amber-500/30 bg-amber-900/20 text-amber-500"
              : total > 0
                ? "border-emerald-500/30 bg-emerald-900/20 text-emerald-400"
                : ""
          }`}
        >
          {total > 0 && (
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                degraded > 0 ? "bg-amber-500" : "bg-emerald-400"
              }`}
            />
          )}
          {total === 0
            ? "No services"
            : degraded > 0
              ? `${degraded} degraded`
              : "All Systems Operational"}
        </Badge>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="hidden dark:block!" />
          <Moon className="block dark:hidden!" />
        </Button>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
    </header>
  );
}
