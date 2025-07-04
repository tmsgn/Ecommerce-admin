import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import React from "react";
import { DataTable } from "./components/data-table";
import { columns, Order } from "./components/columns";


const OrdersPage = () => {
  const data: Order[] = [
    {
      customer: "John Doe",
      type: "Online",
      amount: 120.5,
      status: "sucessfull",
      date: "2025-07-01",
    },
    {
      customer: "Jane Smith",
      type: "In-Store",
      amount: 75.0,
      status: "pending",
      date: "2025-07-02",
    },
    {
      customer: "Alice Johnson",
      type: "Online",
      amount: 200.0,
      status: "failed",
      date: "2025-07-03",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders from you store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default OrdersPage;
