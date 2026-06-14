import { Database, Copy, Check, Terminal, Shield, Play } from "lucide-react";
import { useState } from "react";

const SQL_SCHEMA = `-- Run this in your Supabase SQL Editor

-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  name text,
  avatar text,
  banner text,
  bio text,
  website text,
  music_title text,
  music_url text,
  location text,
  creator_category text,
  skills text[],
  social_links jsonb,
  featured_project text,
  metadata jsonb,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Posts Table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  content text,
  image text,
  media_type text,
  original_post_id uuid references public.posts(id) on delete cascade,
  likes integer default 0,
  comments integer default 0,
  reposts integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Reels Table
create table public.reels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  video text not null,
  caption text,
  music text,
  likes integer default 0,
  comments integer default 0,
  reposts integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Portfolio projects
create table public.portfolio_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  media_url text,
  project_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Opportunities
create table public.opportunities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  type text not null,
  description text,
  budget text,
  location text,
  apply_link text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Create Interaction Tables
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, post_id)
);

create table public.liked_reels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, reel_id)
);

create table public.reel_comments (
  id uuid default gen_random_uuid() primary key,
  reel_id uuid references public.reels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.reposts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, post_id)
);

create table public.reel_reposts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, reel_id)
);

create table public.saved_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, post_id)
);

create table public.saved_reels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reel_id uuid references public.reels(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, reel_id)
);

create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(follower_id, following_id)
);

create table public.friend_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(sender_id, receiver_id)
);

-- 6. Create Communication Tables
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  is_group boolean default false,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.typing_status (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  is_typing boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);

create table public.call_sessions (
  id uuid default gen_random_uuid() primary key,
  caller_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.webrtc_signals (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  signal_type text not null,
  payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Create Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'like', 'comment', 'follow'
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reels enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.liked_reels enable row level security;
alter table public.reel_comments enable row level security;
alter table public.reposts enable row level security;
alter table public.reel_reposts enable row level security;
alter table public.saved_posts enable row level security;
alter table public.saved_reels enable row level security;
alter table public.follows enable row level security;
alter table public.friend_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.typing_status enable row level security;
alter table public.call_sessions enable row level security;
alter table public.webrtc_signals enable row level security;
alter table public.notifications enable row level security;

-- 9. Create basic RLS Policies (for simplicity in development, we allow all for authenticated users)
create policy "Public conversations are viewable by everyone." on conversations for select using (true);
create policy "Authenticated users can insert conversations" on conversations for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update conversations" on conversations for update using (auth.role() = 'authenticated');

create policy "Public conversation_participants are viewable by everyone." on conversation_participants for select using (true);
create policy "Authenticated users can insert conversation_participants" on conversation_participants for insert with check (auth.role() = 'authenticated');

create policy "Public messages are viewable by everyone." on messages for select using (true);
create policy "Authenticated users can insert messages" on messages for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update messages" on messages for update using (auth.role() = 'authenticated');

create policy "Public typing_status viewable by everyone." on typing_status for select using (true);
create policy "Authenticated users can insert typing_status" on typing_status for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update typing_status" on typing_status for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete typing_status" on typing_status for delete using (auth.role() = 'authenticated');

create policy "call_sessions viewable by everyone" on call_sessions for select using (true);
create policy "Authenticated users can insert call_sessions" on call_sessions for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update call_sessions" on call_sessions for update using (auth.role() = 'authenticated');

create policy "webrtc_signals viewable by everyone" on webrtc_signals for select using (true);
create policy "Authenticated users can insert webrtc_signals" on webrtc_signals for insert with check (auth.role() = 'authenticated');

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Posts are viewable by everyone." on posts for select using (true);
create policy "Authenticated users can insert posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update own posts." on posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts." on posts for delete using (auth.uid() = user_id);

create policy "Reels are viewable by everyone." on reels for select using (true);
create policy "Authenticated users can insert reels" on reels for insert with check (auth.role() = 'authenticated');

create policy "Comments viewable by everyone." on comments for select using (true);
create policy "Authenticated users can insert comments" on comments for insert with check (auth.role() = 'authenticated');

create policy "Likes viewable by everyone." on likes for select using (true);
create policy "Users can insert likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete likes" on likes for delete using (auth.uid() = user_id);

create policy "Reposts viewable by everyone." on reposts for select using (true);
create policy "Users can insert reposts" on reposts for insert with check (auth.uid() = user_id);
create policy "Users can delete reposts" on reposts for delete using (auth.uid() = user_id);

create policy "Saves viewable by everyone." on saves for select using (auth.uid() = user_id);
create policy "Users can insert saves" on saves for insert with check (auth.uid() = user_id);
create policy "Users can delete saves" on saves for delete using (auth.uid() = user_id);

create policy "Follows viewable by everyone." on follows for select using (true);
create policy "Users can insert follows" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can delete follows" on follows for delete using (auth.uid() = follower_id);

create policy "Users can manage their friend requests" on friend_requests for all using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can view their notifications" on notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert with check (auth.role() = 'authenticated');

-- 10. Setup Storage Buckets
insert into storage.buckets (id, name, public) values ('media', 'media', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('banners', 'banners', true);

-- Storage bucket policies
create policy "Media viewable by everyone" on storage.objects for select using ( true );
create policy "Authenticated users can upload media" on storage.objects for insert with check ( auth.role() = 'authenticated' );

-- 10. Add trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, name, avatar)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
// 11. Enable realtime for critical tables
alter publication supabase_realtime add table posts, comments, reels, profiles, likes, follows, friend_requests, notifications, conversations, conversation_participants, messages, typing_status, call_sessions, webrtc_signals;
`;

