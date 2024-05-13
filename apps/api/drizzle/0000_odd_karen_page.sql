DO $$ BEGIN
 CREATE TYPE "public"."provider_account_unum" AS ENUM('GITHUB');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role_enum" AS ENUM('ADMIN', 'MEMBER', 'BILLING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."token_type_enum" AS ENUM('PASSWORD_RECOVER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider_account_unum" NOT NULL,
	"provider_account_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "accounts_provider_account_id_unique" UNIQUE("provider_account_id"),
	CONSTRAINT "accounts_provider_user_id_unique" UNIQUE("provider","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "role_enum" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid,
	"organization_id" uuid NOT NULL,
	CONSTRAINT "invites_email_unique" UNIQUE("email"),
	CONSTRAINT "invites_email_organization_id_unique" UNIQUE("email","organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role_enum" DEFAULT 'MEMBER',
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "members_organization_id_user_id_unique" UNIQUE("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"domain" text,
	"should_attach_users_by_domain" boolean DEFAULT false,
	"avatar_url" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"avatar_url" text,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_type" "token_type_enum" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password_hash" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invites" ADD CONSTRAINT "invites_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invites_email_index" ON "invites" ("email");