"use client";

import * as React from "react";

interface AnalyticsTriggerProps {
  productId: number;
  productName: string;
}

export function AnalyticsTrigger({ productId, productName }: AnalyticsTriggerProps) {
  React.useEffect(() => {
    // Analytics: Product Impression
    console.log(`Analytics Event: Product Impression - ID: ${productId}, Name: "${productName}"`);
  }, [productId, productName]);

  return null;
}
