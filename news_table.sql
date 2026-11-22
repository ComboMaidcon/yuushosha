-- Chạy trong Supabase > SQL Editor
create table if not exists news_items (
  id text primary key,              -- băm của đường dẫn bài gốc (tránh trùng)
  title text not null,
  link text not null,
  source text,
  published_at timestamptz,
  fetched_at timestamptz default now()
);
create index if not exists news_items_published_idx on news_items (published_at desc);
alter table news_items enable row level security;
