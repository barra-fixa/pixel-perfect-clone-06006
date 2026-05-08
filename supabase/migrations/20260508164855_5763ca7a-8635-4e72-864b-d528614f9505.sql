
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  autor_nome text not null,
  texto text not null check (length(texto) between 1 and 500),
  treino_nome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

create policy "Posts visíveis para autenticados"
on public.community_posts for select to authenticated using (true);

create policy "Autor cria próprio post"
on public.community_posts for insert to authenticated
with check (auth.uid() = user_id);

create policy "Autor edita próprio post"
on public.community_posts for update to authenticated
using (auth.uid() = user_id);

create policy "Autor remove próprio post"
on public.community_posts for delete to authenticated
using (auth.uid() = user_id);

create trigger trg_posts_updated
before update on public.community_posts
for each row execute function public.set_updated_at();

create index idx_posts_created on public.community_posts(created_at desc);

create table public.post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Likes visíveis para autenticados"
on public.post_likes for select to authenticated using (true);

create policy "Usuário curte como si"
on public.post_likes for insert to authenticated
with check (auth.uid() = user_id);

create policy "Usuário remove próprio like"
on public.post_likes for delete to authenticated
using (auth.uid() = user_id);

create index idx_likes_post on public.post_likes(post_id);
