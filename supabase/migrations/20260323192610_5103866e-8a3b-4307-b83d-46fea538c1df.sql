-- Drop the restrictive SELECT policy and replace with one that also allows creators
DROP POLICY "Members can view their groups" ON public.groups;

CREATE POLICY "Members and creators can view groups"
  ON public.groups FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR public.is_group_member(auth.uid(), id)
  );