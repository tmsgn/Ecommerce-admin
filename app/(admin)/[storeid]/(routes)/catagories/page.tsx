import { DataTable } from "../../../../../components/ui/data-table";
import prismadb from "@/lib/prismadb";
import CatagoriesClient from "./components/client";

export default async function CategoriesPage({
  params,
}: {
  params: { storeid: string };
}) {
  const catagories = await prismadb.catagory.findMany({
    where: {
      storeId: params.storeid,
    },
    include: {
      products: true,
    },
  });

  const formattedCatagories = catagories.map((catagory) => ({
    id: catagory.id,
    name: catagory.name,
    products: catagory.products.length,
    createdAt: catagory.createdAt.toLocaleDateString(),
  }));
  return (
    <div className="container mx-auto py-10">
      <CatagoriesClient data={formattedCatagories} />
    </div>
  );
}
