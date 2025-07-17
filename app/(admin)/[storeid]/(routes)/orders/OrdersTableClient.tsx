"use client";
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

const statuses = ["Completed", "Pending", "Shipped"];

function getStatus(idx: number) {
  return statuses[idx % statuses.length];
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completed": return "bg-green-100 text-green-800";
    case "Pending": return "bg-yellow-100 text-yellow-800";
    case "Shipped": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function exportToCSV(orders: any[]) {
  const header = ["User", "Email", "Total", "Date", "Status"];
  const rows = orders.map((order, idx) => [
    order.userEmail?.charAt(0)?.toUpperCase() || "?",
    order.userEmail,
    order.total,
    format(order.createdAt, "yyyy-MM-dd"),
    getStatus(idx),
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function OrdersTableClient({ orders }: { orders: any[] }) {
  const [openDialogIdx, setOpenDialogIdx] = React.useState<number | null>(null);
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "userAvatar",
      header: "User",
      cell: ({ row }) => (
        <span
          className="rounded-full bg-primary/10 text-primary flex items-center justify-center w-9 h-9 font-bold text-base shadow-sm"
          title={row.original.userEmail}
        >
          {row.original.userEmail?.charAt(0)?.toUpperCase() || "?"}
        </span>
      ),
    },
    {
      accessorKey: "userEmail",
      header: "Email",
      cell: ({ row }) => row.original.userEmail,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => `$${row.original.total.toLocaleString()}`,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.createdAt), "yyyy-MM-dd"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const idx = row.index;
        const status = getStatus(idx);
        return (
          <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const order = row.original;
        const idx = row.index;
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenDialogIdx(idx)}
              aria-label="View order details"
            >
              <Eye className="w-4 h-4 mr-1" /> View
            </Button>
            <Dialog open={openDialogIdx === idx} onOpenChange={(open) => setOpenDialogIdx(open ? idx : null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <div><b>User:</b> {order.userEmail}</div>
                  <div><b>Total:</b> ${order.total.toLocaleString()}</div>
                  <div><b>Date:</b> {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</div>
                  <div><b>Status:</b> {getStatus(row.index)}</div>
                  <div><b>Items:</b>
                    <ul className="list-disc ml-6">
                      {order.items.map((item: any) => (
                        <li key={item.id}>Product: {item.productId}, Quantity: {item.quantity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Orders</CardTitle>
          <Button
            type="button"
            variant="secondary"
            className="ml-2"
            onClick={() => exportToCSV(orders)}
          >
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={orders} searchKey="userEmail" />
        </CardContent>
      </Card>
    </div>
  );
}

export default OrdersTableClient; 