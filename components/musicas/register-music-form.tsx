"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SongStatus, SongType } from "@/lib/types/music-catalog";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/types/music-catalog";

const SONG_STATUSES: SongStatus[] = [
  "pending",
  "recording",
  "mixing",
  "mastering",
  "released",
];

const SONG_TYPES: SongType[] = ["single", "album_track", "feat"];

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  status: z.enum(["pending", "recording", "mixing", "mastering", "released"]),
  type: z.enum(["single", "album_track", "feat"]).optional(),
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RegisterMusicFormProps {
  onSuccess?: () => void;
}

export function RegisterMusicForm({ onSuccess }: RegisterMusicFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "pending",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/proxy/api/dashboard/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          status: data.status,
          ...(data.type && { type: data.type }),
          ...(data.deadline && {
            deadline: new Date(data.deadline).toISOString(),
          }),
        }),
      });

      if (!res.ok) throw new Error("Erro ao cadastrar música");

      toast.success("Música cadastrada com sucesso!");
      reset();
      onSuccess?.();
    } catch {
      toast.error("Erro ao cadastrar música. Tente novamente.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <PlusIcon className="size-5 text-purple-500" />
          Cadastrar Nova Música
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Nome */}
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Nome da música"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status *</Label>
            <Select
              defaultValue="pending"
              onValueChange={(value) => setValue("status", value as SongStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {SONG_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Tipo</Label>
            <Select
              onValueChange={(value) => setValue("type", value as SongType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {SONG_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prazo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deadline">Prazo</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
          </div>

          {/* Submit */}
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <PlusIcon className="size-4" />
              {isSubmitting ? "Cadastrando..." : "Cadastrar Música"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
