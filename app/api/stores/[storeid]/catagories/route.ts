import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const catagories = await prismadb.catagory.findMany({
      where: {
        storeId: params.storeid,
      },
    });
    return NextResponse.json(catagories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new Response("Name is required", { status: 400 });
    }

    if (!params.storeid) {
      return new Response("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new Response("Unauthorized", { status: 403 });
    }

    const catagory = await prismadb.catagory.create({
      data: {
        name,
        storeId: params.storeid,
      },
    });

    return NextResponse.json(catagory);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
