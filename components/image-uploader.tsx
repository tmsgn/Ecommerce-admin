"use client";

import { useRef, useState } from "react";
import { CloudUpload, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import clsx from "clsx";
import { toast } from "sonner";
import Image from "next/image"; // Using Next.js Image for optimization

interface ImageUploadProps {
  onChange: (value: string) => void;
  disabled?: boolean;
  value: string[];
  onRemove: (url: string) => void;
}

const MAX_FILES = 4;

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  disabled = false,
  value,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isLimitReached = value.length >= MAX_FILES;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || isLimitReached) return;
    if (value.length + files.length > MAX_FILES) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} images.`);
      return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");
      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dqbfjahy6/image/upload",
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          onChange(data.secure_url);
        }
      } catch {
        toast.error("Failed to upload image");
      }
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading || isLimitReached) return;
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div>
      {/* The main container is now the dropzone and the preview area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex gap-4 flex-wrap border-2 border-dashed rounded-xl p-4 min-h-[212px]"
      >
        {/* Map over existing image values to show previews */}
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[180px] h-[180px] rounded-xl overflow-hidden border shadow-md"
          >
            <Image
              fill
              src={url}
              alt="Uploaded Image"
              className="object-cover"
            />
            <Button
              type="button"
              onClick={() => onRemove(url)}
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 z-10 h-7 w-7"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Conditionally render the upload prompt */}
        {!isLimitReached && (
          <div
            onClick={() => !disabled && !uploading && inputRef.current?.click()}
            className={clsx(
              "w-[180px] h-[180px] flex items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition",
              {
                "border-gray-300 hover:border-primary bg-white": !uploading,
                "opacity-50 cursor-not-allowed": uploading || disabled,
              }
            )}
          >
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <CloudUpload className="w-8 h-8" />
              {uploading ? "Uploading..." : "Upload"}
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        hidden
        disabled={uploading || disabled || isLimitReached}
        onChange={(e) => handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default ImageUpload;
