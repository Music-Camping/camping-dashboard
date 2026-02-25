"use client";

import { RegisterMusicForm } from "@/components/musicas/register-music-form";
import { MusicTable } from "@/components/dashboard/music-catalog/music-table";
import { useMusicCatalog } from "@/hooks/use-music-catalog";

export default function MusicasPage() {
  const { tracks, isLoading, mutate } = useMusicCatalog();

  return (
    <div className="flex flex-col gap-6">
      <RegisterMusicForm onSuccess={() => mutate()} />
      <MusicTable tracks={tracks} isLoading={isLoading} />
    </div>
  );
}
