"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { columns, MaterialColumn } from "./components/columns";

interface MaterialsClientProps {
  initialMaterials: any[];
}

export default function MaterialsClient({ initialMaterials }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<MaterialColumn[]>([]);
  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Materials</h1>
      <DataTable searchKey="name" columns={columns} data={materials} />
    </div>
  );
} 