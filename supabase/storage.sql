-- Storage bucket for Orange Money payment proof uploads.
-- Run this in the Supabase SQL editor, or create the bucket via Dashboard > Storage.

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Students can upload to their own folder (path starts with their user id)
create policy "students upload own payment proofs"
on storage.objects for insert
with check (
  bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can read their own proofs; staff can read all
create policy "read payment proofs"
on storage.objects for select
using (
  bucket_id = 'payment-proofs' and (
    (storage.foldername(name))[1] = auth.uid()::text or is_staff(auth.uid())
  )
);
