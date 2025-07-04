"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type Product = {
  id: string;
  images: string;
  description: string;
  isFeatured: boolean;
  status: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
     
      let url = row.original.images;
      try {
        const arr = JSON.parse(url);
        url =
          Array.isArray(arr) && arr.length > 0 ? arr[0]?.url || arr[0] : url;
      } catch {
      }
      return (
        <img
          src={url}
          alt={row.original.name}
          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
