-- =============================================
-- PORTRAIT ORDERS DATA MODEL FOR POD PIPELINE
-- =============================================

-- Enum for POD status tracking
CREATE TYPE public.pod_status AS ENUM (
  'pending',
  'ready_for_pod',
  'sent_to_pod',
  'fulfilled',
  'error'
);

-- Main orders table
CREATE TABLE public.portrait_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT NOT NULL UNIQUE,
  shopify_order_number TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  total_price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  payment_status TEXT NOT NULL,
  pod_status public.pod_status NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL
);

-- Order line items table
CREATE TABLE public.portrait_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.portrait_orders(id) ON DELETE CASCADE,
  shopify_line_item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  styles JSONB,
  digital_addons JSONB,
  pod_options JSONB,
  bundle_discount NUMERIC(5, 2),
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_portrait_orders_shopify_order_id ON public.portrait_orders(shopify_order_id);
CREATE INDEX idx_portrait_orders_created_at ON public.portrait_orders(created_at DESC);
CREATE INDEX idx_portrait_orders_pod_status ON public.portrait_orders(pod_status);
CREATE INDEX idx_portrait_order_items_order_id ON public.portrait_order_items(order_id);

-- Enable RLS (server-only access via service role)
ALTER TABLE public.portrait_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portrait_order_items ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access these tables
-- This keeps them secure and server-only

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_portrait_orders_updated_at
  BEFORE UPDATE ON public.portrait_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();