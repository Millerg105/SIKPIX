import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Eye, Package, Copy, Check, Send, AlertCircle, Save, LogOut } from "lucide-react";
import { toast } from "sonner";

interface ValidationErrorDetail {
  itemId: string;
  styleName: string;
  field: string;
  message: string;
}

interface Order {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  total_price: number;
  currency: string;
  payment_status: string;
  pod_status: string;
  pod_error: { 
    message: string; 
    validationErrors?: ValidationErrorDetail[]; 
    timestamp: string 
  } | null;
  gelato_order_id: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  shopify_line_item_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  styles: string[] | null;
  digital_addons: Array<{ name: string; price: string }> | null;
  pod_options: { option: string; price: string } | null;
  bundle_discount: number | null;
  properties: Array<{ name: string; value: string }> | null;
  artwork_url: string | null;
  artwork_urls: Record<string, string> | null;
  reference_photos: string[] | null;
}

interface PodJobItem {
  lineItemId: string;
  itemId: string;
  styleName: string;
  printOption: string;
  fullOption: string;
  quantity: number;
  artworkUrl?: string;
}

interface PodJob {
  orderId: string;
  shopifyOrderNumber: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    zip: string;
    country: string;
    phone?: string;
  };
  items: PodJobItem[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ready_for_pod: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  sent_to_pod: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  fulfilled: "bg-green-500/20 text-green-400 border-green-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminOrders() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingToGelato, setSendingToGelato] = useState<string | null>(null);
  const [savingArtwork, setSavingArtwork] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{
    order: Order & { shipping_address?: any };
    items: OrderItem[];
    podJob: PodJob;
  } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Key: "itemId:styleName" -> value: artwork URL
  const [artworkUrls, setArtworkUrls] = useState<Record<string, string>>({});
  // Track validation errors per style
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const authenticate = () => {
    if (tokenInput.trim()) {
      setAdminToken(tokenInput.trim());
      setAuthenticated(true);
      sessionStorage.setItem("sikpix_admin_token", tokenInput.trim());
    }
  };

  const logout = () => {
    setAuthenticated(false);
    setAdminToken("");
    sessionStorage.removeItem("sikpix_admin_token");
    setOrders([]);
    setSelectedOrder(null);
    toast.success("Logged out");
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem("sikpix_admin_token") || localStorage.getItem("sikpix_admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
      setAuthenticated(true);
      if (localStorage.getItem("sikpix_admin_token")) {
        sessionStorage.setItem("sikpix_admin_token", savedToken);
        localStorage.removeItem("sikpix_admin_token");
      }
    }
  }, []);

  useEffect(() => {
    if (authenticated && adminToken) {
      fetchOrders();
    }
  }, [authenticated, adminToken]);

  // Initialize artwork URLs from POD job items when order details are loaded
  useEffect(() => {
    if (selectedOrder?.podJob?.items) {
      const urls: Record<string, string> = {};
      for (const item of selectedOrder.podJob.items) {
        const key = `${item.itemId}:${item.styleName}`;
        urls[key] = item.artworkUrl || "";
      }
      setArtworkUrls(urls);
      setFieldErrors({});
    }
  }, [selectedOrder?.podJob?.items]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-orders?action=list&limit=100`,
        {
          headers: {
            "x-admin-token": adminToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        setAuthenticated(false);
        setAdminToken("");
        sessionStorage.removeItem("sikpix_admin_token");
        toast.error("Invalid token");
        return;
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-orders?action=get&order_id=${orderId}`,
        {
          headers: {
            "x-admin-token": adminToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch order details");

      const data = await response.json();
      setSelectedOrder(data);
      setDetailsOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
    }
  };

  const generatePodJob = async (orderId: string) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-orders?action=generate-pod-job&order_id=${orderId}`,
        {
          headers: {
            "x-admin-token": adminToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to generate POD job");

      const data = await response.json();
      toast.success("POD job generated");
      fetchOrders();
      
      if (selectedOrder?.order.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          order: { ...prev.order, pod_status: 'ready_for_pod' },
          podJob: data.podJob
        } : null);
      }
    } catch (error) {
      console.error("Failed to generate POD job:", error);
      toast.error("Failed to generate POD job");
    }
  };

  const saveArtworkUrl = async (itemId: string, styleName: string) => {
    const key = `${itemId}:${styleName}`;
    const artworkUrl = artworkUrls[key] || "";
    setSavingArtwork(key);
    
    // Clear previous error for this field
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-orders?action=update-artwork-url`,
        {
          method: "POST",
          headers: {
            "x-admin-token": adminToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            item_id: itemId, 
            style_name: styleName,
            artwork_url: artworkUrl.trim() || null 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Set field-level error
        setFieldErrors(prev => ({ ...prev, [key]: data.error || "Failed to save" }));
        throw new Error(data.error || "Failed to save artwork URL");
      }

      toast.success(`Saved artwork for "${styleName}"`);
      
      // Update local POD job state
      if (selectedOrder) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          podJob: {
            ...prev.podJob,
            items: prev.podJob.items.map(item =>
              item.itemId === itemId && item.styleName === styleName 
                ? { ...item, artworkUrl: artworkUrl.trim() || undefined } 
                : item
            )
          }
        } : null);
      }
    } catch (error) {
      console.error("Failed to save artwork URL:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save artwork URL");
    } finally {
      setSavingArtwork(null);
    }
  };

  const sendToGelato = async (orderId: string) => {
    setSendingToGelato(orderId);
    setFieldErrors({});
    
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-orders?action=send-to-gelato`,
        {
          method: "POST",
          headers: {
            "x-admin-token": adminToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        }
      );

      const data = await response.json();

      if (data.status === 'ok' || data.status === 'already_sent') {
        toast.success(`Sent to Gelato: ${data.gelatoOrderId}`);
        fetchOrders();
        
        if (selectedOrder?.order.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            order: { 
              ...prev.order, 
              pod_status: 'sent_to_pod',
              gelato_order_id: data.gelatoOrderId,
              pod_error: null
            }
          } : null);
        }
      } else {
        // Map validation errors to field errors
        if (data.validationErrors && data.validationErrors.length > 0) {
          const newFieldErrors: Record<string, string> = {};
          for (const err of data.validationErrors as ValidationErrorDetail[]) {
            const key = `${err.itemId}:${err.styleName}`;
            newFieldErrors[key] = err.message;
          }
          setFieldErrors(newFieldErrors);
          
          toast.error(
            <div className="space-y-1">
              <div className="font-medium">Cannot send to Gelato</div>
              <div className="text-sm">{data.validationErrors.length} error(s) found - see details below</div>
            </div>,
            { duration: 6000 }
          );
        } else {
          toast.error(`Gelato error: ${data.error || 'Unknown error'}`);
        }
        fetchOrders();
        
        // Update local state with error
        if (selectedOrder?.order.id === orderId) {
          setSelectedOrder(prev => prev ? {
            ...prev,
            order: { 
              ...prev.order, 
              pod_status: 'error',
              pod_error: { 
                message: data.error, 
                validationErrors: data.validationErrors,
                timestamp: new Date().toISOString() 
              }
            }
          } : null);
        }
      }
    } catch (error) {
      console.error("Failed to send to Gelato:", error);
      toast.error("Failed to send to Gelato");
    } finally {
      setSendingToGelato(null);
    }
  };

  const copyPodJob = () => {
    if (selectedOrder?.podJob) {
      navigator.clipboard.writeText(JSON.stringify(selectedOrder.podJob, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("POD job copied to clipboard");
    }
  };

  // Count orders by status
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.pod_status] = (acc[order.pod_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>SikPix Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && authenticate()}
            />
            <Button onClick={authenticate} className="w-full">
              Access Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with status summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Badge key={status} variant="outline" className={STATUS_COLORS[status]}>
                  {status.replace(/_/g, " ")}: {count}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No orders found. Orders will appear here after customers complete payment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:bg-muted/20 transition-colors">
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {order.shopify_order_number}
                        </span>
                        <Badge variant="outline" className={STATUS_COLORS[order.pod_status]}>
                          {order.pod_status.replace(/_/g, " ")}
                        </Badge>
                        {order.gelato_order_id && (
                          <Badge variant="secondary" className="text-xs">
                            Gelato: {order.gelato_order_id.slice(0, 8)}...
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer_name || "Guest"} 
                        {order.customer_email && ` • ${order.customer_email}`}
                        {" • "}{order.currency} {order.total_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                      {order.pod_status === "error" && order.pod_error && (
                        <div className="flex items-start gap-1 text-xs text-red-400 mt-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <div>
                            {order.pod_error.message}
                            {order.pod_error.validationErrors && order.pod_error.validationErrors.length > 0 && (
                              <ul className="list-disc list-inside mt-1">
                                {order.pod_error.validationErrors.map((err, i) => (
                                  <li key={i}>{err.message}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {order.pod_status === "pending" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => generatePodJob(order.id)}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Generate POD
                        </Button>
                      )}
                      {(order.pod_status === "pending" || order.pod_status === "ready_for_pod" || order.pod_status === "error") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => sendToGelato(order.id)}
                          disabled={sendingToGelato === order.id}
                        >
                          {sendingToGelato === order.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-1" />
                          )}
                          Send to Gelato
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl h-[90vh] flex flex-col" aria-describedby="order-details-description">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                Order {selectedOrder?.order.shopify_order_number}
              </DialogTitle>
              <DialogDescription id="order-details-description">
                View order details, set artwork URLs, and send to Gelato for fulfillment.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-auto pr-4">
              {selectedOrder && (
                <div className="space-y-6 pr-4">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <p className="font-medium">{selectedOrder.order.customer_name || "Guest"}</p>
                      {selectedOrder.order.customer_email && (
                        <p className="text-xs text-muted-foreground">{selectedOrder.order.customer_email}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">
                        {selectedOrder.order.currency} {selectedOrder.order.total_price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment:</span>
                      <p className="font-medium capitalize">{selectedOrder.order.payment_status}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">POD Status:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={STATUS_COLORS[selectedOrder.order.pod_status]}>
                          {selectedOrder.order.pod_status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {selectedOrder.order.gelato_order_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Gelato ID: {selectedOrder.order.gelato_order_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error Display */}
                  {selectedOrder.order.pod_status === "error" && selectedOrder.order.pod_error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                      <div className="flex items-center gap-2 text-red-400 font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Gelato Error
                      </div>
                      <p className="text-sm text-red-300 mt-1">{selectedOrder.order.pod_error.message}</p>
                      {selectedOrder.order.pod_error.validationErrors && selectedOrder.order.pod_error.validationErrors.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-red-300 mt-2">
                          {selectedOrder.order.pod_error.validationErrors.map((err, i) => (
                            <li key={i}>{err.message}</li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-red-400/60 mt-2">{selectedOrder.order.pod_error.timestamp}</p>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.order.shipping_address && (
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                        <p>{selectedOrder.order.shipping_address.name}</p>
                        <p>{selectedOrder.order.shipping_address.address1}</p>
                        {selectedOrder.order.shipping_address.address2 && (
                          <p>{selectedOrder.order.shipping_address.address2}</p>
                        )}
                        <p>
                          {selectedOrder.order.shipping_address.city}, {selectedOrder.order.shipping_address.province} {selectedOrder.order.shipping_address.zip}
                        </p>
                        <p>{selectedOrder.order.shipping_address.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Customer Photos (from first item with reference_photos) */}
                  {selectedOrder.items.some(item => item.reference_photos && item.reference_photos.length > 0) && (
                    <div>
                      <h3 className="font-semibold mb-2">Customer Photos</h3>
                      {selectedOrder.items.filter(item => item.reference_photos && item.reference_photos.length > 0).map(item => (
                        <div key={item.id} className="bg-muted/30 p-3 rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {item.reference_photos!.length} photo(s)
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(item.reference_photos!.join('\n'));
                                toast.success("Photo URLs copied");
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy URLs
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {item.reference_photos!.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-square overflow-hidden rounded border border-border hover:border-primary transition-colors"
                              >
                                <img
                                  src={url}
                                  alt={`Customer photo ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Print Items with Individual Artwork URLs */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      Print Items ({selectedOrder.podJob.items.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.podJob.items.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded">
                          No print items in this order (digital-only)
                        </div>
                      ) : (
                        selectedOrder.podJob.items.map((podItem, idx) => {
                          const key = `${podItem.itemId}:${podItem.styleName}`;
                          const hasError = !!fieldErrors[key];
                          const isSaved = !!podItem.artworkUrl;
                          
                          return (
                            <div 
                              key={key} 
                              className={`bg-muted/30 p-3 rounded text-sm space-y-2 ${hasError ? 'border border-red-500/50' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-medium">{podItem.styleName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {podItem.printOption}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Print #{idx + 1}
                                </Badge>
                              </div>
                              
                              {/* Artwork URL Input */}
                              <div className="pt-2 border-t border-border/50">
                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                  Artwork URL for "{podItem.styleName}"
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    type="url"
                                    placeholder="https://...supabase.co/storage/v1/object/public/artworks/..."
                                    value={artworkUrls[key] || ""}
                                    onChange={(e) => setArtworkUrls(prev => ({ ...prev, [key]: e.target.value }))}
                                    className={`flex-1 text-xs h-8 ${hasError ? 'border-red-500' : ''}`}
                                  />
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => saveArtworkUrl(podItem.itemId, podItem.styleName)}
                                    disabled={savingArtwork === key}
                                  >
                                    {savingArtwork === key ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3" />
                                    )}
                                    <span className="ml-1">Save</span>
                                  </Button>
                                </div>
                                {hasError && (
                                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {fieldErrors[key]}
                                  </p>
                                )}
                                {isSaved && !hasError && (
                                  <p className="text-xs text-green-500 mt-1">
                                    ✓ Artwork URL set
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Digital Add-ons & Other Line Item Info */}
                  {selectedOrder.items.some(item => item.digital_addons && item.digital_addons.length > 0) && (
                    <div>
                      <h3 className="font-semibold mb-2">Digital Add-ons</h3>
                      <div className="bg-muted/30 p-3 rounded text-sm">
                        {selectedOrder.items
                          .filter(item => item.digital_addons && item.digital_addons.length > 0)
                          .flatMap(item => item.digital_addons!)
                          .map((addon, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{addon.name}</span>
                              <span className="text-muted-foreground">+£{addon.price}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* POD Job JSON */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">POD Job JSON</h3>
                      <Button variant="outline" size="sm" onClick={copyPodJob}>
                        {copied ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <Textarea
                      readOnly
                      value={JSON.stringify(selectedOrder.podJob, null, 2)}
                      className="font-mono text-xs h-48 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.order.pod_status === "pending" && (
                      <Button 
                        variant="secondary"
                        onClick={() => generatePodJob(selectedOrder.order.id)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Mark as Ready for POD
                      </Button>
                    )}
                    {(selectedOrder.order.pod_status === "pending" || 
                      selectedOrder.order.pod_status === "ready_for_pod" || 
                      selectedOrder.order.pod_status === "error") && (
                      <Button 
                        onClick={() => sendToGelato(selectedOrder.order.id)}
                        disabled={sendingToGelato === selectedOrder.order.id}
                      >
                        {sendingToGelato === selectedOrder.order.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send to Gelato
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
