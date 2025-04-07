

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_seller_verification_status"("user_id" "uuid") RETURNS TABLE("status" "text", "onboarding_progress" "text", "can_sell" boolean, "can_receive_payouts" boolean, "requirements_due" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_seller_verification_status"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update users
  set rating = (
    select avg(rating)::numeric(3,2)
    from reviews
    where reviewed_user_id = new.reviewed_user_id
  )
  where id = new.reviewed_user_id;
  return new;
end;
$$;


ALTER FUNCTION "public"."update_user_rating"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_actions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "action" "text" NOT NULL,
    "performed_by" "uuid",
    "performed_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "details" "jsonb"
);


ALTER TABLE "public"."admin_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cart_id" "uuid" NOT NULL,
    "tool_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "tool_name" "text",
    "tool_condition" "text",
    "tool_image_url" "text"
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "session_id" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "subtotal" numeric(10,2) DEFAULT 0,
    "total" numeric(10,2) DEFAULT 0,
    "tax_amount" numeric(10,2) DEFAULT 0,
    "shipping_amount" numeric(10,2) DEFAULT 0,
    "created_from_offer_id" "uuid",
    CONSTRAINT "carts_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'converted'::"text", 'abandoned'::"text"])))
);


ALTER TABLE "public"."carts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "tool_id" "uuid",
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "message_type" character varying(20) DEFAULT 'text'::character varying NOT NULL,
    "offer_id" "uuid"
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tool_id" "uuid" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "counter_amount" numeric(10,2),
    "message_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "expires_at" timestamp with time zone,
    "counter_message" "text",
    "resulting_cart_id" "uuid",
    "responded_at" timestamp with time zone,
    CONSTRAINT "offers_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'countered'::character varying, 'declined'::character varying, 'expired'::character varying, 'converted_to_order'::character varying])::"text"[])))
);


ALTER TABLE "public"."offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "tool_id" "uuid",
    "seller_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "condition" "text",
    "price" numeric(10,2) NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "image_url" "text",
    "platform_fee_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "seller_amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "stripe_transfer_id" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "shipped_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    CONSTRAINT "order_items_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text", 'returned'::"text"])))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "stripe_payment_intent_id" "text",
    "stripe_payment_status" "text",
    "amount_subtotal" numeric(10,2) NOT NULL,
    "amount_tax" numeric(10,2) DEFAULT 0,
    "amount_shipping" numeric(10,2) DEFAULT 0,
    "amount_platform_fee" numeric(10,2) DEFAULT 0,
    "amount_total" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "shipping_address" "jsonb",
    "billing_address" "jsonb",
    "contact_email" "text",
    "contact_phone" "text",
    "notes" "text",
    "original_cart_id" "uuid",
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'cancelled'::"text", 'refunded'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "reviewed_user_id" "uuid" NOT NULL,
    "tool_id" "uuid",
    "rating" integer NOT NULL,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "different_users" CHECK (("reviewer_id" <> "reviewed_user_id")),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seller_payouts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "stripe_payout_id" "text",
    "order_items" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "seller_payouts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."seller_payouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_methods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "base_price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "estimated_days_min" integer,
    "estimated_days_max" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."shipping_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_tokens" (
    "token" "text" NOT NULL,
    "stripe_account_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone
);


ALTER TABLE "public"."stripe_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tools" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "subcategory" "text",
    "condition" "text" NOT NULL,
    "original_price" numeric(10,2),
    "current_price" numeric(10,2) NOT NULL,
    "location" "text" NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "is_verified" boolean DEFAULT false,
    "is_sold" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "brand" "text",
    "model" "text",
    "age" "text",
    "material" "text",
    "dimensions" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "allow_offers" boolean DEFAULT false,
    "accepts_offers" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_item_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "seller_id" "uuid",
    "type" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" NOT NULL,
    "stripe_payment_intent_id" "text",
    "stripe_transfer_id" "text",
    "stripe_refund_id" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "metadata" "jsonb",
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'succeeded'::"text", 'failed'::"text"]))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['charge'::"text", 'refund'::"text", 'payout'::"text", 'fee'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "location" "text",
    "bio" "text",
    "rating" numeric(3,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'user'::"text",
    "stripe_customer_id" "text",
    "stripe_account_id" "text",
    "stripe_account_status" "text",
    "stripe_account_created_at" timestamp with time zone,
    "is_seller" boolean DEFAULT false,
    "seller_name" "text",
    "seller_bio" "text",
    "seller_type" "text",
    "stripe_account_details_submitted" boolean DEFAULT false,
    "seller_since" timestamp with time zone,
    "onboarding_progress" "text" DEFAULT 'not_started'::"text",
    "verification_requirements" "jsonb",
    "last_requirements_check" timestamp with time zone,
    CONSTRAINT "users_stripe_account_status_check" CHECK (("stripe_account_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "signed_up_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "survey_token" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "survey_responses" "jsonb",
    "survey_completed_at" timestamp with time zone
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlist" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tool_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."wishlist" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_payouts"
    ADD CONSTRAINT "seller_payouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_methods"
    ADD CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_tokens"
    ADD CONSTRAINT "stripe_tokens_pkey" PRIMARY KEY ("token");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id", "email");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_user_id_tool_id_key" UNIQUE ("user_id", "tool_id");



CREATE INDEX "cart_items_cart_id_idx" ON "public"."cart_items" USING "btree" ("cart_id");



CREATE INDEX "carts_session_id_idx" ON "public"."carts" USING "btree" ("session_id");



CREATE INDEX "carts_user_id_idx" ON "public"."carts" USING "btree" ("user_id");



CREATE INDEX "idx_users_onboarding_progress" ON "public"."users" USING "btree" ("onboarding_progress");



CREATE INDEX "idx_waitlist_survey_token" ON "public"."waitlist" USING "btree" ("survey_token");



CREATE INDEX "offers_buyer_id_idx" ON "public"."offers" USING "btree" ("buyer_id");



CREATE INDEX "offers_seller_id_idx" ON "public"."offers" USING "btree" ("seller_id");



CREATE INDEX "offers_status_idx" ON "public"."offers" USING "btree" ("status");



CREATE INDEX "offers_tool_id_idx" ON "public"."offers" USING "btree" ("tool_id");



CREATE INDEX "order_items_order_id_idx" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "order_items_seller_id_idx" ON "public"."order_items" USING "btree" ("seller_id");



CREATE INDEX "order_items_tool_id_idx" ON "public"."order_items" USING "btree" ("tool_id");



CREATE INDEX "orders_stripe_payment_intent_id_idx" ON "public"."orders" USING "btree" ("stripe_payment_intent_id");



CREATE INDEX "orders_user_id_idx" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "seller_payouts_seller_id_idx" ON "public"."seller_payouts" USING "btree" ("seller_id");



CREATE INDEX "tools_seller_id_idx" ON "public"."tools" USING "btree" ("seller_id");



CREATE INDEX "transactions_order_id_idx" ON "public"."transactions" USING "btree" ("order_id");



CREATE INDEX "transactions_seller_id_idx" ON "public"."transactions" USING "btree" ("seller_id");



CREATE INDEX "transactions_user_id_idx" ON "public"."transactions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "Zapier" AFTER INSERT ON "public"."waitlist" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://hooks.zapier.com/hooks/catch/612976/2w578og/', 'POST', '{"Content-type":"application/json"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "update_user_rating_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_rating"();



ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_created_from_offer_id_fkey" FOREIGN KEY ("created_from_offer_id") REFERENCES "public"."offers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_resulting_cart_id_fkey" FOREIGN KEY ("resulting_cart_id") REFERENCES "public"."carts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_original_cart_id_fkey" FOREIGN KEY ("original_cart_id") REFERENCES "public"."carts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewed_user_id_fkey" FOREIGN KEY ("reviewed_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id");



ALTER TABLE ONLY "public"."seller_payouts"
    ADD CONSTRAINT "seller_payouts_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stripe_tokens"
    ADD CONSTRAINT "stripe_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



CREATE POLICY "Admins can view all actions, users can view their own" ON "public"."admin_actions" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))) OR ("performed_by" = "auth"."uid"())));



