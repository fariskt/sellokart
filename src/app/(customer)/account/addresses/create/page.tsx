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
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";

export default function CreateAddressPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    async function checkUser() {
      try {
        const supabase = createClient();
        const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !sessionUser) {
          router.push("/login");
          return;
        }

        setUser(sessionUser);

        // Check if DB is accessible to determine sandbox status
        try {
          const { error: testError } = await supabase
            .from("addresses")
            .select("id")
            .limit(1);
          if (testError) throw testError;
        } catch {
          setIsSandbox(true);
        }
      } catch (err) {
        setError("Failed to initialize session.");
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // Combine Line 1 and Line 2 into street field for database compatibility
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
        setSuccess("Address saved successfully in Sandbox mode!");
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
          .insert([{ ...addrPayload, user_id: user.id }]);

        if (saveError) throw saveError;

        setSuccess("Address details saved successfully!");
        setTimeout(() => {
          router.push("/account/addresses");
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save address details.");
    } finally {
      setSubmitting(false);
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
        title="Add Delivery Address"
        description="Provide address details for package tracking and shipping delivery."
        icon={MapPin}
        action={
          <Link
            href="/account/addresses"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Addresses</span>
          </Link>
        }
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection unavailable. New address additions will be simulated locally.
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

      {/* Form Card */}
      <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
                className="h-10 border border-border"
              />
            </div>
          </div>

          {/* Default address toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              id="defaultCheck"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={submitting}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="defaultCheck" className="text-xs font-bold text-foreground cursor-pointer select-none">
              Set as default delivery address
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              asChild
              className="rounded-xl font-bold cursor-pointer border border-border"
            >
              <Link href="/account/addresses">
                <X className="w-4 h-4 mr-1.5" />
                <span>Cancel</span>
              </Link>
            </Button>
            
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl font-bold button-shadow cursor-pointer flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save Address</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
