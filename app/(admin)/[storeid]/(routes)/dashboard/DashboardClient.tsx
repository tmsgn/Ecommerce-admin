"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  total: number;
  date: string;
}

interface SalesDataPoint {
  date: string;
  sales: number;
}

interface DashboardClientProps {
  totalSales: number;
  previousSales: number;
  totalProducts: number;
  totalStock: number;
  recentOrders: Order[];
  salesData: SalesDataPoint[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({
  totalSales,
  previousSales,
  totalProducts,
  totalStock,
  recentOrders,
  salesData,
}) => {
  const salesChange = totalSales - previousSales;
  const salesChangePercent = previousSales > 0 ? (salesChange / previousSales) * 100 : 0;
  const salesChangePositive = salesChangePercent >= 0;

  return (
    <div className="p-8">
      <Heading title="Dashboard" description="Overview of your store's performance" />
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${totalSales.toLocaleString()}</span>
              <span className={`flex items-center text-sm font-medium ${salesChangePositive ? "text-green-600" : "text-red-600"}`}>
                {salesChangePositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {Math.abs(salesChangePercent).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Compared to previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalProducts}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalStock}</span>
          </CardContent>
        </Card>
      </div>
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ sales: { label: "Sales", color: "#2563eb" } }}>
              <LineChart data={salesData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Order ID</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">Total</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>${order.total.toLocaleString()}</td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardClient; 