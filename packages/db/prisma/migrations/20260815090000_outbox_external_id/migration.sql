-- Adds an idempotency key to OutboxEvent.
--
-- The engine's claiming in services/automations.ts is race-safe per ROW: only
-- one runner processes a given event. It does not protect against two ROWS
-- describing the same fact, which is exactly what an emitter retry or an
-- at-least-once delivery produces. Without this constraint a redelivered
-- coach.subscription_started fires every matching rule twice.
--
-- Nullable because every event written in-process (billing, team, admin) has
-- no external origin and correctly leaves it null. Postgres unique indexes
-- permit multiple nulls, so existing rows and code paths are unaffected.

ALTER TABLE "OutboxEvent" ADD COLUMN "externalId" TEXT;

CREATE UNIQUE INDEX "OutboxEvent_externalId_key" ON "OutboxEvent"("externalId");
