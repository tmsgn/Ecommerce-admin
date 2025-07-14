import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

  
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

   
    const store = await prismadb.store.create({
      data: {
        name,
        description, // Add the description
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("[STORES_POST_API]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}