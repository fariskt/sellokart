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
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total Categories"
        value={total}
      />

      <StatCard
        label="Parent Categories"
        value={rootCategories}
      />

      <StatCard
        label="Sub Categories"
        value={subCategories}
      />
    </div>
  );
}