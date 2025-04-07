-- This script adds missing RLS policies for the cart and cart_items tables
-- Run this in the Supabase SQL Editor

-- First, enable RLS on both tables if not already enabled
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own carts
CREATE POLICY "Users can view own carts" ON public.carts 
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create carts
CREATE POLICY "Users can create carts" ON public.carts 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own carts
CREATE POLICY "Users can update own carts" ON public.carts 
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own carts
CREATE POLICY "Users can delete own carts" ON public.carts 
FOR DELETE USING (auth.uid() = user_id);

-- Allow users to view items in their carts
CREATE POLICY "Users can view items in own carts" ON public.cart_items 
FOR SELECT USING ((SELECT carts.user_id FROM carts WHERE carts.id = cart_id) = auth.uid());

-- Allow users to add items to their carts
CREATE POLICY "Users can add items to carts" ON public.cart_items 
FOR INSERT WITH CHECK ((SELECT carts.user_id FROM carts WHERE carts.id = cart_id) = auth.uid());

-- Allow users to update items in their carts
CREATE POLICY "Users can update items in carts" ON public.cart_items 
FOR UPDATE USING ((SELECT carts.user_id FROM carts WHERE carts.id = cart_id) = auth.uid());

-- Allow users to delete items from their carts
CREATE POLICY "Users can delete items from carts" ON public.cart_items 
FOR DELETE USING ((SELECT carts.user_id FROM carts WHERE carts.id = cart_id) = auth.uid());

-- Also add policy for service role to access everything 
-- (this is important for backend operations)
CREATE POLICY "Service role can do anything with carts" 
ON public.carts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do anything with cart items" 
ON public.cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add a policy to allow anonymous users to access carts with session_id
CREATE POLICY "Anonymous users can access carts by session_id" 
ON public.carts FOR ALL USING (
  session_id IS NOT NULL AND auth.role() = 'anon'
) WITH CHECK (
  session_id IS NOT NULL AND auth.role() = 'anon'
);

-- Add a policy to allow anonymous users to access cart items through session_id
CREATE POLICY "Anonymous users can access cart items through session_id" 
ON public.cart_items FOR ALL USING (
  (SELECT c.session_id FROM carts c WHERE c.id = cart_id) IS NOT NULL AND auth.role() = 'anon'
) WITH CHECK (
  (SELECT c.session_id FROM carts c WHERE c.id = cart_id) IS NOT NULL AND auth.role() = 'anon'
);