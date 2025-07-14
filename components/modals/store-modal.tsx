"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const StoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  // Use a single state object to handle all form data
  const [storeData, setStoreData] = useState({
    name: "",
    description: "",
  });
  const router = useRouter();

  // A single handler for all input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoreData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Send the entire storeData object
      const response = await axios.post("/api/stores", storeData);

      toast.success("Store created successfully");
      router.refresh(); // Refreshes server components to reflect the new store
      onClose(); // Close the modal
      // This will redirect to the new store's dashboard or settings page
      window.location.assign(`/${response.data.id}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log("Failed to create store:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Create Your Store"
      description="Tell us a bit about your new store to get started."
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <Input
          name="name" // Add name attribute
          placeholder="Store name (e.g., Bahir Dar Kicks)"
          value={storeData.name}
          onChange={handleChange}
          required
          autoFocus
          disabled={isLoading}
        />
        <Textarea
          name="description" // Add name attribute
          placeholder="A short description of what your store sells."
          value={storeData.description}
          onChange={handleChange}
          disabled={isLoading}
          rows={4}
        />
        <div className="flex justify-end items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!storeData.name.trim() || isLoading}>
            {isLoading ? "Creating..." : "Create Store"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
