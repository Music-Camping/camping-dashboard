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
import type {
  SongStatus,
  SongAuthorship,
  SongPhonogramContract,
} from "@/lib/types/music-catalog";
import {
  STATUS_LABELS,
  AUTHORSHIP_LABELS,
  PHONOGRAM_CONTRACT_LABELS,
} from "@/lib/types/music-catalog";

const SONG_STATUSES: SongStatus[] = [
  "pending",
  "recording",
  "mixing",
  "mastering",
  "released",
];

const SONG_AUTHORSHIPS: SongAuthorship[] = [
  "Não Solicitado",
  "Solicitado",
  "Recebida",
];
const SONG_PHONOGRAM_CONTRACTS: SongPhonogramContract[] = [
  "Não solicitado",
  "Solicitado",
  "Contrato enviado",
  "Contrato Assinado",
];

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  status: z.enum(["pending", "recording", "mixing", "mastering", "released"]),
  authorship: z.enum(["Não Solicitado", "Solicitado", "Recebida"]).optional(),
  phonogram_contract: z
    .enum([
      "Não solicitado",
      "Solicitado",
      "Contrato enviado",
      "Contrato Assinado",
    ])
    .optional(),
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
          ...(data.authorship && { authorship: data.authorship }),
          ...(data.phonogram_contract && {
            phonogram_contract: data.phonogram_contract,
          }),
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

          {/* Autoral */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="authorship">Autoral</Label>
            <Select
              onValueChange={(value) =>
                setValue("authorship", value as SongAuthorship)
              }
            >
              <SelectTrigger id="authorship">
                <SelectValue placeholder="Selecione o status autoral" />
              </SelectTrigger>
              <SelectContent>
                {SONG_AUTHORSHIPS.map((authorship) => (
                  <SelectItem key={authorship} value={authorship}>
                    {AUTHORSHIP_LABELS[authorship]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contrato Fonograma */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phonogram_contract">Contrato Fonograma</Label>
            <Select
              onValueChange={(value) =>
                setValue("phonogram_contract", value as SongPhonogramContract)
              }
            >
              <SelectTrigger id="phonogram_contract">
                <SelectValue placeholder="Selecione o contrato" />
              </SelectTrigger>
              <SelectContent>
                {SONG_PHONOGRAM_CONTRACTS.map((contract) => (
                  <SelectItem key={contract} value={contract}>
                    {PHONOGRAM_CONTRACT_LABELS[contract]}
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
