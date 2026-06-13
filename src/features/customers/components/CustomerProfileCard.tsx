import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerProfile } from "../lib/types";
import { Calendar, Mail, Phone, Shield } from "lucide-react";

interface CustomerProfileCardProps {
  profile: CustomerProfile;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CustomerProfileCard({ profile }: CustomerProfileCardProps) {
  const name = profile.name || "Guest Customer";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <Card className="p-6 border border-border bg-card shadow-sm space-y-6 flex flex-col justify-between">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <Avatar className="h-24 w-24 border-4 border-muted shadow-sm">
          {profile.avatar && <AvatarImage src={profile.avatar} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Identity */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{name}</h2>
          <span className="mt-1.5 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Customer
          </span>
        </div>
      </div>

      {/* Information Details */}
      <div className="border-t border-border/80 pt-4 space-y-3">
        <div className="flex items-center text-sm text-muted-foreground gap-3">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <span className="truncate select-all text-foreground font-medium">{profile.email || "-"}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-3">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <span className="text-foreground font-medium">{profile.phone || "-"}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-3">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <span className="text-foreground font-medium">Joined {formatDate(profile.created_at)}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-3">
          <Shield className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <div className="truncate text-xs font-mono bg-muted/60 px-2 py-0.5 rounded border border-border w-full">
            ID: {profile.id}
          </div>
        </div>
      </div>
    </Card>
  );
}
