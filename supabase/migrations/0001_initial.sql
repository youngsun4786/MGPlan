-- Enums (D-06)
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done');
CREATE TYPE request_type AS ENUM ('new_booking', 'change_time', 'change_therapist', 'other');

-- Staff table (D-05)
CREATE TABLE public.staff (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  display_name  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff can read all staff"
  ON public.staff FOR SELECT TO authenticated USING (true);

-- Tasks table
CREATE TABLE public.tasks (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name        text NOT NULL,
  phone              text NOT NULL,
  service            text,
  preferred_datetime timestamptz,
  notes              text,
  request_type       request_type NOT NULL,
  status             task_status NOT NULL DEFAULT 'open',
  created_by         uuid NOT NULL REFERENCES public.staff(id),
  last_updated_by    uuid NOT NULL REFERENCES public.staff(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- D-08: flat team -- any authenticated staff full access
CREATE POLICY "authenticated staff can select tasks"
  ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated staff can insert tasks"
  ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated staff can update tasks"
  ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated staff can delete tasks"
  ON public.tasks FOR DELETE TO authenticated USING (true);

-- Enable realtime (Pitfall 3: required for postgres_changes)
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Auto-create staff on signup (D-05)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.staff (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
