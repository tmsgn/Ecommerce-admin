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
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editColor, setEditColor] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchColors = async () => {
    setLoading(true);
    const res = await fetch("/api/shoe-colors");
    const data = await res.json();
    setColors(
      data.map((color: any) => ({
        ...color,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    setColors(
      initialColors.map((color: any) => ({
        ...color,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    // eslint-disable-next-line
  }, [initialColors]);

  const openAdd = () => {
    setEditColor(null);
    setName("");
    setModalOpen(true);
  };
  const handleEdit = (color: { id: string; name: string }) => {
    setEditColor(color);
    setName(color.name);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditColor(null);
    setName("");
  };
  const handleSave = async () => {
    setLoading(true);
    const method = editColor ? "PATCH" : "POST";
    const body = editColor ? { id: editColor.id, name } : { name };
    const res = await fetch("/api/shoe-colors", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editColor ? "Color updated" : "Color added");
      fetchColors();
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
    const res = await fetch("/api/shoe-colors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Color deleted");
      fetchColors();
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
        <h1 className="text-2xl font-bold">Colors</h1>
        <Button onClick={openAdd}>Add Color</Button>
      </div>
      <DataTable
        searchKey="name"
        columns={columns}
        data={colors}
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editColor ? "Edit Color" : "Add Color"}</DialogTitle>
          </DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Color name" />
          <DialogFooter>
            <Button onClick={closeModal} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{editColor ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Color?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this color?</p>
          <DialogFooter>
            <Button onClick={() => setDeleteId(null)} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} disabled={loading} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 