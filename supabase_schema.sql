-- Create the table for storing briefings
create table public.briefings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null
);

-- Enable Row Level Security (RLS)
alter table public.briefings enable row level security;

-- Create Policy: Users can only see their own briefings
create policy "Users can view their own briefings"
  on public.briefings for select
  using (auth.uid() = user_id);

-- Create Policy: Users can insert their own briefings
create policy "Users can insert their own briefings"
  on public.briefings for insert
  with check (auth.uid() = user_id);

-- Create Policy: Users can delete their own briefings
create policy "Users can delete their own briefings"
  on public.briefings for delete
  using (auth.uid() = user_id);
