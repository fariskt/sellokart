import { Card } from "@/components/ui/card";

interface Props {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
}

export function ProductStats({
  total,
  active,
  draft,
  outOfStock,
}: Props) {
  const stats = [
    {
      label: "Total Products",
      value: total,
    },
    {
      label: "Active",
      value: active,
    },
    {
      label: "Draft",
      value: draft,
    },
    {
      label: "Out of Stock",
      value: outOfStock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="p-6"
        >
          <p className="text-sm text-muted-foreground">
            {stat.label}
          </p>

          <p className="mt-2 text-3xl font-semibold text-foreground">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}