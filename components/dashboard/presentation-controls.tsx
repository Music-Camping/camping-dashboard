"use client";

import {
  Maximize2Icon,
  Minimize2Icon,
  MonitorIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  ChevronRightIcon,
  ToggleRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PresentationControlsProps {
  isActive: boolean;
  isFullscreen: boolean;
  autoRotate: boolean;
  rotationInterval: number;
  currentPerformer: string | null;
  performers: string[];
  enabledItems: Record<string, boolean>;
  onStart: () => void;
  onStop: () => void;
  onToggleFullscreen: () => void;
  onToggleAutoRotate: () => void;
  onSetInterval: (seconds: number) => void;
  onGoToNext: () => void;
  onToggleItem: (name: string) => void;
}

export function PresentationControls({
  isActive,
  isFullscreen,
  autoRotate,
  rotationInterval,
  currentPerformer,
  performers,
  enabledItems,
  onStart,
  onStop,
  onToggleFullscreen,
  onToggleAutoRotate,
  onSetInterval,
  onGoToNext,
  onToggleItem,
}: PresentationControlsProps) {
  const intervals = [10, 20, 30, 60, 120];

  if (isActive) {
    return (
      <div className="fixed right-4 bottom-4 z-50 flex gap-2 rounded-lg bg-background/95 p-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Current Performer Indicator */}
        {currentPerformer && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
            <MonitorIcon className="size-4" />
            <span className="text-sm font-medium">{currentPerformer}</span>
          </div>
        )}

        {/* Auto-rotate toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleAutoRotate}
          title={autoRotate ? "Pausar rotação" : "Iniciar rotação"}
        >
          {autoRotate ? (
            <PauseIcon className="size-4" />
          ) : (
            <PlayIcon className="size-4" />
          )}
        </Button>

        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onGoToNext}
          title="Próximo item"
        >
          <ChevronRightIcon className="size-4" />
        </Button>

        {/* Fullscreen toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
        >
          {isFullscreen ? (
            <Minimize2Icon className="size-4" />
          ) : (
            <Maximize2Icon className="size-4" />
          )}
        </Button>

        {/* Interval Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SettingsIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Intervalo de Rotação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {intervals.map((seconds) => (
              <DropdownMenuItem
                key={seconds}
                onClick={() => onSetInterval(seconds)}
                className={rotationInterval === seconds ? "bg-accent" : ""}
              >
                {seconds}s {rotationInterval === seconds && "✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggles for rotation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ToggleRightIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ativar/Desativar</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Company */}
            <DropdownMenuItem
              onClick={() => onToggleItem("company")}
              className="flex items-center justify-between"
            >
              <span>Camping (Empresa)</span>
              <span className="cursor-pointer">
                {enabledItems.company !== false ? "☑" : "☐"}
              </span>
            </DropdownMenuItem>

            {/* Performers */}
            {performers.map((performer) => (
              <DropdownMenuItem
                key={performer}
                onClick={() => onToggleItem(performer)}
                className="flex items-center justify-between"
              >
                <span>{performer}</span>
                <span className="cursor-pointer">
                  {enabledItems[performer] !== false ? "☑" : "☐"}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stop presentation */}
        <Button variant="destructive" onClick={onStop}>
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={onStart} className="gap-2">
        <MonitorIcon className="size-4" />
        Modo Apresentação
      </Button>
    </div>
  );
}
