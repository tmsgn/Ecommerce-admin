"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
  id: string;
  image: string;
  name: string;
  price: string; 
  brand: string;
  category: string;
  size: string;
  color: string;
  stock: number;
  createdAt: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) =>
      row.original.image ? (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="h-12 w-12 object-cover rounded"
        />
      ) : (
        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
      ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = Number(row.original.price);
      return price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div
          className="h-6 w-6 rounded-full border"
  
          style={{ backgroundColor: row.original.color.toLowerCase() }}
        />
      </div>
    ),
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