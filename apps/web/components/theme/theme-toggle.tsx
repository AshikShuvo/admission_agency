"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "admission-agency-theme";
const THEME_CHANGE_EVENT = "admission-agency-theme-change";

function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function getSystemTheme(): ThemeMode {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function getThemeSnapshot(): ThemeMode {
  return getStoredTheme() ?? getSystemTheme();
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

function subscribeThemeChanges(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeThemeChanges, getThemeSnapshot, getServerThemeSnapshot);

  const handleThemeChange = (nextTheme: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <div
      aria-label="Theme switcher"
      className="inline-flex rounded-lg border border-border bg-card p-1 shadow-sm"
      role="group"
    >
      <Button
        aria-pressed={theme === "light"}
        className={cn("h-8 px-3", theme !== "light" && "shadow-none")}
        size="sm"
        type="button"
        variant={theme === "light" ? "default" : "ghost"}
        onClick={() => handleThemeChange("light")}
      >
        <Sun className="size-4" aria-hidden />
        Light
      </Button>
      <Button
        aria-pressed={theme === "dark"}
        className={cn("h-8 px-3", theme !== "dark" && "shadow-none")}
        size="sm"
        type="button"
        variant={theme === "dark" ? "default" : "ghost"}
        onClick={() => handleThemeChange("dark")}
      >
        <Moon className="size-4" aria-hidden />
        Dark
      </Button>
    </div>
  );
}
