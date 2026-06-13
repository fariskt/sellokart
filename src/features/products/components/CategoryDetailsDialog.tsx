"use client";

import { AppDialog } from "@/components/AppDialog";
import { Badge } from "@/components/ui/badge";
import type { Category } from "../lib/category.actions";

interface CategoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryDetailsDialog({
  open,
  onOpenChange,
  category,
}: CategoryDetailsDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Category Details"
      description={category?.name}
      size="lg"
    >
      {!category ? (
        <p className="text-sm text-muted-foreground">Loading category details...</p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="overflow-hidden rounded-lg border border-border bg-muted">
                {category.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full" />
                )}
              </div>

              <dl className="grid gap-3">
                <DetailItem label="Name" value={category.name} />
                <DetailItem label="Slug" value={category.slug} />
                <DetailItem
                  label="Parent Category"
                  value={category.parent?.name ?? "No Parent"}
                />
                <DetailItem
                  label="Created At"
                  value={new Date(category.created_at).toLocaleDateString()}
                />
              </dl>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Child Categories
              </h3>

              <Badge variant="secondary">{category.children?.length ?? 0}</Badge>
            </div>

            {category.children?.length ? (
              <div className="divide-y rounded-lg border border-border">
                {category.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between gap-3 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {child.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {child.slug}
                      </p>
                    </div>
                    <Badge variant="outline">Sub Category</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No child categories.
              </p>
            )}
          </section>
        </div>
      )}
    </AppDialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
