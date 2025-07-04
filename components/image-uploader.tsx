"use client";

import { useRef, useState } from "react";
import { CloudUpload, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import clsx from "clsx";

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  disabled?: boolean;
  value: string[];
  onRemove: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  disabled = false,
  value,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dqbfjahy6/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
      } catch {
        alert("Failed to upload image");
      }
    }

    onChange([...value, ...uploaded]);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {value.map((url) => (
            <div
              key={url}
              className="relative w-[180px] h-[180px] rounded-xl overflow-hidden border shadow-md"
            >
              <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
              <Button
                type="button"
                onClick={() => onRemove(url)}
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={clsx(
          "flex items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition",
          {
            "border-gray-300 hover:border-gray-500 bg-white": !uploading,
            "opacity-50 cursor-not-allowed": uploading || disabled,
          }
        )}
      >
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <CloudUpload className="w-8 h-8 text-primary" />
          {uploading ? "Uploading..." : "Click or drag images here"}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        hidden
        disabled={uploading || disabled}
        onChange={(e) => handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default ImageUpload;
