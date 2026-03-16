-- Add artwork_url column to portrait_order_items for storing the final artwork URL per line item
ALTER TABLE public.portrait_order_items 
ADD COLUMN artwork_url TEXT NULL;