import { useState } from "react";
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store/useAppStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { uploadMedia } from "../lib/upload";

export function Create() {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as "post" | "reel" | "story") || "post";
  const [postType, setPostType] = useState<"post" | "reel" | "story">(initialType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const addPost = useAppStore((state) => state.addPost) || (async () => {});
  const addReel = useAppStore((state) => state.addReel) || (async () => {});
  const addStory = useAppStore((state) => state.addStory) || (async () => {});
  const currentUser = useAppStore((state) => state.currentUser);
  const navigate = useNavigate();

  const handlePublish = async () => {
    if (!currentUser || (!title && !content && !imageFile)) return;
    
    if (postType === "reel" && mediaType !== "video") {
      alert("Reels must include a video.");
      return;
    }
    
    if (postType === "story" && !imageFile) {
      alert("Stories must include an image or video.");
      return;
    }

    setIsPublishing(true);
    setUploadProgress(0);

    try {
      console.log("CONTENT TYPE", postType);
      
      let finalImageUrl = image;
      if (imageFile) {
        finalImageUrl = await uploadMedia(
          imageFile,
          "media",
          setUploadProgress,
        );
      } else if (!image) {
        finalImageUrl = "";
      }

      console.log("FILE SELECTED", imageFile);
      console.log("MEDIA TYPE", mediaType);

      if (postType === "post") {
        const postData = {
          userId: currentUser.id,
          title: title || undefined,
          content: content,
          image: finalImageUrl || undefined,
          mediaType: finalImageUrl ? mediaType || "image" : undefined,
        };
        console.log("POST INSERT", postData);
        await addPost(postData);
      } else if (postType === "reel") {
        const reelData = {
          userId: currentUser.id,
          caption: `${title ? `**${title}**\n` : ""}${content}`,
          video: finalImageUrl,
          music: "Original Audio",
        };
        console.log("REEL INSERT", reelData);
        await addReel(reelData);
      } else if (postType === "story") {
        const storyData = {
          userId: currentUser.id,
          mediaUrl: finalImageUrl,
          mediaType: mediaType || "image",
          caption: title || content || undefined,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        console.log("STORY INSERT", storyData);
        await addStory(storyData as any);
      }

      if (image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }

      setShowSuccess(true);
      setTitle("");
      setContent("");
      setImage("");
      setImageFile(null);
      setMediaType(undefined);
      
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (e: any) {
      console.error(e);
      alert("Upload failed: " + (e?.message || JSON.stringify(e)));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2 mt-8">
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">
            Creator Studio
          </h1>
          <p className="text-white/50">
            Upload, enhance, and publish your next exhibit.
          </p>
        </header>
        
        {/* Type Selector */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl text-center font-semibold"
            >
              Successfully published {postType}!
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setPostType("post")}
            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${
              postType === "post" ? "bg-white text-black" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            Post
          </button>
          <button
            onClick={() => setPostType("reel")}
            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${
              postType === "reel" ? "bg-white text-black" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            Reel
          </button>
          <button
            onClick={() => setPostType("story")}
            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${
              postType === "story" ? "bg-white text-black" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            Story
          </button>
        </div>

        {/* Upload Area */}
        <label className="w-full aspect-[21/9] md:aspect-[3/1] rounded-[32px] border-2 border-dashed border-white/20 bg-[var(--color-glass-surface)] backdrop-blur-xl flex flex-col items-center justify-center gap-4 hover:border-[var(--color-nexa-accent)] transition-colors cursor-pointer group relative overflow-hidden">
          {image ? (
            mediaType === "video" ? (
              <video
                src={image}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={image}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--color-nexa-accent)]/20 transition-colors">
                <Upload
                  size={32}
                  className="text-white/70 group-hover:text-white transition-colors"
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Drag & Drop Media</h3>
                <p className="text-sm text-white/40 mt-1">
                  Supports up to 4K Video, RAW Images, and 3D Models
                </p>
              </div>
            </>
          )}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setImageFile(file);
                setImage(URL.createObjectURL(file));
                setMediaType(
                  file.type.startsWith("video/") ? "video" : "image",
                );
              }
            }}
            className="hidden"
          />
        </label>

        {/* Form area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 pl-1">
                Exhibit Title
              </label>
              <input
                type="text"
                maxLength={250}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Dystopia V.4"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 pl-1">
                Description & Story
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share the creative process..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm font-medium"
              ></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <button
              onClick={(e) => {
                e.preventDefault();
                handlePublish();
              }}
              type="button"
              disabled={(!title && !content) || isPublishing}
              className="w-full py-4 rounded-full bg-white text-black font-bold tracking-tight hover:bg-gray-200 transition-colors disabled:opacity-50 flex justify-center items-center relative overflow-hidden"
            >
              {isPublishing && (
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-500/20"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              <span className="relative z-10">
                {isPublishing
                  ? uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading (${uploadProgress}%)`
                    : "Publishing Exhibit..."
                  : "Publish Exhibit"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
