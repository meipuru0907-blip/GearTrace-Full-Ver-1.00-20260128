-- Create a table for public profiles (optional, but good practice)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- GEAR Table
create table gear (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text,
  category text not null,
  sub_category text,
  manufacturer text not null,
  model text not null,
  serial_number text,
  photos jsonb default '{}'::jsonb, -- Stores hero, serial, feature paths/urls
  color_tag text,
  status text not null check (status in ('Available', 'InUse', 'Maintenance', 'Broken', 'Sold', 'Repair', 'Missing')),
  purchase_date timestamp with time zone,
  purchase_price numeric,
  current_value numeric,
  lifespan integer default 5,
  quantity integer default 1,
  is_container boolean default false,
  container_id uuid references gear(id),
  product_era text,
  notes text,
  documents jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table gear enable row level security;

create policy "Users can view their own gear" on gear
  for select using (auth.uid() = user_id);

create policy "Users can insert their own gear" on gear
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own gear" on gear
  for update using (auth.uid() = user_id);

create policy "Users can delete their own gear" on gear
  for delete using (auth.uid() = user_id);


-- LOGS Table
create table logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  gear_id uuid references gear(id) on delete cascade not null,
  date timestamp with time zone not null,
  type text not null check (type in ('Trouble', 'Repair', 'Maintenance', 'Lending')),
  description text not null,
  cost numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table logs enable row level security;

create policy "Users can view their own logs" on logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own logs" on logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own logs" on logs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own logs" on logs
  for delete using (auth.uid() = user_id);


-- PACKING LISTS Table
create table packing_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  date timestamp with time zone,
  gear_ids jsonb default '[]'::jsonb, -- Array of gear UUIDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table packing_lists enable row level security;

create policy "Users can view their own packing lists" on packing_lists
  for select using (auth.uid() = user_id);

create policy "Users can insert their own packing lists" on packing_lists
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own packing lists" on packing_lists
  for update using (auth.uid() = user_id);

create policy "Users can delete their own packing lists" on packing_lists
  for delete using (auth.uid() = user_id);


-- SUBSCRIPTIONS Table
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text not null,
  price numeric not null,
  billing_cycle text not null,
  start_date timestamp with time zone not null,
  next_payment_date timestamp with time zone not null,
  auto_renew boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table subscriptions enable row level security;

create policy "Users can view their own subscriptions" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions" on subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions" on subscriptions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions" on subscriptions
  for delete using (auth.uid() = user_id);

-- Function to handle new user profile creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
