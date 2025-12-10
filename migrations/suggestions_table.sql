
-- Migration to create suggestions table and policies
-- Run this in your Supabase SQL Editor if MCP tools cannot access the self-hosted instance

create table if not exists suggestions (
  id bigint primary key generated always as identity,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table suggestions enable row level security;

-- Policies
create policy "Enable read access for all users"
on suggestions for select
using (true);

create policy "Enable insert access for all users"
on suggestions for insert
with check (true);
