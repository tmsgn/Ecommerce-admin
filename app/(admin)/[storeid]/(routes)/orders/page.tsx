import prismadb from "@/lib/prismadb";
import OrdersTableClient from "./OrdersTableClient";

export default async function OrdersPage({ params }: { params: { storeid: string } }) {
  const storeId = params.storeid;
  const ordersRaw = await prismadb.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
  // Fetch orderItems for each order
  const orders = await Promise.all(
    ordersRaw.map(async (order) => ({
      ...order,
      orderItems: await prismadb.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true },
      }),
    }))
  );
  return <OrdersTableClient orders={orders} />;
}