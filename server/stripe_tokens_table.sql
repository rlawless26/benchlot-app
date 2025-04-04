-- Run this SQL in your Supabase SQL Editor to create the stripe_tokens table

-- Create the stripe_tokens table if it doesn't exist
DO $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stripe_tokens') THEN
    CREATE TABLE public.stripe_tokens (
      token TEXT PRIMARY KEY,
      stripe_account_id TEXT NOT NULL,
      user_id UUID NOT NULL REFERENCES public.users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ
    );
  END IF;
END
$$;

-- Setup RLS and policies
DO $$
BEGIN
  -- Enable RLS
  ALTER TABLE public.stripe_tokens ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Service role can do anything" ON public.stripe_tokens;
  DROP POLICY IF EXISTS "Users can view own tokens" ON public.stripe_tokens;
  
  -- Create policies
  CREATE POLICY "Service role can do anything" ON public.stripe_tokens
    USING (true)
    WITH CHECK (true);
  
  CREATE POLICY "Users can view own tokens" ON public.stripe_tokens
    FOR SELECT USING (auth.uid() = user_id);
  
  -- Grant privileges
  GRANT SELECT ON public.stripe_tokens TO authenticated;
  GRANT ALL ON public.stripe_tokens TO service_role;
END
$$;