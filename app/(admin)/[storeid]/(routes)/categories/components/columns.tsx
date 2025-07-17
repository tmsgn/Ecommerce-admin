"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type CategoryRow = {
  id: string;
  name: string;
  parentGroups: string[];
};

type ActionHandlers = {
  onEdit?: (row: CategoryRow) => void;
  onDelete?: (row: CategoryRow) => void;
};

export function getColumns(
  handlers: ActionHandlers = {}
): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Subcategory",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "parentGroups",
      header: "Main Categories",
      cell: ({ row }) =>
        row.original.parentGroups && row.original.parentGroups.length > 0
          ? row.original.parentGroups
              .map((g: string) => g.charAt(0) + g.slice(1).toLowerCase())
              .join(", ")
          : "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlers.onEdit?.(row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handlers.onDelete?.(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
