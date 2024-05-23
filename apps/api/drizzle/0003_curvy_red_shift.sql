ALTER TABLE "projects" DROP CONSTRAINT "projects_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "should_attach_users_by_domain" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
