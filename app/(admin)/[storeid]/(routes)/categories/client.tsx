"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./components/columns";
import { EntityModal } from "@/components/modals/entity-modal";
import { toast } from "sonner";
import axios from "axios";

interface CategoriesClientProps {
  initialCategories: {
    id: string;
    name: string;
    parentGroups: string[];
  }[];
}

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainCategories, setMainCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [editData, setEditData] = useState<any | null>(null);

  useEffect(() => {
    axios.get("/api/main-categories").then((res) => {
      setMainCategories(res.data);
    });
  }, []);

  const handleAddCategory = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (editData) {
        const res = await axios.patch("/api/categories", {
          id: editData.id,
          name: values.name,
          mainCategories: values.mainCategories,
        });
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editData.id ? res.data : cat))
        );
        toast.success("Subcategory updated");
      } else {
        const res = await axios.post("/api/categories", {
          name: values.name,
          mainCategories: values.mainCategories,
        });
        setCategories((prev) => [...prev, res.data]);
        toast.success("Subcategory added");
      }
      setModalOpen(false);
      setEditData(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Error saving subcategory"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (row: any) => {
    setEditData(row);
    setModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    // Implement delete logic here if needed
    toast("Delete not implemented");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setModalOpen(true)}>Add Subcategory</Button>
      </div>
      <DataTable
        searchKey="name"
        columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete })}
        data={categories}
      />
      <EntityModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditData(null);
        }}
        title={editData ? "Edit Subcategory" : "Add Subcategory"}
        fields={[
          {
            name: "name",
            label: "Subcategory Name",
            type: "text",
            required: true,
          },
          {
            name: "mainCategories",
            label: "Main Categories",
            type: "checkbox-group",
            options: mainCategories,
            required: true,
          },
        ]}
        initialValues={editData ? { name: editData.name, mainCategories: editData.parentGroups } : {}}
        onSubmit={handleAddCategory}
        loading={isSubmitting}
      />
    </div>
  );
}
