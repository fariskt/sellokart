"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Lock, 
  Monitor, 
  LogOut, 
  Trash2, 
  Eye, 
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export default function SecurityPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  // Session state
  const [sessions, setSessions] = useState<any[]>([]);
  const [signingOut, setSigningOut] = useState(false);
  
  // Delete account state
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  
  // Messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !sessionUser) {
          router.push("/login");
          return;
        }

        setUser(sessionUser);
        
        // Mock session data
        setSessions([
          {
            id: 1,
            device: "Current Device",
            browser: "Chrome on Windows",
            lastActive: new Date().toISOString(),
            isCurrent: true
          }
        ]);
      } catch (err: any) {
        setError("Failed to load security settings.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Validation
    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }
    if (!newPassword) {
      setError("New password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setSuccess("");
    setError("");

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      setSuccess("Signed out successfully!");
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Failed to sign out.");
    } finally {
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSuccess("");
    setError("");

    if (deleteConfirm !== user?.email) {
      setError("Email confirmation does not match.");
      return;
    }

    setDeletingAccount(true);

    try {
      const supabase = createClient();
      
      // Delete user account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) throw deleteError;

      setSuccess("Account deleted successfully!");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Manage your account security, login credentials, and active sessions."
        icon={Lock}
      />

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-green-700/80">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-green-900 block mb-0.5">Success</span>
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-red-700/80">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-red-900 block mb-0.5">Error</span>
            {error}
          </div>
        </div>
      )}

      {/* Change Password Section */}
      <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">Update your password to secure your account.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={updatingPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">New Password</label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password (min. 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={updatingPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={updatingPassword}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updatingPassword}
            className="w-full mt-6"
          >
            {updatingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Active Sessions Section */}
      <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Active Sessions</h2>
            <p className="text-xs text-muted-foreground">Currently logged-in devices and browsers.</p>
          </div>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border border-border/40 rounded-xl p-4 flex items-start justify-between hover:border-border/60 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mt-0.5 shrink-0">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{session.device}</p>
                    {session.isCurrent && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{session.browser}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Last active: {formatDate(session.lastActive)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Sign Out</h2>
            <p className="text-xs text-muted-foreground">End your current session.</p>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          disabled={signingOut}
          variant="outline"
          className="w-full"
        >
          {signingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing Out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </>
          )}
        </Button>
      </div>

      {/* Delete Account Section - Danger Zone */}
      <div className="border border-red-200/50 rounded-2xl bg-red-50/30 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">Irreversible account deletion.</p>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-200/50 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div className="text-xs text-red-700/80">
              <p className="font-semibold mb-1">Warning: This action cannot be undone.</p>
              <p>Deleting your account will permanently remove all your data, orders, and account information from our system.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Confirm by typing your email address
            </label>
            <Input
              type="email"
              placeholder={`Type "${user?.email}" to confirm`}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              disabled={deletingAccount}
            />
          </div>

          <Button
            onClick={handleDeleteAccount}
            disabled={deletingAccount || deleteConfirm !== user?.email}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {deletingAccount ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting Account...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
