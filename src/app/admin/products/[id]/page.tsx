import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getProductDetails } from "@/features/products/lib/product.action";
import { getProductReviews } from "@/features/reviews/lib/reviews.action";

import { ProductOverviewTab } from "@/features/products/components/ProductOverviewTab";
import { ProductReviewsTab } from "@/features/reviews/components/ProductReviewsTab";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;

  // Fetch product data
  const productRes = await getProductDetails(id);

  if (!productRes.success || !productRes.data) {
    return (
      <div className="p-6 min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <PackageOpen className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Product Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {productRes.message || "The requested product profile does not exist or has been deleted."}
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  const product = productRes.data;

  // Retrieve reviews for this product
  const reviews = await getProductReviews(id);

  return (
    <div className="p-6 space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-lg border-border">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              View specifications, inventory, pricing, variants, and reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Main activities tabbed view */}
      <div className="w-full">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto w-fit">
            <TabsTrigger
              value="overview"
              className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="outline-hidden focus-visible:ring-0">
            <ProductOverviewTab product={product} />
          </TabsContent>

          <TabsContent value="reviews" className="outline-hidden focus-visible:ring-0">
            <ProductReviewsTab reviews={reviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
