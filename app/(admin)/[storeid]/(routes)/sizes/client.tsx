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
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSize, setEditSize] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSizes = async () => {
    setLoading(true);
    const res = await fetch("/api/shoe-sizes");
    const data = await res.json();
    setSizes(
      data.map((size: any) => ({
        ...size,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    setSizes(
      initialSizes.map((size: any) => ({
        ...size,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    // eslint-disable-next-line
  }, [initialSizes]);

  const openAdd = () => {
    setEditSize(null);
    setName("");
    setModalOpen(true);
  };
  const handleEdit = (size: { id: string; name: string }) => {
    setEditSize(size);
    setName(size.name);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditSize(null);
    setName("");
  };
  const handleSave = async () => {
    setLoading(true);
    const method = editSize ? "PATCH" : "POST";
    const body = editSize ? { id: editSize.id, name } : { name };
    const res = await fetch("/api/shoe-sizes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editSize ? "Size updated" : "Size added");
      fetchSizes();
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
    const res = await fetch("/api/shoe-sizes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Size deleted");
      fetchSizes();
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
        <h1 className="text-2xl font-bold">Sizes</h1>
        <Button onClick={openAdd}>Add Size</Button>
      </div>
      <DataTable
        searchKey="name"
        columns={columns}
        data={sizes}
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editSize ? "Edit Size" : "Add Size"}</DialogTitle>
          </DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Size name" />
          <DialogFooter>
            <Button onClick={closeModal} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{editSize ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Size?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this size?</p>
          <DialogFooter>
            <Button onClick={() => setDeleteId(null)} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} disabled={loading} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 