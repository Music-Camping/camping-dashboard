"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/hooks/use-filters";
import { MOCK_PROFILES, PERIOD_OPTIONS } from "@/lib/types/filters";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  const { filters, setPeriod, setProfileId } = useFilters();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filters.period === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-4" />

      <Select
        value={filters.profileId ?? "all"}
        onValueChange={(value) => setProfileId(value === "all" ? null : value)}
      >
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder="Todos os Perfis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Perfis</SelectItem>
          {MOCK_PROFILES.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-4" />

      <ThemeToggle />
    </header>
  );
}
