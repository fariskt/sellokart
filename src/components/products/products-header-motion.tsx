"use client";

import { motion } from "framer-motion";

export function ProductsHeaderMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-landing-primary/10 mb-10"
    >
      {children}
    </motion.div>
  );
}
