import { StatCard } from "@/components/stat-card";

interface Props {
  total: number;
  rootCategories: number;
  subCategories: number;
}

export function CategoryStats({
  total,
  rootCategories,
  subCategories,
}: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <StatCard
        label="Total Categories"
        value={total}
        isFeatured={true}
        description="Active catalog departments"
      />

      <StatCard
        label="Parent Categories"
        value={rootCategories}
        description="Root product groups"
      />

      <StatCard
        label="Sub Categories"
        value={subCategories}
        description="Nested category segments"
      />
    </div>
  );
}