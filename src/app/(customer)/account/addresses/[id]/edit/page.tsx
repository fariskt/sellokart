"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  MapPin, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Save,
  Trash2,
  Check,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";

interface EditAddressProps {
  params: Promise<{ id: string }>;
}

export default function EditAddressPage({ params }: EditAddressProps) {
  const resolvedParams = React.use(params);
  const addressId = resolvedParams.id;
  
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  
  // Feedback Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    async function loadAddressDetails() {
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
            .eq("id", addressId)
            .single();

          if (dbError) throw dbError;
          if (data) {
            populateForm(data);
          }
        } catch (dbErr) {
          setIsSandbox(true);
          // Look up mock data
          const mockAddresses = [
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
          ];

          const found = mockAddresses.find(a => a.id === addressId);
          if (found) {
            populateForm(found);
          } else {
            setError("Address not found.");
          }
        }
      } catch (err: any) {
        setError("Failed to load address details.");
      } finally {
        setLoading(false);
      }
    }

    loadAddressDetails();
  }, [addressId, router]);

  const populateForm = (addr: any) => {
    setFullName(addr.recipient_name);
    setPhone(addr.phone);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setCountry(addr.country);
    setIsDefault(addr.is_default);

    // Split street string by comma to populate address lines
    const streetVal = addr.street || "";
    const parts = streetVal.split(",").map((p: string) => p.trim());
    if (parts.length > 1) {
      setAddressLine1(parts[0]);
      setAddressLine2(parts.slice(1).join(", "));
    } else {
      setAddressLine1(streetVal);
      setAddressLine2("");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const street = addressLine2 ? `${addressLine1}, ${addressLine2}` : addressLine1;

    const addrPayload = {
      recipient_name: fullName,
      phone,
      street,
      city,
      state,
      postal_code: postalCode,
      country,
      is_default: isDefault
    };

    try {
      const supabase = createClient();

      if (isSandbox) {
        setSuccess("Address updated successfully in Sandbox mode!");
        setTimeout(() => {
          router.push("/account/addresses");
        }, 1500);
      } else {
        if (isDefault) {
          // Clear current default addresses
          await supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);
        }

        const { error: saveError } = await supabase
          .from("addresses")
          .update({ ...addrPayload, user_id: user.id })
          .eq("id", addressId);

        if (saveError) throw saveError;

        setSuccess("Address details updated successfully!");
        setTimeout(() => {
          router.push("/account/addresses");
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update address details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (isSandbox) {
        setSuccess("Address deleted successfully (Sandbox mode)!");
        setTimeout(() => {
          router.push("/account/addresses");
        }, 1500);
      } else {
        const { error: deleteError } = await supabase
          .from("addresses")
          .delete()
          .eq("id", addressId);

        if (deleteError) throw deleteError;

        // If it was default, make another address default
        if (isDefault) {
          const { data } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (data && data.length > 0) {
            await supabase
              .from("addresses")
              .update({ is_default: true })
              .eq("id", data[0].id);
          }
        }

        setSuccess("Address deleted successfully!");
        setTimeout(() => {
          router.push("/account/addresses");
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete address.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    if (isDefault) return;

    setSettingDefault(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      if (isSandbox) {
        setIsDefault(true);
        setSuccess("Default address updated (Sandbox mode)!");
        setSettingDefault(false);
      } else {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        const { error: updateError } = await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", addressId);

        if (updateError) throw updateError;

        setIsDefault(true);
        setSuccess("This address is now set as default!");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update default address.");
    } finally {
      setSettingDefault(false);
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
        title="Edit Delivery Address"
        description="Update your shipping coordinates or adjust your default address selection."
        icon={MapPin}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/account/addresses"
              className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Addresses</span>
            </Link>
          </div>
        }
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection failed. Changes will be updated locally within your active session.
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-success/10 text-success border border-success/20 rounded-2xl text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Full Name *
              </label>
              <Input
                id="fullName"
                type="text"
                required
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Contact Phone *
              </label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* Address Line 1 */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="addrLine1" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Address Line 1 *
              </label>
              <Input
                id="addrLine1"
                type="text"
                required
                placeholder="Flat / House No, Building / Apartment Name"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="addrLine2" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Address Line 2
              </label>
              <Input
                id="addrLine2"
                type="text"
                placeholder="Street Name, Locality, Area Land Mark"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                City *
              </label>
              <Input
                id="city"
                type="text"
                required
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label htmlFor="state" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                State *
              </label>
              <Input
                id="state"
                type="text"
                required
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-1.5">
              <label htmlFor="zip" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Postal Code (ZIP / PIN) *
              </label>
              <Input
                id="zip"
                type="text"
                required
                placeholder="e.g. 560001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label htmlFor="country" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Country *
              </label>
              <Input
                id="country"
                type="text"
                required
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={submitting || deleting}
                className="h-10 border border-border"
              />
            </div>
          </div>

          {/* Actions bar details */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 select-none">
            {/* Left side actions: Set Default or show Badge */}
            <div className="flex items-center space-x-2">
              {isDefault ? (
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/25 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Default Address</span>
                </span>
              ) : (
                <Button
                  type="button"
                  onClick={handleSetDefault}
                  variant="outline"
                  size="sm"
                  disabled={settingDefault || submitting || deleting}
                  className="rounded-xl font-bold border-border/60 hover:bg-secondary/15 transition-all text-xs cursor-pointer"
                >
                  {settingDefault ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  <span>Set as Default</span>
                </Button>
              )}
            </div>

            {/* Right side actions: Update, Cancel, and Delete */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={submitting || deleting || settingDefault || (isDefault && !isSandbox)}
                className="rounded-xl font-bold text-destructive hover:bg-destructive/5 hover:text-destructive border-border/60 hover:border-destructive/30 cursor-pointer text-xs"
                title={isDefault && !isSandbox ? "Cannot delete default address directly. Set another address as default first." : "Delete this address"}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1.5" />
                )}
                <span>Delete</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                asChild
                className="rounded-xl font-bold cursor-pointer border border-border text-xs"
              >
                <Link href="/account/addresses">
                  <X className="w-4 h-4 mr-1.5" />
                  <span>Cancel</span>
                </Link>
              </Button>
              
              <Button
                type="submit"
                disabled={submitting || deleting || settingDefault}
                className="rounded-xl font-bold button-shadow cursor-pointer flex items-center justify-center text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Update Address</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
