"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboard } from "@/lib/hooks/dashboard";
import { formatNumber } from "@/lib/utils";
import { LayoutDashboardIcon, YoutubeIcon } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      {!isLoading && (
        <>
          <div className="grid grid-cols-3">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="inline-flex gap-2">
                  <LayoutDashboardIcon />
                  Resumo Geral Youtube
                </CardTitle>
                <CardAction>
                  <Badge variant="secondary">Perfis combinados</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>Inscritos (somando perfis)</p>
                <p className="text-lg font-bold">
                  {formatNumber(data?.total?.youtube?.followers?.latest ?? 0)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(data)
                    .filter(([key]) => key !== "total")
                    .map(([profile, profileData]) => (
                      <Badge
                        variant="secondary"
                        className="h-12 flex-col items-start rounded-lg"
                        key={profile}
                      >
                        <span>{profile}</span>
                        <span>
                          {formatNumber(
                            (profileData as any)?.youtube.followers?.latest ??
                              0,
                          )}
                        </span>
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <h2 className="mt-4 mb-2 inline-flex items-center gap-2 text-xl font-bold">
            <YoutubeIcon className="size-6" />
            YouTube
          </h2>
          <div className="grid grid-cols-1">
            <Card className="w-full gap-3">
              <CardHeader>
                <CardTitle>YouTube - Canais</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {Object.entries(data)
                  .filter(([key]) => key !== "total")
                  .map(([profile, profileData]) => (
                    <Badge
                      variant="secondary"
                      className="h-auto min-w-sm flex-col items-start rounded-lg px-5 py-3 text-base"
                      key={profile}
                    >
                      <span>{profile}</span>
                      <span className="text-lg font-semibold">
                        {formatNumber(
                          (profileData as any)?.youtube?.followers?.latest ?? 0,
                        )}{" "}
                        inscritos
                      </span>
                    </Badge>
                  ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
