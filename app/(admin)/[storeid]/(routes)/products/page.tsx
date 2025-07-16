import React from "react";
import { ProductClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";

const ProductPage = async ({ params }: { params: { storeid: string } }) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeid,
    },
    include: {
      categories: { include: { category: true } },
      brand: true,
      material: true,
      variants: {
        include: {
          size: true,
          color: true,
        },
      },
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts = products.map((product) => {
    const firstVariant = product.variants[0];
    const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const categoryNames = product.categories.map((pc: any) => pc.category.name).join(", ");
    return {
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      brand: product.brand?.name || "",
      category: categoryNames,
      size: firstVariant?.size?.name || "",
      color: firstVariant?.color?.name || "",
      image: product.images[0]?.url || "",
      stock: totalStock,
      createdAt: format(product.createdAt, "d MMMM yyyy"),
    };
  });

  return <ProductClient data={formattedProducts} />;
};

export default ProductPage;
