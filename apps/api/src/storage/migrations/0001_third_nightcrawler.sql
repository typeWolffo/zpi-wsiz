CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"archived_at" timestamp(3) with time zone DEFAULT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "mechanics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"archived_at" timestamp(3) with time zone DEFAULT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_id" uuid NOT NULL,
	"shift_start" time NOT NULL,
	"shift_end" time NOT NULL,
	CONSTRAINT "mechanics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "repair_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"archived_at" timestamp(3) with time zone DEFAULT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"description" text NOT NULL,
	"assigned_mechanic_id" uuid,
	"vehicle_id" uuid
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"archived_at" timestamp(3) with time zone DEFAULT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"customer_id" uuid NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" text NOT NULL,
	"vin" text NOT NULL,
	"registration_number" text NOT NULL,
	CONSTRAINT "vehicles_vin_unique" UNIQUE("vin"),
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
ALTER TABLE "create_tokens" ALTER COLUMN "archived_at" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "create_tokens" ALTER COLUMN "archived_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "credentials" ALTER COLUMN "archived_at" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "credentials" ALTER COLUMN "archived_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reset_tokens" ALTER COLUMN "archived_at" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "reset_tokens" ALTER COLUMN "archived_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_details" ALTER COLUMN "archived_at" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "user_details" ALTER COLUMN "archived_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "archived_at" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "archived_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mechanics" ADD CONSTRAINT "mechanics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_orders" ADD CONSTRAINT "repair_orders_assigned_mechanic_id_mechanics_id_fk" FOREIGN KEY ("assigned_mechanic_id") REFERENCES "public"."mechanics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_orders" ADD CONSTRAINT "repair_orders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;