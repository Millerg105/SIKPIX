-- Add pod_error column to store Gelato API error details
ALTER TABLE public.portrait_orders 
ADD COLUMN IF NOT EXISTS pod_error JSONB DEFAULT NULL;

-- Add index for filtering by pod_status (common query pattern in admin)
CREATE INDEX IF NOT EXISTS idx_portrait_orders_pod_status 
ON public.portrait_orders(pod_status);

-- Add gelato_order_id column to track the Gelato order reference
ALTER TABLE public.portrait_orders 
ADD COLUMN IF NOT EXISTS gelato_order_id TEXT DEFAULT NULL;