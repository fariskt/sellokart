"use client";

import { useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { deleteCategory } from "../lib/categories.action";


interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
}

export function CategoryRowActions({
  category,
  onEdit,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteCategory(category.id);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onEdit(category)}
        >
          <Edit className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isPending}
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}