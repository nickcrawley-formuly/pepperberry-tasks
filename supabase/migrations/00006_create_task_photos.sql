-- ===========================================
-- TASK PHOTOS TABLE
-- ===========================================
create table public.task_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  storage_path text not null,
  uploaded_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

-- Index for fetching photos by task
create index idx_task_photos_task_id on public.task_photos (task_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
alter table public.task_photos enable row level security;

-- Admins: full access to all photos
create policy "Admins have full access to photos"
  on public.task_photos
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Tradespeople: can view photos on their assigned tasks
create policy "Tradespeople can view photos on assigned tasks"
  on public.task_photos
  for select
  using (
    exists (
      select 1 from public.tasks t
      join public.users u on u.id = auth.uid()
      where t.id = task_id
        and u.role = 'tradesperson'
        and t.assigned_to = auth.uid()
    )
  );

-- Tradespeople: can add photos to their assigned tasks
create policy "Tradespeople can add photos to assigned tasks"
  on public.task_photos
  for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.tasks t
      join public.users u on u.id = auth.uid()
      where t.id = task_id
        and u.role = 'tradesperson'
        and t.assigned_to = auth.uid()
    )
  );

-- Tradespeople: can delete their own photos
create policy "Tradespeople can delete own photos"
  on public.task_photos
  for delete
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'tradesperson'
    )
  );

-- Riding school: can view photos on riding_school tasks
create policy "Riding school can view photos on riding_school tasks"
  on public.task_photos
  for select
  using (
    exists (
      select 1 from public.tasks t
      join public.users u on u.id = auth.uid()
      where t.id = task_id
        and u.role = 'riding_school'
        and t.category = 'riding_school'
    )
  );

-- Riding school: can add photos to riding_school tasks
create policy "Riding school can add photos to riding_school tasks"
  on public.task_photos
  for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.tasks t
      join public.users u on u.id = auth.uid()
      where t.id = task_id
        and u.role = 'riding_school'
        and t.category = 'riding_school'
    )
  );

-- Riding school: can delete their own photos
create policy "Riding school can delete own photos"
  on public.task_photos
  for delete
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'riding_school'
    )
  );

-- ===========================================
-- STORAGE BUCKET
-- ===========================================
insert into storage.buckets (id, name, public)
values ('task-photos', 'task-photos', true)
on conflict (id) do nothing;

-- Public read access for task photos
create policy "Public read access for task photos"
  on storage.objects
  for select
  using (bucket_id = 'task-photos');
