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
      subcategories: true,
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

  const formattedProducts = products.map((product: any) => {
    const firstVariant = product.variants?.[0];
    const totalStock = (product.variants || []).reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    // mainCategories is an enum array
    const mainCategories = Array.isArray(product.mainCategories)
      ? product.mainCategories.map((cat: string) => cat.charAt(0) + cat.slice(1).toLowerCase()).join(", ")
      : "";
    // subcategories is an array of objects
    const subCategories = Array.isArray(product.subcategories)
      ? product.subcategories.map((sub: any) => sub.name).join(", ")
      : "";
    return {
      id: product.id,
      name: product.name,
      price: product.price?.toString() || "",
      brand: product.brand?.name || "",
      mainCategories,
      subCategories,
      size: firstVariant?.size?.name || "",
      color: firstVariant?.color?.name || "",
      image: product.images?.[0]?.url || "",
      stock: totalStock,
      createdAt: format(product.createdAt, "d MMMM yyyy"),
    };
  });

  return <ProductClient data={formattedProducts} />;
};

export default ProductPage;
