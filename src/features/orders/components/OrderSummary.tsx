
interface OrderSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export function OrderSummary({
  subtotal,
  tax,
  shipping,
  discount,
  total,
}: OrderSummaryProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  const rows = [
    { label: "Subtotal", value: formatCurrency(subtotal) },
    { label: "Tax", value: formatCurrency(tax) },
    { label: "Shipping Fee", value: formatCurrency(shipping) },
    {
      label: "Discount",
      value: `-${formatCurrency(discount)}`,
      className: "text-emerald-600 font-medium",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 sm:p-6 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.className || "text-foreground font-medium"}>
              {row.value}
            </span>
          </div>
        ))}

        <div className="h-[1px] w-full bg-border my-2" />

        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
