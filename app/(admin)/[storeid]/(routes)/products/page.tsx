import ProductClient from "./components/product-client";

const ProductsPage = async ({ params }: { params: { storeid: string } }) => {
  return <ProductClient storeid={params.storeid} />;
};

export default ProductsPage;
