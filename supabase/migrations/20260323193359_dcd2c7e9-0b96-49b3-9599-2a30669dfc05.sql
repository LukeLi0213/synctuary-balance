
DROP POLICY "Members and creators can view groups" ON public.groups;

CREATE POLICY "Authenticated users can view groups"
  ON public.groups FOR SELECT TO authenticated
  USING (true);
