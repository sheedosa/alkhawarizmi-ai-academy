-- AlKhwarizmi AI — leads table for website forms.
-- Run once in the Supabase SQL editor of the academy's project.

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  form          text not null check (form in ('studio','diploma','week','custom','policy','contact','newsletter')),
  audience      text check (audience in ('individual','organisation')),
  programme     text,
  edition       text,
  name          text not null check (char_length(name) between 1 and 200),
  email         text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (phone is null or char_length(phone) <= 40),
  organisation  text check (organisation is null or char_length(organisation) <= 200),
  role          text check (role is null or char_length(role) <= 200),
  message       text check (message is null or char_length(message) <= 4000),
  lang          text check (lang in ('en','ar')),
  source_page   text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  session_id    text,
  user_agent    text,
  status        text not null default 'new' check (status in ('new','contacted','qualified','enrolled','declined','spam')),
  notes         text
);

comment on table public.leads is 'Website form submissions (register interest, consultation, contact).';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_form_status_idx on public.leads (form, status);

-- Security: the browser can only INSERT. Nobody can read rows without the service role / dashboard.
alter table public.leads enable row level security;

drop policy if exists "website can insert leads" on public.leads;
create policy "website can insert leads"
  on public.leads for insert
  to anon
  with check (status = 'new');

revoke all on public.leads from anon;
grant insert on public.leads to anon;
-- (No select/update/delete for anon. Staff use the Supabase dashboard, which uses the service role.)

-- Handy views for the dashboard
create or replace view public.leads_new as
  select id, created_at, form, audience, programme, edition, name, email, phone, organisation, role, lang, utm_source, utm_campaign
  from public.leads where status = 'new' order by created_at desc;

create or replace view public.leads_daily as
  select date_trunc('day', created_at)::date as day, form, count(*) as leads
  from public.leads group by 1, 2 order by 1 desc, 2;
