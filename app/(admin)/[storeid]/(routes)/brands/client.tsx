"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { columns, BrandColumn } from "./components/columns";

interface BrandsClientProps {
  initialBrands: any[];
}

export default function BrandsClient({ initialBrands }: BrandsClientProps) {
  const [brands, setBrands] = useState<BrandColumn[]>([]);
  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <DataTable searchKey="name" columns={columns} data={brands} />
    </div>
  );
} 