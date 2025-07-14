import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

interface ProductPageProps {
  params: { productid: string; storeid: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productid,
    },
    include: {
      images: true,
      variants: {
        include: {
          optionValues: true,
        },
      },
      options: true,
      categories: true,
    },
  });

  const categories = await prismadb.category.findMany();

  // Fetch all available options and their values for the form
  const options = await prismadb.option.findMany({
    include: {
      values: true,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
          initialData={product} 
          categories={categories}
          options={options}
        />
      </div>
    </div>
  );
};

export default ProductPage;