"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard/types";
import { springGentle } from "@/lib/motion";

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

  const isHealthy = total > 0 && degraded === 0;
  const hasIssues = degraded > 0;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b bg-background/80 px-5 py-3 backdrop-blur-2xl supports-backdrop-filter:bg-background/60"
    >
      <motion.a
        href="/"
        className="flex items-center gap-2.5"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
          AH
        </span>
        <h1 className="text-base font-semibold">Asep Haryana</h1>
      </motion.a>
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={
            hasIssues
              ? {
                  scale: [1, 1.02, 1],
                  transition: { repeat: Number.POSITIVE_INFINITY, duration: 3 },
                }
              : {}
          }
        >
          <Badge
            variant="outline"
            className={`h-auto gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              hasIssues
                ? "border-amber-500/30 bg-amber-900/20 text-amber-500"
                : total > 0
                  ? "border-emerald-500/30 bg-emerald-900/20 text-emerald-400"
                  : ""
            }`}
          >
            {total > 0 && (
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: isHealthy ? 2.5 : 1.5,
                  ease: "easeInOut",
                }}
                className={`h-1.5 w-1.5 rounded-full ${
                  hasIssues ? "bg-amber-500" : "bg-emerald-400"
                }`}
              />
            )}
            {total === 0
              ? "No services"
              : hasIssues
                ? `${degraded} degraded`
                : "All Systems Operational"}
          </Badge>
        </motion.div>
        <motion.div
          whileHover={{ rotate: 30 }}
          whileTap={{ rotate: 60, scale: 0.9 }}
          transition={springGentle}
        >
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="hidden dark:block!" />
            <Moon className="block dark:hidden!" />
          </Button>
        </motion.div>
        <motion.span
          key={time}
          initial={{ opacity: 0.6, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[10px] tabular-nums text-muted-foreground"
        >
          {time}
        </motion.span>
      </div>
    </motion.header>
  );
}
