import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { PostCard } from "./Home";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const posts = useAppStore(state => state.posts) || [];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       const existing = posts.find(p => p.id === id);
       if (existing) {
          setLoading(false);
       } else {
          // fetch it
          supabase.from("posts").select("*").eq("id", id).single().then(({ data }) => {
             if (data) {
                // inject it temporarily? Wait, no, we can just fetch it inside useAppStore
                useAppStore.setState(s => ({
                   posts: [{
                      id: data.id,
                      userId: data.user_id,
                      content: data.caption || "",
                      image: data.media_url,
                      mediaType: data.media_type,
                      musicTitle: data.music_title,
                      musicArtist: data.music_artist,
                      musicUrl: data.music_url,
                      originalPostId: data.original_post_id,
                      likes: data.likes || 0,
                      comments: data.comments || 0,
                      reposts: data.reposts || 0,
                      views: data.views || 0,
                      saves: data.saves || 0,
                      createdAt: data.created_at || new Date().toISOString()
                   }, ...s.posts]
                }));
             }
             setLoading(false);
          });
       }
    }
  }, [id, posts.length]); // depend on length so we don't refetch continously if we have it

  useEffect(() => {
     if (id && !loading && posts.find(p => p.id === id)) {
        useAppStore.getState().viewPost(id);
     }
  }, [id, loading]);

  const post = posts.find(p => p.id === id);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!post) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
           <h2 className="text-xl font-bold">Post not found</h2>
           <button onClick={() => navigate(-1)} className="text-indigo-400">Go back</button>
        </div>
     );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 lg:pb-8 flex justify-center">
      <div className="w-full max-w-2xl px-4 lg:px-8 py-8 flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit">
           <ArrowLeft size={20} /> Back
        </button>
        <PostCard post={post} />
      </div>
    </div>
  );
}
