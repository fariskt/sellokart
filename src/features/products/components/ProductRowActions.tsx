"use client";

import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { deleteProduct, toggleFeatured } from "../lib/product.action";
import { toast } from "sonner";
import type { Product } from "./ProductTable";

interface Props {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export function ProductRowActions({ product, onView, onEdit }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFeaturing, startFeatureTransition] = useTransition();

  function handleToggleFeatured() {
    startFeatureTransition(async () => {
      const nextFeatured = !product.featured;
      const result = await toggleFeatured(product.id, nextFeatured);

      if (result.success) {
        toast.success(
          nextFeatured
            ? `"${product.name}" marked as featured`
            : `"${product.name}" removed from featured`,
        );
      } else {
        toast.error(result.message || "Failed to update featured status");
      }
    });
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        toast.success(result.message || "Product deleted successfully");
        setDeleteOpen(false);
      } else {
        toast.error(result.message || "Failed to delete product");
      }
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 p-0"
            aria-label="Open product actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onView(product)}>
              <Eye className="mr-2 size-4 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Pencil className="mr-2 size-4 text-muted-foreground" />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleToggleFeatured}
              disabled={isFeaturing}
            >
              <Sparkles
                className={`mr-2 size-4 ${
                  product.featured
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground"
                }`}
              />
              {product.featured ? "Remove Featured" : "Make Featured"}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{product.name}</strong>? This
              action cannot be undone and will permanently remove this product,
              its variants, and associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
