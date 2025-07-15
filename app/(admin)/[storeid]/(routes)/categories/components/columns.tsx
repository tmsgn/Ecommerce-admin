"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export type CategoryColumn = {
  id: string;
  name: string;
  createdAt?: string;
  onEdit: (category: { id: string; name: string }) => void;
  onDelete: (id: string) => void;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      row.original.createdAt
        ? format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm")
        : "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => row.original.onEdit({ id: row.original.id, name: row.original.name })}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => row.original.onDelete(row.original.id)}
        >
          Delete
        </Button>
      </div>
    ),
  },
]; 