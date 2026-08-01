import { Card } from "@/components/ui/card";
import { Title } from "@/components/ui/title";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

export function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <Title as="h3">
          {value}
        </Title>

        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}