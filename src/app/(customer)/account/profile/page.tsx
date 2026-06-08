"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  User as UserIcon, 
  Loader2, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Phone,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSandbox, setIsSandbox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        let dbProfile = null;
        try {
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionUser.id)
            .single();
          
          if (!profileError && data) {
            dbProfile = data;
          }
        } catch (dbErr) {
          setIsSandbox(true);
          console.warn("Profiles table not found, falling back to auth metadata.");
        }

        const metaName = sessionUser.user_metadata?.full_name || "";
        const metaPhone = sessionUser.user_metadata?.phone || "";
        
        setFullName(dbProfile?.full_name || metaName || sessionUser.email?.split("@")[0] || "");
        setPhone(dbProfile?.phone || metaPhone || "");
        setAvatarUrl(dbProfile?.avatar_url || sessionUser.user_metadata?.avatar_url || "");
      } catch (err: any) {
        setError("Failed to load user profile data.");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const supabase = createClient();
      
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl
        }
      });

      if (authError) throw authError;

      try {
        const { error: dbError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: fullName,
            phone: phone,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          });
        
        if (dbError) {
          console.warn("Profiles table upsert failed, metadata updated successfully.", dbError.message);
          setIsSandbox(true);
        }
      } catch (dbErr) {
        setIsSandbox(true);
      }

      setSuccess("Profile settings updated successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be smaller than 2MB.");
      return;
    }

    setUploading(true);
    setSuccess("");
    setError("");

    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarUrl(localPreviewUrl);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        console.warn("Storage upload failed, falling back to local base64 simulation:", uploadError.message);
        setIsSandbox(true);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAvatarUrl(base64data);
          setSuccess("Avatar simulated locally (Sandbox mode). Click Save Profile to apply.");
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      setSuccess("Image uploaded successfully! Click Save Profile to apply changes.");
    } catch (err: any) {
      setError("Failed to upload avatar image.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        title="Profile Settings"
        description="Manage your contact credentials and public metadata details."
        icon={UserIcon}
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Your updates will be synchronized with your active Supabase session metadata, but direct database writes or physical storage bucket uploads are simulated.
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

      {/* Main card */}
      <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-3 pb-6 border-b border-border/60">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center relative shadow-xs">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-muted-foreground" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground font-semibold">
                JPG, PNG or WEBP. Max 2MB.
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <UserIcon className="w-4 h-4" />
                </div>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={saving}
                  className="h-10 pl-11 border border-border"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5 opacity-70">
              <label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  readOnly
                  value={user?.email || ""}
                  className="h-10 pl-11 border border-border bg-muted/30 cursor-not-allowed text-muted-foreground"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                  className="h-10 pl-11 border border-border"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={saving || uploading}
              className="w-full h-11 font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
