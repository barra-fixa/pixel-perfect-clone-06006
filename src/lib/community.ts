import { supabase } from "@/integrations/supabase/client";

export type CommunityPost = {
  id: string;
  user_id: string;
  autor_nome: string;
  texto: string;
  treino_nome: string | null;
  created_at: string;
  likes: number;
  liked_by_me: boolean;
};

export async function listPosts(limit = 50): Promise<CommunityPost[]> {
  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const { data: likes } = await supabase
    .from("post_likes")
    .select("post_id, user_id")
    .in("post_id", ids);

  const { data: session } = await supabase.auth.getSession();
  const me = session.session?.user.id;

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  (likes ?? []).forEach((l) => {
    counts.set(l.post_id, (counts.get(l.post_id) ?? 0) + 1);
    if (l.user_id === me) mine.add(l.post_id);
  });

  return posts.map((p) => ({
    ...p,
    likes: counts.get(p.id) ?? 0,
    liked_by_me: mine.has(p.id),
  }));
}

export async function createPost(input: {
  texto: string;
  treino_nome?: string | null;
  autor_nome: string;
}): Promise<CommunityPost> {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user.id;
  if (!uid) throw new Error("Faça login para postar");

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: uid,
      autor_nome: input.autor_nome,
      texto: input.texto,
      treino_nome: input.treino_nome ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return { ...data, likes: 0, liked_by_me: false };
}

export async function toggleLike(postId: string, currentlyLiked: boolean) {
  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user.id;
  if (!uid) throw new Error("Login necessário");

  if (currentlyLiked) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", uid);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: uid });
    if (error) throw error;
  }
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  if (error) throw error;
}
