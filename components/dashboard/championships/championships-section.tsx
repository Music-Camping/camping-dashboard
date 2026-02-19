"use client";

import { TrophyIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Championship,
  getChampionshipStatus,
} from "@/lib/types/championships";

import { ChampionshipCard } from "./championship-card";

interface ChampionshipsSectionProps {
  championships: Championship[];
  isLoading?: boolean;
}

export function ChampionshipsSection({
  championships,
  isLoading = false,
}: ChampionshipsSectionProps) {
  const activeChampionships = championships.filter(
    (c) => getChampionshipStatus(c) === "active",
  );
  const upcomingChampionships = championships.filter(
    (c) => getChampionshipStatus(c) === "upcoming",
  );
  const completedChampionships = championships.filter(
    (c) => getChampionshipStatus(c) === "completed",
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <TrophyIcon className="size-5 text-yellow-500" />
            Campeonatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (championships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <TrophyIcon className="size-5 text-yellow-500" />
            Campeonatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Nenhum campeonato disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <TrophyIcon className="size-5 text-yellow-500" />
          Campeonatos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Championships */}
        {activeChampionships.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-green-600 dark:text-green-400">
              Em Andamento ({activeChampionships.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeChampionships.map((championship) => (
                <ChampionshipCard
                  key={championship.id}
                  championship={championship}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Championships */}
        {upcomingChampionships.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
              Próximos ({upcomingChampionships.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingChampionships.map((championship) => (
                <ChampionshipCard
                  key={championship.id}
                  championship={championship}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Championships */}
        {completedChampionships.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Finalizados ({completedChampionships.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedChampionships.slice(0, 3).map((championship) => (
                <ChampionshipCard
                  key={championship.id}
                  championship={championship}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
