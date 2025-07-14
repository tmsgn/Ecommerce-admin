"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  createdAt: string;
  images: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const url = row.original.images;
      return (
        <img
          src={url}
          alt={row.original.name}
          className="w-8 h-8 rounded-md object-cover"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
