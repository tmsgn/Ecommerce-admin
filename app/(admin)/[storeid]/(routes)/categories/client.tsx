"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { columns, CategoryColumn } from "./components/columns";
import { EntityModal } from "@/components/modals/entity-modal";
import axios from "axios";

interface CategoriesClientProps {
  initialCategories: any[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleAddCategory = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/categories", { name: values.name });
      const newCategory = res.data;
      setCategories(prev => [...prev, newCategory]);
      toast.success("Category added");
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error adding category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setModalOpen(true)}>Add Category</Button>
      </div>
      <DataTable searchKey="name" columns={columns} data={categories} />
      <EntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Add Category"
        fields={[{ name: "name", label: "Category Name", type: "text", required: true }]}
        onSubmit={handleAddCategory}
        loading={isSubmitting}
      />
    </div>
  );
} 