CREATE POLICY "Anyone can view available tools" ON "public"."tools" FOR SELECT USING (("is_sold" = false));



CREATE POLICY "Enable insert for public" ON "public"."waitlist" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read for public" ON "public"."waitlist" FOR SELECT USING (true);



CREATE POLICY "Enable update for public" ON "public"."waitlist" FOR UPDATE USING (true);



CREATE POLICY "Reviews are viewable by everyone" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Sellers can create their own tool listings" ON "public"."tools" FOR INSERT WITH CHECK (("seller_id" = "auth"."uid"()));



CREATE POLICY "Sellers can delete their own tools" ON "public"."tools" FOR DELETE USING (("seller_id" = "auth"."uid"()));



CREATE POLICY "Sellers can update their own tools" ON "public"."tools" FOR UPDATE USING (("seller_id" = "auth"."uid"()));



CREATE POLICY "Sellers can view all their tools" ON "public"."tools" FOR SELECT USING (("seller_id" = "auth"."uid"()));



CREATE POLICY "Service role can do anything" ON "public"."stripe_tokens" USING (true) WITH CHECK (true);



CREATE POLICY "Tools are viewable by everyone" ON "public"."tools" FOR SELECT USING (true);



CREATE POLICY "Users can add to their own wishlist" ON "public"."wishlist" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Users can create their own tool listings" ON "public"."tools" FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can delete their own tool listings" ON "public"."tools" FOR DELETE USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can insert their own record" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can remove from their own wishlist" ON "public"."wishlist" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can see messages they sent or received" ON "public"."messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Users can update own verification status" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update read status of received messages" ON "public"."messages" FOR UPDATE USING (("auth"."uid"() = "recipient_id")) WITH CHECK (("is_read" = true));



CREATE POLICY "Users can update their own record" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Users can update their own tool listings" ON "public"."tools" FOR UPDATE USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Users can view all profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can view own tokens" ON "public"."stripe_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own verification status" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own wishlist" ON "public"."wishlist" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."admin_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlist" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."waitlist";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "zapier";




















































































































































































GRANT ALL ON FUNCTION "public"."get_seller_verification_status"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_seller_verification_status"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_seller_verification_status"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_rating"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_actions" TO "anon";
GRANT ALL ON TABLE "public"."admin_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_actions" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."carts" TO "anon";
GRANT ALL ON TABLE "public"."carts" TO "authenticated";
GRANT ALL ON TABLE "public"."carts" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."offers" TO "anon";
GRANT ALL ON TABLE "public"."offers" TO "authenticated";
GRANT ALL ON TABLE "public"."offers" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."seller_payouts" TO "anon";
GRANT ALL ON TABLE "public"."seller_payouts" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_payouts" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_methods" TO "anon";
GRANT ALL ON TABLE "public"."shipping_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_methods" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_tokens" TO "anon";
GRANT ALL ON TABLE "public"."stripe_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."tools" TO "anon";
GRANT ALL ON TABLE "public"."tools" TO "authenticated";
GRANT ALL ON TABLE "public"."tools" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist" TO "anon";
GRANT ALL ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";
GRANT SELECT ON TABLE "public"."waitlist" TO "zapier";



GRANT ALL ON TABLE "public"."wishlist" TO "anon";
GRANT ALL ON TABLE "public"."wishlist" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
