import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  getCustomerAddresses,
  getCustomerById,
  getCustomerOrders,
  getCustomerReturns,
  getCustomerReviews,
  getCustomerStats,
  getCustomerWishlist,
} from "@/features/customers/lib/customers.action";

import { CustomerProfileCard } from "@/features/customers/components/CustomerProfileCard";
import { CustomerStatsCard } from "@/features/customers/components/CustomerStatsCard";
import { CustomerOrdersTab } from "@/features/customers/components/CustomerOrdersTab";
import { CustomerAddressesTab } from "@/features/customers/components/CustomerAddressesTab";
import { CustomerReturnsTab } from "@/features/customers/components/CustomerReturnsTab";
import { CustomerReviewsTab } from "@/features/customers/components/CustomerReviewsTab";
import { CustomerWishlistTab } from "@/features/customers/components/CustomerWishlistTab";

interface CustomerDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
  const { id } = await params;

  // Fetch all user information in parallel
  const profileRes = await getCustomerById(id);

  if (!profileRes.success || !profileRes.data) {
    return (
      <div className="p-6 min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <UserX className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Customer Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {profileRes.message || "The requested customer profile does not exist or has been deleted."}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  const profile = profileRes.data;

  // Retrieve statistical and related items in parallel
  const [stats, orders, addresses, returnsData, reviews, wishlist] = await Promise.all([
    getCustomerStats(id),
    getCustomerOrders(id),
    getCustomerAddresses(id),
    getCustomerReturns(id),
    getCustomerReviews(id),
    getCustomerWishlist(id),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-lg border-border">
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Customer Profile</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review history, details, wishlist, and reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Statistics Card Grid */}
      <CustomerStatsCard stats={stats} />

      {/* Profile Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left column: Profile card */}
        <div className="lg:col-span-1">
          <CustomerProfileCard profile={profile} />
        </div>

        {/* Right column: Tabbed activities */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto w-fit">
              <TabsTrigger value="orders" className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="addresses" className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                Addresses ({addresses.length})
              </TabsTrigger>
              <TabsTrigger value="returns" className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                Returns ({returnsData.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                Wishlist ({wishlist.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="outline-hidden focus-visible:ring-0">
              <CustomerOrdersTab orders={orders} />
            </TabsContent>

            <TabsContent value="addresses" className="outline-hidden focus-visible:ring-0">
              <CustomerAddressesTab addresses={addresses} />
            </TabsContent>

            <TabsContent value="returns" className="outline-hidden focus-visible:ring-0">
              <CustomerReturnsTab returns={returnsData} />
            </TabsContent>

            <TabsContent value="reviews" className="outline-hidden focus-visible:ring-0">
              <CustomerReviewsTab reviews={reviews} />
            </TabsContent>

            <TabsContent value="wishlist" className="outline-hidden focus-visible:ring-0">
              <CustomerWishlistTab wishlist={wishlist} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
