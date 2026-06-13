"use client";

import { Card } from "@/components/ui/card";
import { CustomerAddress } from "../lib/types";
import { MapPin, Phone } from "lucide-react";

interface CustomerAddressesTabProps {
  addresses: CustomerAddress[];
}

export function CustomerAddressesTab({ addresses }: CustomerAddressesTabProps) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
        <h3 className="text-sm font-semibold text-foreground">No saved addresses found</h3>
        <p className="mt-1 text-xs text-muted-foreground">This customer has not saved any billing or shipping addresses yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <Card
          key={address.id}
          className={`p-5 border flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs ${address.is_default ? "border-primary bg-primary/5" : "border-border bg-card"}`}
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-bold text-foreground text-sm">
                {address.full_name}
              </span>
              {address.is_default && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-md text-[9px] font-bold uppercase tracking-wider">
                  Default Delivery
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {address.address_line_1}
              {address.address_line_2 ? `, ${address.address_line_2}` : ""}
              <br />
              {address.city}, {address.state} - {address.postal_code}
              <br />
              {address.country}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-border/40 text-xs text-muted-foreground/80 font-normal">
            <Phone className="w-3.5 h-3.5" />
            <span>{address.phone}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
