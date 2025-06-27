"use client";

import { Pie, PieChart } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [chartData, setChartData] = useState([]);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/stores/${params.storeid}/dashboard`
        );
        const data = response.data.map((item: any, index: number) => ({
          ...item,
          fill: `var(--chart-${index + 1})`,
        }));
        setChartData(data);

        const dynamicChartConfig = data.reduce((acc: any, item: any) => {
          acc[item.name] = {
            label: item.name,
            color: item.fill,
          };
          return acc;
        }, {});

        // to do set dyanmic config
      } catch (error) {
        console.error("Failed to fetch chart data", error);
      }
    };

    fetchData();
  }, [params.storeid]);

  return (
    <Card className="flex flex-col max-w-md mx-auto">
      <CardHeader className="items-center pb-0">
        <CardTitle>Products by Category</CardTitle>
        <CardDescription>Based on the current store</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="count" nameKey="name" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
