"use client";

import { ChevronDownIcon, MonitorIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useFilters } from "@/hooks/use-filters";
import { PERIOD_OPTIONS } from "@/lib/types/filters";

interface AppHeaderProps {
  onStartPresentation?: () => void;
}

export function AppHeader({ onStartPresentation }: AppHeaderProps = {}) {
  const {
    filters,
    setPeriod,
    togglePerformer,
    setSelectedPerformers,
    availablePerformers,
  } = useFilters();

  // Dispatch custom event to start presentation
  const handleStartPresentation = () => {
    if (onStartPresentation) {
      onStartPresentation();
    } else {
      // Dispatch event for page to handle
      window.dispatchEvent(new CustomEvent("start-presentation"));
    }
  };

  const selectedCount = filters.selectedPerformers.length;
  const allSelected =
    selectedCount === 0 || selectedCount === availablePerformers.length;

  const getPerformerLabel = () => {
    if (allSelected || selectedCount === 0) {
      return "Todos os Performers";
    }
    if (selectedCount === 1) {
      return filters.selectedPerformers[0];
    }
    return `${selectedCount} selecionados`;
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedPerformers([]);
    } else {
      setSelectedPerformers(availablePerformers);
    }
  };

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-[180px] justify-between"
          >
            <span className="flex items-center gap-2">
              <UsersIcon className="size-4" />
              <span className="truncate">{getPerformerLabel()}</span>
            </span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Performers</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          >
            Todos
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {availablePerformers.map((performer) => (
            <DropdownMenuCheckboxItem
              key={performer}
              checked={
                filters.selectedPerformers.length === 0 ||
                filters.selectedPerformers.includes(performer)
              }
              onCheckedChange={() => togglePerformer(performer)}
            >
              {performer}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-4" />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartPresentation}
        title="Modo Apresentação"
      >
        <MonitorIcon className="size-[1.2rem]" />
        <span className="sr-only">Modo Apresentação</span>
      </Button>

      <ThemeToggle />
    </header>
  );
}
