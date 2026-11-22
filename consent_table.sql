-- Chạy trong Supabase > SQL Editor
create table if not exists consent_log (
  id bigint generated always as identity primary key,
  user_ref text not null,          -- băm của tài khoản, không lưu email trực tiếp
  terms_version text not null,     -- phiên bản điều khoản đã đồng ý
  accepted_at timestamptz not null default now(),
  source text,                     -- register
  ip_hash text,                    -- băm của IP, để đối chiếu khi cần
  user_agent text
);
-- Khóa truy cập: không cho khóa công khai (anon) đọc hoặc ghi.
-- Chỉ server (SUPABASE_SERVICE_KEY) mới ghi được.
alter table consent_log enable row level security;
