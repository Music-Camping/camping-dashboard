"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDownIcon, MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MusicTrack } from "@/lib/types/music-catalog";
import { STATUS_LABELS, TYPE_LABELS } from "@/lib/types/music-catalog";
import { cn } from "@/lib/utils";

import { DeleteConfirmation } from "./delete-confirmation";

interface CreateColumnsOptions {
  onDelete: (id: number) => void;
}

const STATUS_COLORS: Record<MusicTrack["status"], string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  recording:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  mixing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  mastering:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  released: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export function createColumns({
  onDelete,
}: CreateColumnsOptions): ColumnDef<MusicTrack>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Nome
          <ArrowUpDownIcon className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Status
          <ArrowUpDownIcon className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const status = getValue<MusicTrack["status"]>();
        return (
          <Badge variant="secondary" className={cn(STATUS_COLORS[status])}>
            {STATUS_LABELS[status]}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ getValue }) => {
        const type = getValue<MusicTrack["type"]>();
        return (
          <span className="text-muted-foreground">{TYPE_LABELS[type]}</span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "deadline",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Prazo
          <ArrowUpDownIcon className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const date = getValue<string>();
        if (!date) return "-";
        return format(parseISO(date), "dd MMM yyyy", { locale: ptBR });
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Criado em
          <ArrowUpDownIcon className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const date = getValue<string>();
        if (!date) return "-";
        return format(parseISO(date), "dd MMM yyyy", { locale: ptBR });
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const track = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(track.id))}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteConfirmation
                itemName={track.name}
                onConfirm={() => onDelete(track.id)}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    Excluir música
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
