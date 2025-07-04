"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Order = {
  customer: string;
  type: string;
  amount: number;
  status: "sucessfull" | "pending" | "failed";
  date: string;
};

import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Order>[] = [
  {
    header: "Customer",
    accessorKey: "customer",
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Amount",
    accessorKey: "amount",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Order["status"];
      let color:
        | "default"
        | "destructive"
        | "secondary"
        | "outline"
        | null
        | undefined = "default";
      if (status === "failed") color = "destructive";
      else if (status === "pending") color = "secondary";
      else if (status === "sucessfull") color = "default";
      return (
        <Badge variant={color}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    header: "Date",
    accessorKey: "date",
  },
];
