BEGIN;

ALTER TABLE "tasks"
  ADD COLUMN "repeatWeekly" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "previousOccurrenceId" INTEGER;

CREATE UNIQUE INDEX "tasks_previousOccurrenceId_key"
  ON "tasks" ("previousOccurrenceId");

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_previousOccurrenceId_fkey"
  FOREIGN KEY ("previousOccurrenceId") REFERENCES "tasks" ("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
