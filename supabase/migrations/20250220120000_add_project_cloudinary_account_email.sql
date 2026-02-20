-- Optional note: which email the Cloudinary account was created with (for reference only).
alter table public.projects
  add column if not exists cloudinary_account_email text;
