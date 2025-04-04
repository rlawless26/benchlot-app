-- Run this SQL in your Supabase SQL Editor to add incremental onboarding fields

-- Add fields needed for incremental onboarding
DO $$
BEGIN
  -- Add onboarding_progress field to track where sellers are in the process
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
                AND column_name = 'onboarding_progress') THEN
    ALTER TABLE public.users 
    ADD COLUMN onboarding_progress TEXT DEFAULT 'not_started';
  END IF;
  
  -- Add verification_requirements to store the current verification status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
                AND column_name = 'verification_requirements') THEN
    ALTER TABLE public.users 
    ADD COLUMN verification_requirements JSONB DEFAULT NULL;
  END IF;
  
  -- Add timestamp for when requirements were last checked
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
                AND column_name = 'last_requirements_check') THEN
    ALTER TABLE public.users 
    ADD COLUMN last_requirements_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
  
  -- Create an index on the onboarding_progress field for faster lookups
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE schemaname = 'public'
                AND tablename = 'users'
                AND indexname = 'idx_users_onboarding_progress') THEN
    CREATE INDEX idx_users_onboarding_progress ON public.users (onboarding_progress);
  END IF;
END
$$;

-- Make sure RLS policies allow these new fields
DO $$
BEGIN
  -- Update or create the policy for reading own user data including new fields
  DROP POLICY IF EXISTS "Users can view own verification status" ON public.users;
  
  CREATE POLICY "Users can view own verification status" ON public.users
    FOR SELECT
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
    
  -- Update or create the policy for updating own verification status
  DROP POLICY IF EXISTS "Users can update own verification status" ON public.users;
  
  CREATE POLICY "Users can update own verification status" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
END
$$;

-- Create an RPC function to check for verification requirements that need attention
CREATE OR REPLACE FUNCTION public.get_seller_verification_status(user_id UUID)
RETURNS TABLE (
  status TEXT,
  onboarding_progress TEXT,
  can_sell BOOLEAN,
  can_receive_payouts BOOLEAN,
  requirements_due JSONB
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.stripe_account_status as status,
    u.onboarding_progress,
    CASE WHEN u.stripe_account_id IS NOT NULL THEN true ELSE false END as can_sell,
    CASE WHEN u.stripe_account_status = 'active' THEN true ELSE false END as can_receive_payouts,
    u.verification_requirements as requirements_due
  FROM 
    public.users u
  WHERE 
    u.id = user_id;
END;
$$;