"use client";

import { AppSelect } from "@/components/AppSelect";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory } from "../lib/categories.action";
import { toast } from "sonner";
import { ImageUpload } from "@/components/common/ImageUploader";

interface Category {
  id: string;
  name: string;
  image_url?: string;
  parent_id: string | null;
}

interface Props {
  mode: "create" | "edit";

  category?: Category;

  categories: Category[];

  onSuccess: () => void;
}

export function CategoryForm({ mode, category, categories, onSuccess }: Props) {
  async function handleSubmit(formData: FormData) {
    const result =
      mode === "create"
        ? await createCategory(formData)
        : await updateCategory(category!.id, formData);

    if (result.success) {
      toast.success(result.message);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form id="category-form" action={handleSubmit} className="space-y-6">
      <Input
        label="Category Name"
        name="name"
        placeholder="Enter category name"
        defaultValue={category?.name}
        required
      />

      <ImageUpload name="image" defaultImage={category?.image_url} maxSize={1} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Parent Category
        </label>

        <AppSelect
          name="parent_id"
          placeholder="Select parent category"
          defaultValue={category?.parent_id ?? ""}
          options={[
            {
              label: "No Parent Category",
              value: "none",
            },
            ...categories
              .filter((c) => c.id !== category?.id)
              .map((c) => ({
                label: c.name,
                value: c.id,
              })),
          ]}
        />
      </div>
    </form>
  );
}
