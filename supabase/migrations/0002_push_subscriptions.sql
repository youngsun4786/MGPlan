-- Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Staff can only manage their own subscriptions
CREATE POLICY "staff can read own subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "staff can insert own subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "staff can delete own subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (staff_id = auth.uid());
