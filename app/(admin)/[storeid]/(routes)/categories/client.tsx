"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { columns, CategoryColumn } from "./components/columns";

interface CategoriesClientProps {
  initialCategories: any[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(
      data.map((cat: any) => ({
        ...cat,
        createdAt: cat.createdAt,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    setCategories(
      initialCategories.map((cat: any) => ({
        ...cat,
        createdAt: cat.createdAt,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    // eslint-disable-next-line
  }, [initialCategories]);

  const openAdd = () => {
    setEditCategory(null);
    setName("");
    setModalOpen(true);
  };
  const handleEdit = (cat: { id: string; name: string }) => {
    setEditCategory(cat);
    setName(cat.name);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditCategory(null);
    setName("");
  };
  const handleSave = async () => {
    setLoading(true);
    const method = editCategory ? "PATCH" : "POST";
    const body = editCategory ? { id: editCategory.id, name } : { name };
    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editCategory ? "Category updated" : "Category added");
      fetchCategories();
      closeModal();
    } else {
      const err = await res.json();
      toast.error(err.error || "Error");
    }
    setLoading(false);
  };
  const handleDeleteModal = (id: string) => {
    setDeleteId(id);
  };
  const handleDelete = async (id: string) => {
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
      setDeleteId(null);
    } else {
      const err = await res.json();
      toast.error(err.error || "Error");
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={openAdd}>Add Category</Button>
      </div>
      <DataTable
        searchKey="name"
        columns={columns}
        data={categories}
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" />
          <DialogFooter>
            <Button onClick={closeModal} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{editCategory ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this category?</p>
          <DialogFooter>
            <Button onClick={() => setDeleteId(null)} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} disabled={loading} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 