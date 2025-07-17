import { NextResponse } from "next/server";
import { MainCategory } from "@prisma/client";

export async function GET() {
  const mainCategories = Object.values(MainCategory).map((value) => ({
    label: value.charAt(0) + value.slice(1).toLowerCase(),
    value,
  }));
  return NextResponse.json(mainCategories);
}
