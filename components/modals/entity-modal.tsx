import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface EntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: Field[];
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  loading?: boolean;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  open,
  onOpenChange,
  title,
  fields,
  onSubmit,
  loading = false,
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(f => { initial[f.name] = ""; });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      // Reset form when opened
      setValues(fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {}));
      setErrors({});
    }
  }, [open, fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple required validation
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
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
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1" htmlFor={field.name}>{field.label}</label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={values[field.name]}
                onChange={handleChange}
                required={field.required}
                disabled={loading}
              />
              {errors[field.name] && (
                <div className="text-xs text-red-500 mt-1">{errors[field.name]}</div>
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
}; 