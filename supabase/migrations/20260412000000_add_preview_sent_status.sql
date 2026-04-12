-- Add 'preview_sent' to the pod_status enum for watermark preview workflow
ALTER TYPE public.pod_status ADD VALUE IF NOT EXISTS 'preview_sent' AFTER 'ready_for_pod';
