"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="cubic-bezier(0.4, 0, 0.2, 1) h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all duration-700 dark:scale-0 dark:-rotate-90" />
      <Moon className="cubic-bezier(0.4, 0, 0.2, 1) absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all duration-700 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
