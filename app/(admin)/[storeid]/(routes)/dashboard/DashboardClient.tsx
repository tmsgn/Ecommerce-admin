"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, Package, Warehouse } from "lucide-react";

const chartConfig = {
  sales: { label: "Sales", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
};

interface Order {
  id: string;
  customer: string;
  total: number;
  date: string;
  status: "Completed" | "Pending" | "Shipped";
}

interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
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

  const [activeChart, setActiveChart] = React.useState<"sales" | "orders">("sales");
  const total = React.useMemo(
    () => ({
      sales: salesData.reduce((acc, curr) => acc + curr.sales, 0),
      orders: salesData.reduce((acc, curr) => acc + curr.orders, 0),
    }),
    [salesData]
  );

  return (
    <div className="p-8">
      <Heading title="Dashboard" description="Overview of your store's performance" />
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Total Sales</CardTitle>
            </div>
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
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Total Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalProducts}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Total Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalStock}</span>
          </CardContent>
        </Card>
      </div>
      {/* Chart and Orders side by side */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Chart */}
        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            {/* Toggle for sales/orders */}
            <div className="flex">
              {(["sales", "orders"] as const).map((key) => (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className={
                    "data-[active=true]:bg-muted/50 flex-1 px-4 py-2 border-t even:border-l text-left" +
                    (activeChart === key ? " bg-muted/50" : "")
                  }
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-muted-foreground text-xs">{chartConfig[key].label}</span>
                  <span className="text-lg font-bold block">{total[key].toLocaleString()}</span>
                </button>
              ))}
            </div>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                <LineChart data={salesData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        nameKey={activeChart}
                        labelFormatter={(value) => value}
                      />
                    }
                  />
                  <Line
                    dataKey={activeChart}
                    type="monotone"
                    stroke={`var(--color-${activeChart})`}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        {/* Orders */}
        <div className="w-full md:w-1/3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="overflow-x-auto">
                {recentOrders && recentOrders.length > 0 ?  (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left">User</th>
                        <th className="text-left">Total</th>
                        <th className="text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                          <td className="py-2">
                            <button
                              className="rounded-full bg-primary/10 text-primary flex items-center justify-center w-9 h-9 font-bold text-base shadow-sm hover:bg-primary/20 transition-all"
                              title={order.customer}
                            >
                              {order.customer?.charAt(0)?.toUpperCase() || "?"}
                            </button>
                          </td>
                          <td className="py-2 font-semibold">${order.total.toLocaleString()}</td>
                          <td className="py-2 text-muted-foreground">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <h1 className="text-center text-muted-foreground py-8">No orders</h1>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient; 