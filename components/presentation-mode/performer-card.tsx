"use client";

import { Music2Icon, InstagramIcon } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";

interface PerformerCardProps {
  name: string;
  spotifyFollowers?: number;
  spotifyListeners?: number;
  instagramFollowers?: number;
}

export function PerformerCard({
  name,
  spotifyFollowers,
  spotifyListeners,
  instagramFollowers,
}: PerformerCardProps) {
  return (
    <div className="relative aspect-[3/2] flex flex-col overflow-hidden rounded-xl border bg-gradient-to-b from-primary/20 to-background shadow-lg">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-between p-4">
        {/* Top: Name */}
        <div>
          <h3 className="text-lg font-bold text-white drop-shadow-lg">{name}</h3>
        </div>

        {/* Bottom: Metrics */}
        <div className="space-y-2 text-sm text-white">
          {spotifyFollowers !== undefined && (
            <div className="flex items-center gap-2">
              <Music2Icon className="size-4 text-green-400" />
              <div>
                <p className="text-xs opacity-80">Spotify</p>
                <p className="font-semibold">
                  {formatCompactNumber(spotifyFollowers)}
                </p>
              </div>
            </div>
          )}

          {spotifyListeners !== undefined && (
            <div className="flex items-center gap-2">
              <Music2Icon className="size-4 text-green-400" />
              <div>
                <p className="text-xs opacity-80">Listeners</p>
                <p className="font-semibold">
                  {formatCompactNumber(spotifyListeners)}
                </p>
              </div>
            </div>
          )}

          {instagramFollowers !== undefined && (
            <div className="flex items-center gap-2">
              <InstagramIcon className="size-4 text-pink-400" />
              <div>
                <p className="text-xs opacity-80">Instagram</p>
                <p className="font-semibold">
                  {formatCompactNumber(instagramFollowers)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
