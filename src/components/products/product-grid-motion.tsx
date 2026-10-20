"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/landing/ProductCard";

interface ProductGridMotionProps {
  products: any[];
}

export function ProductGridMotion({ products }: ProductGridMotionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((prod, idx) => (
        <motion.div
          key={prod.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: Math.min(idx * 0.04, 0.35),
            ease: "easeOut",
          }}
          className="h-[390px]"
        >
          <ProductCard product={prod} />
        </motion.div>
      ))}
    </div>
  );
}
