import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const categories = await prismadb.catagory.findMany({
      where: {
        storeId: params.storeid,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const chartData = categories.map((category) => ({
      name: category.name,
      count: category._count.products,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.log("[DASHBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
