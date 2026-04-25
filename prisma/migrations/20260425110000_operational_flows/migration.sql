-- Booking lifecycle
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'CHECKED_IN';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BOOKING_CHECK_IN';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BOOKING_CHECK_OUT';

-- New enums
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('BOOKING', 'INQUIRY', 'REVIEW', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InquirySource" AS ENUM ('PUBLIC_CONTACT', 'GUEST_MESSAGE', 'OWNER_REQUEST', 'ADMIN_DIRECT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InquirySender" AS ENUM ('GUEST', 'OWNER', 'ADMIN', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Booking timestamps
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "checkedOutAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "noShowAt" TIMESTAMP(3);

UPDATE "bookings"
SET "confirmedAt" = COALESCE("confirmedAt", "updatedAt")
WHERE "status" IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED') AND "confirmedAt" IS NULL;

UPDATE "bookings"
SET "checkedOutAt" = COALESCE("checkedOutAt", "updatedAt")
WHERE "status" = 'COMPLETED' AND "checkedOutAt" IS NULL;

-- Review moderation and booking linkage
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "bookingId" TEXT;

UPDATE "reviews"
SET "status" = CASE
  WHEN "isApproved" = true THEN 'PUBLISHED'::"ReviewStatus"
  ELSE 'PENDING'::"ReviewStatus"
END;

DROP INDEX IF EXISTS "reviews_guestId_propertyId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_bookingId_key" ON "reviews"("bookingId");
CREATE INDEX IF NOT EXISTS "reviews_guestId_propertyId_idx" ON "reviews"("guestId", "propertyId");
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews"("status");

DO $$ BEGIN
  ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Inquiry conversation metadata
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "source" "InquirySource" NOT NULL DEFAULT 'PUBLIC_CONTACT';
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "lastMessageBy" "InquirySender" NOT NULL DEFAULT 'GUEST';
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "adminLastReadAt" TIMESTAMP(3);
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "guestLastReadAt" TIMESTAMP(3);
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "ownerLastReadAt" TIMESTAMP(3);
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

UPDATE "inquiries"
SET "lastMessageAt" = COALESCE("updatedAt", "createdAt", CURRENT_TIMESTAMP)
WHERE "lastMessageAt" IS NULL;

CREATE INDEX IF NOT EXISTS "inquiries_source_idx" ON "inquiries"("source");
CREATE INDEX IF NOT EXISTS "inquiries_ownerId_idx" ON "inquiries"("ownerId");
CREATE INDEX IF NOT EXISTS "inquiries_lastMessageAt_idx" ON "inquiries"("lastMessageAt");

DO $$ BEGIN
  ALTER TABLE "inquiries"
  ADD CONSTRAINT "inquiries_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "inquiry_messages" (
  "id" TEXT NOT NULL,
  "sender" "InquirySender" NOT NULL,
  "body" TEXT NOT NULL,
  "authorId" TEXT,
  "inquiryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inquiry_messages_inquiryId_idx" ON "inquiry_messages"("inquiryId");
CREATE INDEX IF NOT EXISTS "inquiry_messages_sender_idx" ON "inquiry_messages"("sender");
CREATE INDEX IF NOT EXISTS "inquiry_messages_createdAt_idx" ON "inquiry_messages"("createdAt");

DO $$ BEGIN
  ALTER TABLE "inquiry_messages"
  ADD CONSTRAINT "inquiry_messages_inquiryId_fkey"
  FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "inquiry_messages"
  ADD CONSTRAINT "inquiry_messages_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "inquiry_messages" ("id", "sender", "body", "inquiryId", "createdAt")
SELECT
  'im_' || md5(i."id" || ':initial'),
  'GUEST'::"InquirySender",
  i."message",
  i."id",
  i."createdAt"
FROM "inquiries" i
WHERE NOT EXISTS (
  SELECT 1 FROM "inquiry_messages" m
  WHERE m."inquiryId" = i."id" AND m."createdAt" = i."createdAt"
);

INSERT INTO "inquiry_messages" ("id", "sender", "body", "inquiryId", "createdAt")
SELECT
  'im_' || md5(i."id" || ':' || r.ordinality::text || ':' || COALESCE(r.value->>'timestamp', '')),
  CASE
    WHEN lower(COALESCE(r.value->>'sender', 'guest')) = 'admin' THEN 'ADMIN'::"InquirySender"
    WHEN lower(COALESCE(r.value->>'sender', 'guest')) = 'owner' THEN 'OWNER'::"InquirySender"
    ELSE 'GUEST'::"InquirySender"
  END,
  COALESCE(r.value->>'message', ''),
  i."id",
  COALESCE(i."updatedAt", i."createdAt")
FROM "inquiries" i
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN i."replies" IS NOT NULL AND jsonb_typeof(i."replies"::jsonb) = 'array' THEN i."replies"::jsonb
    ELSE '[]'::jsonb
  END
) WITH ORDINALITY AS r(value, ordinality)
WHERE i."replies" IS NOT NULL
  AND COALESCE(r.value->>'message', '') <> ''
ON CONFLICT ("id") DO NOTHING;

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "href" TEXT,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt");

DO $$ BEGIN
  ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "notifications" ("id", "type", "title", "body", "href", "userId", "createdAt", "metadata")
SELECT
  'nt_' || md5(u."id" || ':booking:' || b."id"),
  'BOOKING'::"NotificationType",
  'New booking request',
  COALESCE(p."title", 'A property') || ' has a pending booking request.',
  '/admin/bookings/' || b."id",
  u."id",
  b."createdAt",
  jsonb_build_object('bookingId', b."id")
FROM "users" u
CROSS JOIN "bookings" b
LEFT JOIN "properties" p ON p."id" = b."propertyId"
WHERE u."role" = 'ADMIN' AND b."status" = 'PENDING'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "notifications" ("id", "type", "title", "body", "href", "userId", "createdAt", "metadata")
SELECT
  'nt_' || md5(u."id" || ':inquiry:' || i."id"),
  'INQUIRY'::"NotificationType",
  'Unread inquiry',
  i."subject",
  '/admin/inquiries/' || i."id",
  u."id",
  i."createdAt",
  jsonb_build_object('inquiryId', i."id")
FROM "users" u
CROSS JOIN "inquiries" i
WHERE u."role" = 'ADMIN' AND i."status" IN ('NEW', 'IN_PROGRESS')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "notifications" ("id", "type", "title", "body", "href", "userId", "createdAt", "metadata")
SELECT
  'nt_' || md5(u."id" || ':review:' || r."id"),
  'REVIEW'::"NotificationType",
  'Review awaiting moderation',
  COALESCE(p."title", 'A property') || ' received a new review.',
  '/admin/reviews/' || r."id",
  u."id",
  r."createdAt",
  jsonb_build_object('reviewId', r."id")
FROM "users" u
CROSS JOIN "reviews" r
LEFT JOIN "properties" p ON p."id" = r."propertyId"
WHERE u."role" = 'ADMIN' AND r."status" = 'PENDING'
ON CONFLICT ("id") DO NOTHING;
