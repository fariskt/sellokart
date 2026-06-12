"use client";

import { useState } from "react";

import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./CategoryForm";
import { SubmitButton } from "@/components/common/SubmitButton";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode: "create" | "edit";

  category?: Category;

  categories: Category[];
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  category,
  categories,
}: CategoryDialogProps) {

  const isEdit = mode === "edit";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Category" : "Create Category"}
      description={isEdit ? "Update category details." : "Add a new category."}
      size="md"
      footer={
        <SubmitButton
          mode={mode}
          createText="Create Category"
            form="category-form"
          updateText="Update Category"
        />
      }
    >
      <CategoryForm
        mode={mode}
        category={category}
        categories={categories}
        onSuccess={() => onOpenChange(false)}
      />
    </AppDialog>
  );
}
