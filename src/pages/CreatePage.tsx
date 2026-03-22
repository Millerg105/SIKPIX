import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { imageMap } from "@/hooks/useImageMap";
import { addOns, podOptions, BASE_PRICE, bundleDiscounts } from "@/data/shopifyConfig";
import {
  useOrderState,
  calculateOrderTotals,
  generateShopifyExport,
  type OrderState,
  type ShopifyOrderExport,
} from "@/hooks/useOrderState";
import { createPortraitCheckout } from "@/lib/shopify";
import { toast } from "sonner";
import { CustomerPhotoUpload, uploadCustomerPhotos, type UploadedPhoto } from "@/components/CustomerPhotoUpload";

// Type for per-portrait POD selections
type PortraitPodSelection = {
  styleSlug: string;
  styleName: string;
  podOption: { id: string; label: string; price: number } | null;
};

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const preselectedStyle = searchParams.get("style") || "";

  const [selectedStyles, setSelectedStyles] = useState<string[]>(preselectedStyle ? [preselectedStyle] : []);
  const [customerPhotos, setCustomerPhotos] = useState<UploadedPhoto[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
  const [uploadSessionId] = useState(() => crypto.randomUUID());

  // Per-portrait POD selections for bundles
  const [portraitPodSelections, setPortraitPodSelections] = useState<PortraitPodSelection[]>([]);

  const {
    orderState,
    setOrderState,
    toggleAddOn,
    setBundle,
    setStyle,
    setCustomerNotes,
    isAddOnSelected,
    shopifyProperties,
    shopifyExport,
  } = useOrderState(selectedStyles[0] || "", products.find((p) => p.slug === selectedStyles[0])?.name || "");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Calculate required styles based on bundle
  const requiredStyleCount = orderState.bundle?.size || 1;
  const selectedStyleCount = selectedStyles.length;
  const needsMoreStyles = selectedStyleCount < requiredStyleCount;

  // Sync portrait POD selections when styles change
  useEffect(() => {
    setPortraitPodSelections((prev) => {
      const newSelections: PortraitPodSelection[] = selectedStyles.map((slug) => {
        const existing = prev.find((p) => p.styleSlug === slug);
        const product = products.find((p) => p.slug === slug);
        return (
          existing || {
            styleSlug: slug,
            styleName: product?.name || slug,
            podOption: null,
          }
        );
      });
      return newSelections;
    });
  }, [selectedStyles]);

  // Calculate totals including per-portrait POD
  const totals = useMemo(() => {
    const totalPodPrice = portraitPodSelections.reduce((sum, p) => sum + (p.podOption?.price || 0), 0);
    const baseTotal = calculateOrderTotals({
      ...orderState,
      podOption: null, // We handle POD separately for bundles
    });

    const subtotalBeforeDiscount = baseTotal.subtotalBeforeDiscount + totalPodPrice;
    const totalAfterDiscount = baseTotal.totalAfterDiscount + totalPodPrice;

    return {
      ...baseTotal,
      podPrice: totalPodPrice,
      subtotalBeforeDiscount,
      totalAfterDiscount,
    };
  }, [orderState, portraitPodSelections]);

  // Handle per-portrait POD selection
  const handlePortraitPodChange = useCallback((styleSlug: string, podId: string | null) => {
    setPortraitPodSelections((prev) =>
      prev.map((p) => {
        if (p.styleSlug !== styleSlug) return p;
        if (!podId) return { ...p, podOption: null };
        const pod = podOptions.find((po) => po.id === podId);
        if (!pod) return p;
        return { ...p, podOption: { id: pod.id, label: pod.name, price: pod.price } };
      }),
    );
  }, []);

  // Handle style selection (supports multi-select for bundles)
  const handleStyleToggle = (slug: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(slug)) {
        const newSelection = prev.filter((s) => s !== slug);
        if (newSelection.length > 0) {
          const firstProduct = products.find((p) => p.slug === newSelection[0]);
          if (firstProduct) setStyle(firstProduct.id, firstProduct.name);
        }
        return newSelection;
      } else {
        const maxSelections = orderState.bundle?.size || 1;
        if (prev.length < maxSelections) {
          const newSelection = [...prev, slug];
          if (newSelection.length === 1) {
            const product = products.find((p) => p.slug === slug);
            if (product) setStyle(product.id, product.name);
          }
          return newSelection;
        }
        return prev;
      }
    });
  };

  // Update bundle handler to reset styles if needed
  const handleBundleChange = (size: number | null) => {
    setBundle(size);
    if (size === null || size === 1) {
      setSelectedStyles((prev) => prev.slice(0, 1));
      setPortraitPodSelections((prev) => prev.slice(0, 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "notes") setCustomerNotes(value);
  };

  const isFormComplete =
    selectedStyles.length >= requiredStyleCount && customerPhotos.length > 0 && formData.name && formData.email;
  const hasUploadErrors = customerPhotos.some((p) => p.error);
  const isUploading = customerPhotos.some((p) => p.uploading);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Get selected products details
  const selectedProducts = useMemo(
    () => selectedStyles.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean),
    [selectedStyles],
  );

  // Generate final Shopify-ready export object and create checkout
  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      // Upload photos first
      let referencePhotos: string[] = [];
      if (customerPhotos.length > 0) {
        toast.info("Uploading photos...");
        referencePhotos = await uploadCustomerPhotos(customerPhotos, uploadSessionId, setCustomerPhotos);
      }

      // Build complete order export with per-portrait POD selections
      const orderExport = {
        styles: selectedProducts.map((p) => ({
          styleId: p?.id || "",
          styleName: p?.name || "",
          styleSlug: p?.slug || "",
        })),
        portraitPodSelections: portraitPodSelections.map((p) => ({
          styleSlug: p.styleSlug,
          styleName: p.styleName,
          podOption: p.podOption,
        })),
        totalBeforeDiscount: totals.subtotalBeforeDiscount,
        totalAfterDiscount: totals.totalAfterDiscount,
        customerName: formData.name,
        customerEmail: formData.email,
        bundle: orderState.bundle
          ? {
              label: `${orderState.bundle.size} Artwork Bundle`,
              discountPercent: orderState.bundle.discountPercent,
              size: orderState.bundle.size,
            }
          : null,
        digitalAddOns: orderState.digitalAddOns.map((a) => ({
          id: a.id,
          label: a.label,
          price: a.price,
        })),
        specialRequests: formData.notes || undefined,
        referencePhotos,
      };

      const checkoutUrl = await createPortraitCheckout(orderExport);
      window.location.href = checkoutUrl;
      toast.success("Redirecting to checkout...");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed", {
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        duration: 8000,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <PublicSiteShell>
      <div>
        {/* Hero */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-6">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">Start Your Transformation</p>
            <h1 className="font-display text-5xl font-medium tracking-tight text-foreground md:text-6xl">
              Upload Your Car
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              Follow the steps below to create your masterpiece. Final payment and add-ons will be handled via secure
              Shopify checkout.
            </p>
          </div>
        </section>

        {/* Form Steps */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl space-y-12">
              {/* Step 1: Bundle Selection (Moved up for UX) */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                    1
                  </span>
                  <h2 className="font-display text-2xl font-medium tracking-[0.02em] text-foreground">Pick Your Pricing</h2>
                </div>

                <p className="mb-4 font-body text-sm text-muted-foreground">
                  Start with one digital artwork for a tenner, or move up to bundles for the best value before adding prints and extras.
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    onClick={() => handleBundleChange(null)}
                    className={`flex min-h-[132px] flex-col items-center justify-center rounded border px-4 py-5 text-center transition-all ${
                      !orderState.bundle ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(57,255,20,0.12)]" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-display text-lg font-semibold uppercase tracking-[0.03em] text-foreground">1 Digital Artwork</span>
                    <span className="mt-2 font-price text-3xl font-semibold text-primary">£{BASE_PRICE.toFixed(2)}</span>
                    <span className="mt-2 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Best for first-time orders</span>
                  </button>

                  {bundleDiscounts.map((bundle) => (
                    <button
                      key={bundle.id}
                      onClick={() =>
                        handleBundleChange(orderState.bundle?.size === bundle.minQuantity ? null : bundle.minQuantity)
                      }
                      className={`relative flex min-h-[132px] flex-col items-center justify-center rounded border px-4 pb-5 pt-6 text-center transition-all ${
                        orderState.bundle?.size === bundle.minQuantity
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(57,255,20,0.14)]"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="mb-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {bundle.badge}
                      </span>
                      <span className="font-display text-lg font-semibold uppercase leading-none tracking-[0.03em] text-foreground">{bundle.name}</span>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-price text-[11px] text-muted-foreground line-through">£{bundle.compareAtPrice.toFixed(2)}</span>
                        <span className="font-price text-3xl font-semibold text-primary">£{bundle.finalPrice.toFixed(2)}</span>
                      </div>
                      <span className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{bundle.discountLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Styles */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                      2
                    </span>
                    <h2 className="font-display text-2xl font-medium text-foreground">
                      Choose Your Style{requiredStyleCount > 1 ? "s" : ""}
                    </h2>
                  </div>
                  {requiredStyleCount > 1 && (
                    <span
                      className={`rounded-full px-3 py-1 font-body text-xs ${
                        needsMoreStyles ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {selectedStyleCount}/{requiredStyleCount} selected
                    </span>
                  )}
                </div>

                {requiredStyleCount > 1 && needsMoreStyles && (
                  <div className="mb-4 rounded border border-primary/50 bg-primary/5 p-3">
                    <p className="font-body text-sm text-primary">
                      Select {requiredStyleCount - selectedStyleCount} more style
                      {requiredStyleCount - selectedStyleCount > 1 ? "s" : ""} to complete your bundle.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => {
                    const isSelected = selectedStyles.includes(product.slug);
                    const canSelect = isSelected || selectedStyles.length < requiredStyleCount;

                    return (
                      <button
                        key={product.id}
                        onClick={() => handleStyleToggle(product.slug)}
                        disabled={!canSelect && !isSelected}
                        className={`group relative aspect-square overflow-hidden rounded transition-all ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : canSelect
                              ? "opacity-70 hover:opacity-100"
                              : "opacity-30 cursor-not-allowed"
                        }`}
                      >
                        <img src={imageMap[product.id]} alt={product.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 to-transparent p-2">
                          <span className="font-body text-xs text-foreground line-clamp-2 sm:text-sm">{product.name}</span>
                        </div>
                        {isSelected && requiredStyleCount > 1 && (
                          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {selectedStyles.indexOf(product.slug) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mt-6 rounded border border-border/50 bg-charcoal p-4">
                    <p className="font-body text-sm text-foreground mb-2">
                      <span className="text-primary">Selected:</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((product, index) => (
                        <span
                          key={product!.id}
                          className="rounded bg-primary/20 px-3 py-1 font-body text-xs text-foreground"
                        >
                          {index + 1}. {product!.name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 font-body text-xs text-muted-foreground">
                      Base price: £{BASE_PRICE.toFixed(2)} per artwork
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Upload Photos */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                    3
                  </span>
                  <h2 className="font-display text-2xl font-medium text-foreground">Upload Your Car Photos</h2>
                </div>

                <p className="mb-4 font-body text-sm text-muted-foreground">
                  Upload 1-4 clear photos of your car. These will be used as reference for your artwork.
                </p>

                <CustomerPhotoUpload
                  photos={customerPhotos}
                  onPhotosChange={setCustomerPhotos}
                  maxPhotos={4}
                  disabled={isCheckingOut}
                />
              </div>

              {/* Step 4: Digital Add-Ons */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                    4
                  </span>
                  <h2 className="font-display text-2xl font-medium text-foreground">Choose Optional Add-Ons</h2>
                </div>

                <p className="mb-4 font-body text-xs text-muted-foreground">
                  Optional extras to boost delivery speed and social-ready exports.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {addOns.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`flex items-start gap-4 rounded border p-4 text-left transition-all ${
                        isAddOnSelected(addon.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                          isAddOnSelected(addon.id) ? "border-primary bg-primary" : "border-border"
                        }`}
                      >
                        {isAddOnSelected(addon.id) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-primary-foreground"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-sm font-medium text-foreground">{addon.name}</span>
                          <span className="font-body text-sm text-primary">+£{addon.price.toFixed(2)}</span>
                        </div>
                        <p className="mt-1 font-body text-xs text-muted-foreground">{addon.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Print Options (POD) - Per Portrait for Bundles */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/50 font-body text-sm font-semibold text-primary-foreground">
                    +
                  </span>
                  <h2 className="font-display text-2xl font-medium text-foreground">Add a Physical Print</h2>
                </div>
                <p className="mb-6 font-body text-xs text-muted-foreground">
                  Optional: add a print or premium canvas for each artwork in your order. Each piece can have its own print option.
                </p>

                {selectedStyles.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground italic">
                    Select a style above to see print options.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {portraitPodSelections.map((portrait, index) => {
                      const product = products.find((p) => p.slug === portrait.styleSlug);
                      return (
                        <div key={portrait.styleSlug} className="rounded border border-border/50 bg-charcoal p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <img
                              src={imageMap[product?.id || ""]}
                              alt={portrait.styleName}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div>
                              <p className="font-body text-sm font-medium text-foreground">
                                Artwork {index + 1}: {portrait.styleName}
                              </p>
                              <p className="font-body text-xs text-muted-foreground">
                                {portrait.podOption ? portrait.podOption.label : "Digital Only"}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <button
                              onClick={() => handlePortraitPodChange(portrait.styleSlug, null)}
                              className={`flex items-center gap-3 rounded border p-3 text-left transition-all ${
                                !portrait.podOption
                                  ? "border-primary bg-primary/10"
                                  : "border-border/50 hover:border-primary/50"
                              }`}
                            >
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                  !portrait.podOption ? "border-primary bg-primary" : "border-border"
                                }`}
                              >
                                {!portrait.podOption && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                              <span className="font-body text-xs text-foreground">Digital Only</span>
                            </button>

                            {podOptions.map((pod) => (
                              <button
                                key={pod.id}
                                onClick={() =>
                                  handlePortraitPodChange(
                                    portrait.styleSlug,
                                    portrait.podOption?.id === pod.id ? null : pod.id,
                                  )
                                }
                                className={`flex items-center justify-between gap-3 rounded border p-3 text-left transition-all ${
                                  portrait.podOption?.id === pod.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border/50 hover:border-primary/50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                      portrait.podOption?.id === pod.id ? "border-primary bg-primary" : "border-border"
                                    }`}
                                  >
                                    {portrait.podOption?.id === pod.id && (
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                    )}
                                  </div>
                                  <span className="font-body text-xs text-foreground">{pod.name}</span>
                                </div>
                                <span className="font-body text-xs text-primary">+£{pod.price.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 6: Your Details */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                    5
                  </span>
                  <h2 className="font-display text-2xl font-medium text-foreground">Your Details</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block font-body text-sm text-foreground">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className="w-full rounded border border-border bg-charcoal px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block font-body text-sm text-foreground">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full rounded border border-border bg-charcoal px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="notes" className="mb-2 block font-body text-sm text-foreground">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any preferences for pose, outfit, background, or style variations..."
                    rows={4}
                    className="w-full rounded border border-border bg-charcoal px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Step 7: Summary & Checkout */}
              <div className="card-luxury p-8">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                    6
                  </span>
                  <h2 className="font-display text-2xl font-medium text-foreground">Summary & Checkout</h2>
                </div>

                <div className="rounded border border-border/50 bg-charcoal p-6">
                  <div className="space-y-4">
                    {/* Styles */}
                    <div className="flex justify-between">
                      <span className="font-body text-sm text-muted-foreground">
                        Style{selectedProducts.length > 1 ? "s" : ""} ({selectedProducts.length})
                      </span>
                      <span className="font-body text-sm text-foreground text-right">
                        {selectedProducts.map((p) => p!.name).join(", ") || "Not selected"}
                      </span>
                    </div>

                    {/* Base Price */}
                    <div className="flex justify-between gap-4">
                      <span className="font-body text-sm text-muted-foreground">Digital Artwork Package</span>
                      <span className="font-price text-sm text-foreground">
                        {orderState.bundle
                          ? `£${bundleDiscounts.find((bundle) => bundle.minQuantity === orderState.bundle?.size)?.finalPrice.toFixed(2)}`
                          : `£${(BASE_PRICE * requiredStyleCount).toFixed(2)}`}
                      </span>
                    </div>
                    {orderState.bundle && (
                      <div className="-mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
                        <span className="font-price line-through">
                          £{bundleDiscounts.find((bundle) => bundle.minQuantity === orderState.bundle?.size)?.compareAtPrice.toFixed(2)}
                        </span>
                        <span className="font-body uppercase tracking-[0.2em] text-primary">
                          {bundleDiscounts.find((bundle) => bundle.minQuantity === orderState.bundle?.size)?.badge}
                        </span>
                      </div>
                    )}

                    {/* Add-Ons */}
                    {orderState.digitalAddOns.length > 0 && (
                      <div className="border-t border-border/30 pt-4">
                        <div className="flex justify-between">
                          <span className="font-body text-sm text-muted-foreground">Digital Add-Ons</span>
                          <span className="font-price text-sm text-foreground">+£{totals.addOnsTotal.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 space-y-1 pl-4">
                          {orderState.digitalAddOns.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-xs text-muted-foreground">
                              <span>• {addon.label}</span>
                              <span>£{addon.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* POD Options - Per Portrait */}
                    {portraitPodSelections.some((p) => p.podOption) && (
                      <div className="border-t border-border/30 pt-4">
                        <div className="flex justify-between">
                          <span className="font-body text-sm text-muted-foreground">Print Options</span>
                          <span className="font-price text-sm text-foreground">+£{totals.podPrice.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 space-y-1 pl-4">
                          {portraitPodSelections
                            .filter((p) => p.podOption)
                            .map((p) => (
                              <div key={p.styleSlug} className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  • {p.styleName}: {p.podOption?.label}
                                </span>
                                <span>£{p.podOption?.price.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Bundle */}
                    {orderState.bundle && (
                      <div className="border-t border-border/30 pt-4">
                        <div className="flex justify-between">
                          <span className="font-body text-sm text-muted-foreground">Bundle</span>
                          <span className="font-body text-sm text-primary">{totals.bundleLabel}</span>
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-2 border-t border-border/30 pt-4">
                      {orderState.bundle && (
                        <>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-muted-foreground">Compare at</span>
                            <span className="font-price text-sm text-foreground">
                              £{totals.subtotalBeforeDiscount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-primary">
                              Bundle Discount ({totals.discountPercent}%)
                            </span>
                            <span className="font-price text-sm text-primary">-£{totals.discountAmount.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between border-t border-border/30 pt-3">
                        <span className="font-body text-lg font-semibold text-foreground">Total</span>
                        <span className="font-display text-2xl font-semibold text-primary">
                          £{totals.totalAfterDiscount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="mt-8">
                    <Button
                      variant="hero"
                      size="hero"
                      className="w-full"
                      disabled={!isFormComplete}
                      onClick={handleCheckout}
                    >
                      {needsMoreStyles
                        ? `Select ${requiredStyleCount - selectedStyleCount} More Style${requiredStyleCount - selectedStyleCount > 1 ? "s" : ""}`
                        : isFormComplete
                          ? "Proceed to Checkout"
                          : "Complete All Steps Above"}
                    </Button>
                    <p className="mt-3 text-center font-body text-xs text-muted-foreground">
                      Secure checkout powered by Shopify. Your data is protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default CreatePage;
