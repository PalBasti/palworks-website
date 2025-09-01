

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."contract_addons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contract_type" character varying(50) NOT NULL,
    "addon_key" character varying(100) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contract_addons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contract_type" character varying(50) NOT NULL,
    "customer_email" character varying(255) NOT NULL,
    "form_data" "jsonb" NOT NULL,
    "selected_addons" "text"[] DEFAULT '{}'::"text"[],
    "base_price" numeric(10,2) NOT NULL,
    "addon_prices" "jsonb" DEFAULT '{}'::"jsonb",
    "total_amount" numeric(10,2) NOT NULL,
    "payment_id" character varying(255),
    "payment_method" character varying(50),
    "payment_status" character varying(50) DEFAULT 'pending'::character varying,
    "status" character varying(50) DEFAULT 'draft'::character varying,
    "generated_pdf_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "paid_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "payment_intent_id" character varying(255),
    "pdf_generated" boolean DEFAULT false,
    "pdf_url" "text",
    "pdf_generated_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "source" character varying(100),
    "contract_type" character varying(50),
    "subscribed_at" timestamp with time zone DEFAULT "now"(),
    "unsubscribed_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contract_id" "uuid",
    "payment_provider" character varying(50),
    "provider_transaction_id" character varying(255),
    "amount" numeric(10,2) NOT NULL,
    "currency" character varying(3) DEFAULT 'EUR'::character varying,
    "status" character varying(50) NOT NULL,
    "provider_response" "jsonb",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_logs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."contract_addons"
    ADD CONSTRAINT "contract_addons_contract_type_addon_key_key" UNIQUE ("contract_type", "addon_key");



ALTER TABLE ONLY "public"."contract_addons"
    ADD CONSTRAINT "contract_addons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_logs"
    ADD CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_addons_active" ON "public"."contract_addons" USING "btree" ("is_active");



CREATE INDEX "idx_addons_contract_type" ON "public"."contract_addons" USING "btree" ("contract_type");



CREATE INDEX "idx_contracts_created_at" ON "public"."contracts" USING "btree" ("created_at");



CREATE INDEX "idx_contracts_email" ON "public"."contracts" USING "btree" ("customer_email");



CREATE INDEX "idx_contracts_payment_status" ON "public"."contracts" USING "btree" ("payment_status");



CREATE INDEX "idx_contracts_status" ON "public"."contracts" USING "btree" ("status");



CREATE INDEX "idx_contracts_type" ON "public"."contracts" USING "btree" ("contract_type");



CREATE INDEX "idx_newsletter_active" ON "public"."newsletter_subscribers" USING "btree" ("is_active");



CREATE INDEX "idx_newsletter_contract_type" ON "public"."newsletter_subscribers" USING "btree" ("contract_type");



CREATE INDEX "idx_newsletter_created_at" ON "public"."newsletter_subscribers" USING "btree" ("created_at");



CREATE INDEX "idx_newsletter_email" ON "public"."newsletter_subscribers" USING "btree" ("email");



CREATE INDEX "idx_payment_logs_contract" ON "public"."payment_logs" USING "btree" ("contract_id");



CREATE INDEX "idx_payment_logs_contract_id" ON "public"."payment_logs" USING "btree" ("contract_id");



CREATE INDEX "idx_payment_logs_provider_transaction" ON "public"."payment_logs" USING "btree" ("provider_transaction_id");



CREATE INDEX "idx_payment_logs_status" ON "public"."payment_logs" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "update_addons_updated_at" BEFORE UPDATE ON "public"."contract_addons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contracts_updated_at" BEFORE UPDATE ON "public"."contracts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_newsletter_updated_at" BEFORE UPDATE ON "public"."newsletter_subscribers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_payment_logs_updated_at" BEFORE UPDATE ON "public"."payment_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."payment_logs"
    ADD CONSTRAINT "payment_logs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id");



CREATE POLICY "Allow public addon reading" ON "public"."contract_addons" FOR SELECT TO "anon" USING (("is_active" = true));



CREATE POLICY "Allow public insert newsletter" ON "public"."newsletter_subscribers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public newsletter subscription" ON "public"."newsletter_subscribers" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow public read addons" ON "public"."contract_addons" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Allow service role all addons" ON "public"."contract_addons" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Allow service role all contracts" ON "public"."contracts" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Allow service role all newsletter" ON "public"."newsletter_subscribers" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Allow service role all payment_logs" ON "public"."payment_logs" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Enable insert for service role" ON "public"."contracts" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable select for service role" ON "public"."contracts" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Enable update for service role" ON "public"."contracts" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."contract_addons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_logs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."contract_addons" TO "anon";
GRANT ALL ON TABLE "public"."contract_addons" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_addons" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."payment_logs" TO "anon";
GRANT ALL ON TABLE "public"."payment_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_logs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
