import prismadb from "@/lib/prismadb";
import DashboardClient from "./DashboardClient";
import { addDays, format, subDays } from "date-fns";

interface DashboardPageProps {
  params: { storeid: string };
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const storeId = params.storeid;

  // Total sales (all time)
  const totalSales = await prismadb.order.aggregate({
    where: { storeId },
    _sum: { total: true },
  });

  // Previous period sales (last 7 days before this week)
  const today = new Date();
  const startOfThisWeek = subDays(today, 6);
  const startOfLastWeek = subDays(startOfThisWeek, 7);
  const endOfLastWeek = subDays(startOfThisWeek, 1);

  const previousSalesAgg = await prismadb.order.aggregate({
    where: {
      storeId,
      createdAt: {
        gte: startOfLastWeek,
        lte: endOfLastWeek,
      },
    },
    _sum: { total: true },
  });

  // Total products
  const totalProducts = await prismadb.product.count({ where: { storeId } });

  // Total stock (sum of all variant stock for products in this store)
  const products = await prismadb.product.findMany({
    where: { storeId },
    include: { variants: true },
  });
  const totalStock = products.reduce(
    (sum, product) => sum + product.variants.reduce((s, v) => s + v.stock, 0),
    0
  );

  // Recent orders (last 5)
  const recentOrdersRaw = await prismadb.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: { include: { product: true } } },
  });
  const recentOrders = recentOrdersRaw.map((order) => ({
    id: order.id,
    customer: order.userEmail,
    total: order.total,
    date: format(order.createdAt, "yyyy-MM-dd"),
  }));

  // Sales data over time (last 7 days)
  const salesData: { date: string; sales: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i);
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));
    const dayOrders = await prismadb.order.aggregate({
      where: {
        storeId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _sum: { total: true },
    });
    salesData.push({
      date: format(dayStart, "yyyy-MM-dd"),
      sales: dayOrders._sum.total || 0,
    });
  }

  return (
    <DashboardClient
      totalSales={totalSales._sum.total || 0}
      previousSales={previousSalesAgg._sum.total || 0}
      totalProducts={totalProducts}
      totalStock={totalStock}
      recentOrders={recentOrders}
      salesData={salesData}
    />
  );
};

export default DashboardPage; 