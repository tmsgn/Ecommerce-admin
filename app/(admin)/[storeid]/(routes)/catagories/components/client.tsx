"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Catagory } from "@/lib/generated/prisma";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";
import { CatagoryColumn, columns } from "./columns";

interface CategoriesPageProps {
  data: CatagoryColumn[];
}

const CatagoriesClient: React.FC<CategoriesPageProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Catagories (${data.length})`}
          description="Manage ctagories for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeid}/catagories/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="w-full mt-4">
        <DataTable searchKey="name" columns={columns} data={data} />
      </div>
    </>
  );
};
export default CatagoriesClient;
