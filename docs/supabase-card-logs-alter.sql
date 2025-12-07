-- Migration: Add location columns to card_requests table
-- 
-- Run this SQL in your Supabase SQL editor to add location tracking columns.
-- These columns will be populated when users grant "full" consent.
--
-- Note: The existing columns (country, region, city, latitude, longitude) 
-- may not exist yet. This script adds them if missing.

ALTER TABLE public.card_requests
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS latitude text,
  ADD COLUMN IF NOT EXISTS longitude text;

-- Add comment to table for documentation
COMMENT ON TABLE public.card_requests IS 
  'Logs card calculation requests. Personal data (IP, user_agent, location) only logged with user consent.';

-- Add comments to columns
COMMENT ON COLUMN public.card_requests.country IS 'Country from Vercel geo headers (with consent)';
COMMENT ON COLUMN public.card_requests.region IS 'Region/state from Vercel geo headers (with consent)';
COMMENT ON COLUMN public.card_requests.city IS 'City from Vercel geo headers (with consent)';
COMMENT ON COLUMN public.card_requests.latitude IS 'Latitude from Vercel geo headers (with consent)';
COMMENT ON COLUMN public.card_requests.longitude IS 'Longitude from Vercel geo headers (with consent)';
