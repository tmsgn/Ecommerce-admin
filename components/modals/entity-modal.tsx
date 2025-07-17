import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // For checkbox-group
}

export interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: Field[];
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  loading?: boolean;
  initialValues?: Record<string, any>;
}

export function EntityModal({
  open,
  onOpenChange,
  title,
  fields,
  onSubmit,
  loading = false,
  initialValues = {},
}: EntityModalProps) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox-group") {
        initial[f.name] = initialValues[f.name] || [];
      } else {
        initial[f.name] = initialValues[f.name] || "";
      }
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      // Reset form when opened, use initialValues if provided
      setValues(
        fields.reduce((acc, f) => {
          if (f.type === "checkbox-group") {
            acc[f.name] = initialValues[f.name] || [];
          } else {
            acc[f.name] = initialValues[f.name] || "";
          }
          return acc;
        }, {} as Record<string, any>)
      );
      setErrors({});
    }
  }, [open, fields, initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    const field = fields.find((f) => f.name === name);
    if (field?.type === "checkbox-group") {
      setValues((prev) => {
        const arr = Array.isArray(prev[name]) ? prev[name] : [];
        if (checked) {
          return { ...prev, [name]: [...arr, value] };
        } else {
          return { ...prev, [name]: arr.filter((v: string) => v !== value) };
        }
      });
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple required validation
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name]) {
        newErrors[f.name] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor={field.name}
              >
                {field.label}
              </label>
              {field.type === "checkbox-group" && field.options ? (
                <div className="flex gap-4">
                  {field.options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        name={field.name}
                        value={opt.value}
                        checked={values[field.name]?.includes(opt.value)}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={values[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  disabled={loading}
                />
              )}
              {errors[field.name] && (
                <div className="text-xs text-red-500 mt-1">
                  {errors[field.name]}
                </div>
              )}
            </div>
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
