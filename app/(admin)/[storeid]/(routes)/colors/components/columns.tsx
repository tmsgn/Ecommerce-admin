"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type ColorColumn = {
  id: string;
  name: string;
  onEdit: (color: { id: string; name: string }) => void;
  onDelete: (id: string) => void;
};

export const columns: ColumnDef<ColorColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
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