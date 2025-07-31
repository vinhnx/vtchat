ALTER TABLE "resources" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "protected" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_token_idx" ON "sessions" USING btree ("user_id","token");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_expires_idx" ON "sessions" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "sessions_impersonated_by_idx" ON "sessions" USING btree ("impersonated_by");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_banned_idx" ON "users" USING btree ("banned");--> statement-breakpoint
CREATE INDEX "users_protected_idx" ON "users" USING btree ("protected");--> statement-breakpoint
CREATE INDEX "users_plan_slug_idx" ON "users" USING btree ("plan_slug");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");