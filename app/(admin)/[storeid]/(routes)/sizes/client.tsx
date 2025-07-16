"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { columns, SizeColumn } from "./components/columns";

interface SizesClientProps {
  initialSizes: any[];
}

export default function SizesClient({ initialSizes }: SizesClientProps) {
  const [sizes, setSizes] = useState<SizeColumn[]>([]);
  useEffect(() => {
    setSizes(initialSizes);
  }, [initialSizes]);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sizes</h1>
      <DataTable searchKey="name" columns={columns} data={sizes} />
    </div>
  );
} 