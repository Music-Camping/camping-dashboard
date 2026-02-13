"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, HashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Championship,
  type ChampionshipStatus,
  getChampionshipStatus,
} from "@/lib/types/championships";
import { cn } from "@/lib/utils";

interface ChampionshipCardProps {
  championship: Championship;
  className?: string;
}

const STATUS_CONFIG: Record<
  ChampionshipStatus,
  { label: string; className: string; dotClassName: string }
> = {
  active: {
    label: "Ao Vivo",
    className: "bg-green-500 text-white animate-pulse",
    dotClassName: "bg-green-400",
  },
  upcoming: {
    label: "Em Breve",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    dotClassName: "bg-blue-400",
  },
  completed: {
    label: "Finalizado",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dotClassName: "bg-gray-400",
  },
};

export function ChampionshipCard({
  championship,
  className,
}: ChampionshipCardProps) {
  const status = getChampionshipStatus(championship);
  const statusConfig = STATUS_CONFIG[status];

  const startDate = parseISO(championship.starts_at);
  const endDate = parseISO(championship.ends_at);

  const getTimeInfo = () => {
    if (status === "upcoming") {
      return `Começa ${formatDistanceToNow(startDate, { addSuffix: true, locale: ptBR })}`;
    }
    if (status === "active") {
      return `Termina ${formatDistanceToNow(endDate, { addSuffix: true, locale: ptBR })}`;
    }
    return `Finalizado em ${format(endDate, "dd MMM yyyy", { locale: ptBR })}`;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">
            {championship.title}
          </CardTitle>
          <Badge className={cn(statusConfig.className)}>
            {status === "active" && (
              <span
                className={cn(
                  "mr-1.5 size-2 rounded-full",
                  statusConfig.dotClassName,
                )}
              />
            )}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Hashtag */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HashIcon className="size-4" />
          <span>{championship.hashtag}</span>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="size-4" />
          <span>{getTimeInfo()}</span>
        </div>

        {/* Contenders count */}
        {championship.contenders.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {championship.contenders.length} participantes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
