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
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(
      data.map((brand: any) => ({
        ...brand,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    setBrands(
      initialBrands.map((brand: any) => ({
        ...brand,
        onEdit: handleEdit,
        onDelete: handleDeleteModal,
      }))
    );
    // eslint-disable-next-line
  }, [initialBrands]);

  const openAdd = () => {
    setEditBrand(null);
    setName("");
    setModalOpen(true);
  };
  const handleEdit = (brand: { id: string; name: string }) => {
    setEditBrand(brand);
    setName(brand.name);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditBrand(null);
    setName("");
  };
  const handleSave = async () => {
    setLoading(true);
    const method = editBrand ? "PATCH" : "POST";
    const body = editBrand ? { id: editBrand.id, name } : { name };
    const res = await fetch("/api/brands", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editBrand ? "Brand updated" : "Brand added");
      fetchBrands();
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
    const res = await fetch("/api/brands", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Brand deleted");
      fetchBrands();
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
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button onClick={openAdd}>Add Brand</Button>
      </div>
      <DataTable
        searchKey="name"
        columns={columns}
        data={brands}
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
          </DialogHeader>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Brand name" />
          <DialogFooter>
            <Button onClick={closeModal} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{editBrand ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this brand?</p>
          <DialogFooter>
            <Button onClick={() => setDeleteId(null)} variant="outline" disabled={loading}>Cancel</Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} disabled={loading} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 