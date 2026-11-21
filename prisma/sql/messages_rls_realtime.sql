-- Agency <-> Technician Messaging: Constraints, RLS Policies & Supabase Realtime
-- Additive only on public.messages

-- 1. Check constraints (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_role_check'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_sender_role_check
      CHECK (sender_role IN ('AGENCY', 'TECHNICIAN'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_attachment_kind_check'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_attachment_kind_check
      CHECK (attachment_kind IS NULL OR attachment_kind = 'IMAGE');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_body_len_check'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_body_len_check
      CHECK (body IS NULL OR char_length(body) <= 2000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_recipient_role_check'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_recipient_role_check
      CHECK (recipient_role IN ('AGENCY', 'TECHNICIAN'));
  END IF;
END $$;

-- 1b. Backfill existing office<->technician rows idempotently (zero breakage to current threads)
UPDATE public.messages
SET
  dm_key = 'office__' || technician_id,
  recipient_role = CASE WHEN sender_role = 'AGENCY' THEN 'TECHNICIAN' ELSE 'AGENCY' END,
  recipient_id = CASE WHEN sender_role = 'AGENCY' THEN technician_id ELSE NULL END
WHERE dm_key IS NULL;

-- 2. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop & recreate policies idempotently
DROP POLICY IF EXISTS messages_technician_select ON public.messages;
DROP POLICY IF EXISTS messages_technician_insert ON public.messages;
DROP POLICY IF EXISTS messages_technician_update ON public.messages;
DROP POLICY IF EXISTS messages_agency_select ON public.messages;
DROP POLICY IF EXISTS messages_agency_insert ON public.messages;
DROP POLICY IF EXISTS messages_agency_update ON public.messages;

-- Technician: own office thread + tech<->tech DMs where participant
CREATE POLICY messages_technician_select
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    technician_id = auth.uid()::text
    OR sender_id = auth.uid()::text
    OR recipient_id = auth.uid()::text
  );

CREATE POLICY messages_technician_insert
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_role = 'TECHNICIAN'
    AND sender_id = auth.uid()::text
  );

CREATE POLICY messages_technician_update
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    technician_id = auth.uid()::text
    OR sender_id = auth.uid()::text
    OR recipient_id = auth.uid()::text
  )
  WITH CHECK (
    technician_id = auth.uid()::text
    OR sender_id = auth.uid()::text
    OR recipient_id = auth.uid()::text
  );

-- Agency dashboard users: ONLY office<->technician threads in their organization (NEVER private tech<->tech DMs)
CREATE POLICY messages_agency_select
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    (messages.dm_key IS NULL OR messages.dm_key LIKE 'office__%')
    AND EXISTS (
      SELECT 1
      FROM public."UserProfile" up
      WHERE up.id = auth.uid()::text
        AND up.status = 'ACTIVE'
        AND up.role <> 'TECHNICIAN'
        AND up.role <> 'CLIENT'
        AND (up.role = 'SUPER_ADMIN' OR up."organizationId" = messages.organization_id)
    )
  );

CREATE POLICY messages_agency_insert
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_role = 'AGENCY'
    AND sender_id = auth.uid()::text
    AND (messages.dm_key IS NULL OR messages.dm_key LIKE 'office__%')
    AND EXISTS (
      SELECT 1
      FROM public."UserProfile" up
      WHERE up.id = auth.uid()::text
        AND up.status = 'ACTIVE'
        AND up.role <> 'TECHNICIAN'
        AND up.role <> 'CLIENT'
        AND (up.role = 'SUPER_ADMIN' OR up."organizationId" = messages.organization_id)
    )
  );

CREATE POLICY messages_agency_update
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    (messages.dm_key IS NULL OR messages.dm_key LIKE 'office__%')
    AND EXISTS (
      SELECT 1
      FROM public."UserProfile" up
      WHERE up.id = auth.uid()::text
        AND up.status = 'ACTIVE'
        AND up.role <> 'TECHNICIAN'
        AND up.role <> 'CLIENT'
        AND (up.role = 'SUPER_ADMIN' OR up."organizationId" = messages.organization_id)
    )
  )
  WITH CHECK (
    (messages.dm_key IS NULL OR messages.dm_key LIKE 'office__%')
    AND EXISTS (
      SELECT 1
      FROM public."UserProfile" up
      WHERE up.id = auth.uid()::text
        AND up.status = 'ACTIVE'
        AND up.role <> 'TECHNICIAN'
        AND up.role <> 'CLIENT'
        AND (up.role = 'SUPER_ADMIN' OR up."organizationId" = messages.organization_id)
    )
  );

-- 3. Supabase Realtime publication + replica identity
ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
