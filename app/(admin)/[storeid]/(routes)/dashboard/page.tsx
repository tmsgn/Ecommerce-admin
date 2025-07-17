import prismadb from "@/lib/prismadb";
import DashboardClient from "./DashboardClient";
import { addDays, format, subDays } from "date-fns";

interface DashboardPageProps {
  params: { storeid: string };
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const storeId = params.storeid;

  // Total sales (all time)
  const totalSalesAgg = await prismadb.order.aggregate({
    where: { storeId },
    _sum: { total: true },
  });
  const totalSales = totalSalesAgg._sum.total || 0;

  // Orders count (all time)
  const totalOrders = await prismadb.order.count({ where: { storeId } });

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Conversion rate (mocked, as you may not have visitor data)
  const conversionRate = 7.2; // % (mocked)

  // Month-over-month growth (mocked, or you can calculate if you have last month's data)
  const monthOverMonthGrowth = 12.5; // % (mocked)

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

  // Low stock and out of stock items
  const lowStockItems = products.reduce(
    (count, product) =>
      count + product.variants.filter((v) => v.stock > 0 && v.stock <= 5).length,
    0
  );
  const outOfStockItems = products.reduce(
    (count, product) => count + product.variants.filter((v) => v.stock === 0).length,
    0
  );

  // Recent orders (last 7)
  const recentOrdersRaw = await prismadb.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 7, // Show 7 most recent orders
  });
  // Fetch orderItems for each order
  const recentOrdersWithItems = await Promise.all(
    recentOrdersRaw.map(async (order) => ({
      ...order,
      orderItems: await prismadb.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true },
      }),
    }))
  );
  // For demo, randomly assign status
  const statuses = ["Completed", "Pending", "Shipped"];
  const recentOrders = recentOrdersWithItems.map((order, idx) => ({
    id: order.id,
    customer: order.userEmail,
    total: order.total,
    date: format(order.createdAt, "yyyy-MM-dd"),
    status: statuses[idx % statuses.length] as "Completed" | "Pending" | "Shipped", // Type assertion
    orderItems: order.orderItems,
  }));

  // Sales data over time (last 30 days for better chart readability)
  const salesData = [];
  for (let i = 29; i >= 0; i--) {
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
      _count: { id: true },
    });
    salesData.push({
      date: format(dayStart, "yyyy-MM-dd"),
      sales: dayOrders._sum.total || 0,
      orders: dayOrders._count.id || 0, // Ensure orders is included
    });
  }

  // Construct analytics and inventory objects
  const analytics = {
    totalRevenue: totalSales,
    averageOrderValue,
    conversionRate,
    monthOverMonthGrowth,
  };
  // inventory object is no longer needed for DashboardClient

  return (
   <DashboardClient
  totalSales={analytics.totalRevenue}
  previousSales={previousSalesAgg._sum.total || 0}
  totalProducts={totalProducts}
  totalStock={totalStock}
  recentOrders={recentOrders}
  salesData={salesData}
/>
  );
};

export default DashboardPage; 