export function SupabaseSetup() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-nexa-dark)] text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-8 pt-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Database size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">
                Supabase Backend Configuration
              </h1>
              <p className="text-indigo-400 font-mono text-sm mt-2">
                REQUIRED SYSTEM INITIALIZATION
              </p>
            </div>
          </div>
          <p className="text-white/60 text-lg">
            NEXA is a full-stack media platform. To activate the real-time
            social layer, you must connect your Supabase project.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-start gap-4 p-6 glass rounded-2xl border border-white/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                Configure Environment Variables
              </h3>
              <p className="text-white/60 mb-4">
                Add your Supabase credentials to the AI Studio environment
                settings.
              </p>
              <div className="bg-black/50 rounded-xl p-4 font-mono text-sm border border-white/10">
                <div className="flex gap-4 mb-2">
                  <span className="text-indigo-400">VITE_SUPABASE_URL</span>
                  <span className="text-white/40">Your project URL</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-fuchsia-400">
                    VITE_SUPABASE_ANON_KEY
                  </span>
                  <span className="text-white/40">Your public anon key</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 glass rounded-2xl border border-white/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Execute Database Schema</h3>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copied ? "Copied!" : "Copy SQL"}
                </button>
              </div>
              <p className="text-white/60 mb-4">
                Paste and run this schema in your Supabase SQL Editor to
                generate the necessary tables, policies, and storage buckets.
              </p>

              <div className="relative group">
                <pre className="bg-black/50 p-6 rounded-xl overflow-x-auto text-sm font-mono text-white/80 border border-white/10 max-h-[400px] overflow-y-auto scrollbar-hide">
                  <code>{SQL_SCHEMA}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 glass rounded-2xl border border-white/5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/30">
              <Play size={14} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                Authentication & Storage
              </h3>
              <ul className="list-disc list-inside text-white/60 space-y-2 mt-2">
                <li>
                  Make sure Email/Password authentication is enabled in Supabase
                  Auth settings.
                </li>
                <li>
                  The schema automatically created the{" "}
                  <code className="bg-white/10 px-1 rounded text-white">
                    media
                  </code>{" "}
                  storage bucket for image and video uploads.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
