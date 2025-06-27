import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { catagoryid: string } }
) {
  try {
    if (!params.catagoryid) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const catagory = await prismadb.catagory.findUnique({
      where: {
        id: params.catagoryid,
      },
    });

    return NextResponse.json(catagory);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { storeid: string; catagoryid: string } }
) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!params.catagoryid) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const catagory = await prismadb.catagory.update({
      where: {
        id: params.catagoryid,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(catagory);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeid: string; catagoryid: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!params.catagoryid) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const catagory = await prismadb.catagory.delete({
      where: {
        id: params.catagoryid,
      },
    });

    return NextResponse.json(catagory);
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
