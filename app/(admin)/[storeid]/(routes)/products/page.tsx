import React from "react";
import { ProductClient } from "./components/client";
import prismadb from "@/lib/prismadb";

const ProductPage = async ({ params }: { params: { storeid: string } }) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeid,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return <ProductClient data={[]} />;
};

export default ProductPage;
