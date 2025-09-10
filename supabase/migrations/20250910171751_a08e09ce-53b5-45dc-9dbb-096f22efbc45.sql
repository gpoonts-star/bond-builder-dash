-- Create service usage stats table
CREATE TABLE public.service_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),  -- optional, for logged users
  accessed_at timestamp DEFAULT now(),
  ip_address text,                               -- for anonymous tracking
  created_at timestamp DEFAULT now()
);

-- Create index for better performance on service_provider_id
CREATE INDEX idx_service_stats_provider_id ON public.service_stats(service_provider_id);
CREATE INDEX idx_service_stats_accessed_at ON public.service_stats(accessed_at);