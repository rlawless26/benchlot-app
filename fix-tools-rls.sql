-- This script fixes RLS policies for the tools table to work with anonymous access

-- First drop any existing policies with the same names (if they exist) to avoid errors
DO $$
BEGIN
    -- Try to drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Anonymous users can view tools" ON public.tools;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, ignore error
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Authenticated users can view available tools" ON public.tools;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, ignore error
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Service role can do anything with tools" ON public.tools;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, ignore error
    END;
END
$$;

-- Make sure anonymous users can view available tools
CREATE POLICY "Anonymous users can view tools" 
ON public.tools 
FOR SELECT 
TO anon
USING (is_sold = false);

-- Also ensure a policy for authenticated users to view available tools
CREATE POLICY "Authenticated users can view available tools" 
ON public.tools 
FOR SELECT 
TO authenticated
USING (is_sold = false);

-- Ensure service role has full access
CREATE POLICY "Service role can do anything with tools"
ON public.tools
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;