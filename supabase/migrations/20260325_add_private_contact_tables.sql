begin;

create table if not exists public.submission_contacts (
  submission_id text primary key,
  email text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feedback_contacts (
  feedback_id text primary key,
  email text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.submission_contacts enable row level security;
alter table if exists public.feedback_contacts enable row level security;

alter table if exists public.submission_contacts force row level security;
alter table if exists public.feedback_contacts force row level security;

revoke all on table public.submission_contacts from anon, authenticated;
revoke all on table public.feedback_contacts from anon, authenticated;

comment on table public.submission_contacts is
  'Private contact details for submission rows. Public submissions remain email-free.';

comment on table public.feedback_contacts is
  'Private contact details for feedback rows. Public feedback remains email-free.';

insert into public.submission_contacts (submission_id, email)
select id::text, lower(btrim(email))
from public.submissions
where email is not null
  and btrim(email) <> ''
on conflict (submission_id) do update
set email = excluded.email;

insert into public.feedback_contacts (feedback_id, email)
select id::text, lower(btrim(email))
from public.feedback
where email is not null
  and btrim(email) <> ''
on conflict (feedback_id) do update
set email = excluded.email;

update public.submissions
set email = null
where email is not null;

update public.feedback
set email = null
where email is not null;

commit;
