-- In-app notifications for students
-- Run this in Supabase SQL editor

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,  -- 'badge', 'level_up', 'assignment_due', 'contest_start', 'submission'
  title text not null,
  body text,
  link text,           -- URL to navigate to when clicked
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id) where read = false;

alter table notifications enable row level security;

drop policy if exists "Notifications readable by owner" on notifications;
create policy "Notifications readable by owner"
  on notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Notifications insertable by service role" on notifications;
create policy "Notifications insertable by service role"
  on notifications for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Notifications updatable by owner" on notifications;
create policy "Notifications updatable by owner"
  on notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());