CREATE TABLE "embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"resource_id" varchar(191) NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"daily_request_count" text DEFAULT '0' NOT NULL,
	"minute_request_count" text DEFAULT '0' NOT NULL,
	"last_daily_reset" timestamp DEFAULT now() NOT NULL,
	"last_minute_reset" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_rate_limits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rate_limits" ADD CONSTRAINT "user_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "user_model_index" ON "user_rate_limits" USING btree ("user_id","model_id");