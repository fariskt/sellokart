"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

interface Address {
  id: string | number;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isSandbox, setIsSandbox] = useState(false);
  
  // Feedback Messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAddresses() {
      try {
        const supabase = createClient();
        const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !sessionUser) {
          router.push("/login");
          return;
        }

        setUser(sessionUser);

        try {
          const { data, error: dbError } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", sessionUser.id)
            .order("is_default", { ascending: false });

          if (dbError) throw dbError;
          setAddresses(data || []);
        } catch (dbErr) {
          setIsSandbox(true);
          setAddresses([
            {
              id: "addr-1",
              recipient_name: "Faris K. T.",
              phone: "+91 98765 43210",
              street: "5th Floor, Silicon Towers, Outer Ring Road",
              city: "Bengaluru",
              state: "Karnataka",
              postal_code: "560001",
              country: "India",
              is_default: true
            },
            {
              id: "addr-2",
              recipient_name: "Faris K. T.",
              phone: "+91 98765 43210",
              street: "Green Villas, Kakkanad",
              city: "Kochi",
              state: "Kerala",
              postal_code: "682030",
              country: "India",
              is_default: false
            }
          ]);
        }
      } catch (err: any) {
        setError("Failed to load addresses.");
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, [router]);

  const handleDeleteAddress = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (isSandbox) {
        const updatedList = addresses.filter(a => a.id !== id);
        
        if (addresses.find(a => a.id === id)?.is_default && updatedList.length > 0) {
          updatedList[0].is_default = true;
        }
        
        setAddresses(updatedList);
        setSuccess("Address deleted successfully (Sandbox)!");
      } else {
        const { error: deleteError } = await supabase
          .from("addresses")
          .delete()
          .eq("id", id);
        
        if (deleteError) throw deleteError;

        const { data } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        const reloaded = data || [];
        if (reloaded.length > 0 && !reloaded.some(r => r.is_default)) {
          await supabase
            .from("addresses")
            .update({ is_default: true })
            .eq("id", reloaded[0].id);
          
          reloaded[0].is_default = true;
        }

        setAddresses(reloaded);
        setSuccess("Address deleted successfully!");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete address.");
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (addr.is_default) return;
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (isSandbox) {
        const updatedList = addresses.map(a => ({
          ...a,
          is_default: a.id === addr.id
        }));
        updatedList.sort((a, b) => (a.is_default ? -1 : 1));
        setAddresses(updatedList);
        setSuccess("Default address updated (Sandbox)!");
      } else {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        const { error: updateError } = await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", addr.id);

        if (updateError) throw updateError;

        const { data } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });
        
        setAddresses(data || []);
        setSuccess("Default address updated successfully!");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update default address.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Addresses"
        description="Manage your checkout delivery addresses and billing settings."
        icon={MapPin}
        action={
          <Button
            asChild
            size="default"
            className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            <Link href="/account/addresses/create">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add New Address</span>
            </Link>
          </Button>
        }
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection failed or tables are missing. Running in sandboxed local address list mode.
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs flex items-start space-x-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-success/10 text-success border border-success/20 rounded-2xl text-xs flex items-start space-x-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-white p-6">
          <MapPin className="w-10 h-10 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="font-bold text-foreground text-base mb-1">No addresses saved yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            Save delivery addresses to speed up checkout.
          </p>
          <Button
            asChild
            className="rounded-xl font-semibold button-shadow cursor-pointer"
          >
            <Link href="/account/addresses/create">
              Add Address
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={cn(
                "border rounded-2xl bg-white p-6 shadow-xs flex flex-col justify-between transition-all",
                addr.is_default ? "border-primary/40 bg-linear-to-b from-white to-primary/[0.01]" : "border-border hover:border-primary/20"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground text-sm leading-tight">
                      {addr.recipient_name}
                    </span>
                    {addr.is_default && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-md text-[9px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr)}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground mb-6">
                  <p className="leading-relaxed font-medium">
                    {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}
                  </p>
                  <div className="flex items-center gap-1.5 font-normal">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border/40">
                <Link
                  href={`/account/addresses/${addr.id}/edit`}
                  className="inline-flex items-center text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  <span>Edit</span>
                </Link>
                
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="inline-flex items-center text-[11px] font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
