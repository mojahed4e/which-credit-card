-- Migration: Add GPS-specific columns to card_requests table
-- Run this in Supabase SQL editor

-- Add latitude/longitude columns if they don't exist
ALTER TABLE public.card_requests
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add comment to explain the columns
COMMENT ON COLUMN public.card_requests.latitude IS 'Latitude - prefers GPS (browser geolocation) over IP-based';
COMMENT ON COLUMN public.card_requests.longitude IS 'Longitude - prefers GPS (browser geolocation) over IP-based';

-- Create an index for geo queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_card_requests_geo 
ON public.card_requests (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
