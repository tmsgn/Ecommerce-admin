"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { columns, ColorColumn } from "./components/columns";

interface ColorsClientProps {
  initialColors: any[];
}

export default function ColorsClient({ initialColors }: ColorsClientProps) {
  const [colors, setColors] = useState<ColorColumn[]>([]);
  useEffect(() => {
    setColors(initialColors);
  }, [initialColors]);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Colors</h1>
      <DataTable searchKey="name" columns={columns} data={colors} />
    </div>
  );
} 