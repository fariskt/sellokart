"use client";

import * as React from "react";
import { useState } from "react";
import { Title } from "@/components/ui/title";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, ShieldCheck, UserCheck, Search, Mail, Phone, Calendar } from "lucide-react";
import { CustomerProfile } from "@/features/customers/lib/types";

interface UsersClientProps {
  initialProfiles: CustomerProfile[];
}

export function UsersClient({ initialProfiles }: UsersClientProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = initialProfiles.filter((p) => {
    const matchesSearch =
      (p.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.phone?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = initialProfiles.length;
  const adminCount = initialProfiles.filter((p) => p.role === "admin").length;
  const customerCount = initialProfiles.filter((p) => p.role === "customer" || !p.role).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title>Users & Staff</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Registered customer accounts, staff members, and administrators from your database.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard
          label="Total Profiles"
          value={totalUsers}
          description="Registered database accounts"
          isFeatured={true}
          icon={Users}
        />
        <StatCard
          label="Administrators"
          value={adminCount}
          description="Accounts with admin privileges"
          icon={ShieldCheck}
        />
        <StatCard
          label="Customers"
          value={customerCount}
          description="Customer store accounts"
          icon={UserCheck}
        />
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-9 rounded-full bg-card border-border/80 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "admin", "customer"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                roleFilter === role
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {role === "all" ? "All Roles" : role === "admin" ? "Administrators" : "Customers"}
            </button>
          ))}
        </div>
      </div>

      {/* Real Profiles Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Profile</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Created Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No user profiles found in database.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((profile) => {
                const name = profile.name || "Unnamed User";
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?";

                return (
                  <TableRow key={profile.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border/60">
                          {profile.avatar && <AvatarImage src={profile.avatar} alt={name} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[140px]">
                            {profile.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {profile.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {profile.email}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {profile.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          {profile.phone}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          profile.role === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {profile.role || "customer"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {profile.created_at ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(profile.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
