begin;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('submissions', 'feedback', 'global_config')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

alter table if exists public.submissions enable row level security;
alter table if exists public.feedback enable row level security;
alter table if exists public.global_config enable row level security;

alter table if exists public.submissions force row level security;
alter table if exists public.feedback force row level security;
alter table if exists public.global_config force row level security;

revoke all on table public.submissions from anon, authenticated;
revoke all on table public.feedback from anon, authenticated;
revoke all on table public.global_config from anon, authenticated;

comment on table public.submissions is
  'Raw submission rows are private. Public access should go through server-side sanitized reads only.';

comment on table public.feedback is
  'Raw feedback rows are private. Access should remain server-side only.';

comment on table public.global_config is
  'Global configuration is private and server-managed.';

commit;
