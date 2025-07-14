import React from "react";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { ProductColumn } from "./components/columns";
import { ProductPageClient } from "./components/products-page-client";
import { formatter } from "@/lib/utils";

const ProductsPage = async ({ params }: { params: { storeid: string } }) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeid,
    },
    include: {
      categories: true, // Correctly include the many-to-many categories
      variants: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => {
    // --- Price Range Logic ---
    let price;
    if (item.variants.length > 1) {
      const prices = item.variants.map((v) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        price = formatter.format(minPrice);
      } else {
        price = `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
      }
    } else {
      price = formatter.format(item.variants[0]?.price || 0);
    }

    return {
      id: item.id,
      name: item.title,
      // Join all category names into a single string
      category: item.categories.map((c) => c.name).join(", "),
      stock: item.variants.reduce((total, variant) => total + variant.inventory, 0),
      price: price,
      images: item.images[0]?.url || "",
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductPageClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;