"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Title } from "@/components/ui/title";
import { toast } from "sonner";
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Sellokart Store");
  const [supportEmail, setSupportEmail] = useState("support@sellokart.com");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [currency, setCurrency] = useState("INR (₹)");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [orderPrefix, setOrderPrefix] = useState("SLK");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("999");
  const [standardShippingFee, setStandardShippingFee] = useState("49");

  // Toggles
  const [autoCancelUnpaid, setAutoCancelUnpaid] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title>Store Settings</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store identity, currency, fulfillment rules, and administrative preferences.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Bento Grid Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Profile Card */}
        <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Store Profile</h3>
                <p className="text-xs text-muted-foreground">General identity and public contact details</p>
              </div>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 rounded-full text-[11px] font-medium">
              Live Store
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Name
              </label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Base Currency
              </label>
              <Input
                value={currency}
                disabled
                className="rounded-xl bg-muted/40 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Support Email
              </label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Support Phone
              </label>
              <Input
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>
          </div>
        </Card>

        {/* Pro / Status Featured Card */}
        <Card className="p-6 rounded-2xl bg-primary text-primary-foreground border-transparent shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">Sellokart Engine</h3>
              <p className="text-xs text-primary-foreground/80 mt-1">
                Enterprise headless commerce connected to Supabase real-time database.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-primary-foreground/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary-foreground/80">Database Status:</span>
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary-foreground/80">Storage:</span>
              <span className="font-bold">Supabase S3</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary-foreground/80">API Latency:</span>
              <span className="font-bold">24ms</span>
            </div>
          </div>
        </Card>

        {/* Orders & Inventory Rules */}
        <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Order & Inventory Rules</h3>
              <p className="text-xs text-muted-foreground">Order prefixes and stock alert triggers</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Order ID Prefix
              </label>
              <Input
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
                className="rounded-xl bg-background font-mono text-xs uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Low Stock Threshold (Units)
              </label>
              <Input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Auto-cancel Unpaid Orders</p>
                <p className="text-[11px] text-muted-foreground">Cancel pending orders after 24 hours</p>
              </div>
              <Switch
                checked={autoCancelUnpaid}
                onCheckedChange={setAutoCancelUnpaid}
              />
            </div>
          </div>
        </Card>

        {/* Shipping & Fulfillment */}
        <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Fulfillment & Shipping</h3>
              <p className="text-xs text-muted-foreground">Shipping fees and delivery thresholds</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Free Shipping Above (₹)
              </label>
              <Input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Standard Shipping Fee (₹)
              </label>
              <Input
                type="number"
                value={standardShippingFee}
                onChange={(e) => setStandardShippingFee(e.target.value)}
                className="rounded-xl bg-background"
              />
            </div>
          </div>
        </Card>

        {/* Notifications & Security */}
        <Card className="p-6 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Security & Alerts</h3>
              <p className="text-xs text-muted-foreground">Administrator notifications and access control</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Email Notifications</p>
                <p className="text-[11px] text-muted-foreground">Receive real-time alerts for new orders</p>
              </div>
              <Switch
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-foreground">Two-Factor Auth (2FA)</p>
                <p className="text-[11px] text-muted-foreground">Require OTP verification for staff logins</p>
              </div>
              <Switch
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-foreground">Maintenance Mode</p>
                <p className="text-[11px] text-muted-foreground">Display under maintenance banner to visitors</p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
