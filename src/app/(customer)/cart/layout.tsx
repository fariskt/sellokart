import * as React from "react";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16 select-none">
      <div className="container-page">
        {children}
      </div>
    </div>
  );
}
