"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-actions";

export type CatagoryColumn = {
  id: string;
  name: string;
  products: number;
  createdAt: string;
};

export const columns: ColumnDef<CatagoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Catagory Name",
  },
  {
    accessorKey: "products",
    header: "Products",
  },

  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
