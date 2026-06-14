import { Box, FolderOpen, Image as ImageIcon, Link as LinkIcon, Video } from "lucide-react";

export function Portfolio() {
  return (
    <div className="w-full h-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Portfolio</h1>
          <p className="text-white/60 text-sm">Showcase your projects, galleries, and case studies.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors">
          Add Project
        </button>
      </div>

      <div className="flex gap-4 mb-8">
         <button className="px-4 py-2 bg-white text-black font-medium text-sm rounded-lg">Projects</button>
         <button className="px-4 py-2 bg-white/5 border border-white/5 text-white font-medium text-sm rounded-lg">Galleries</button>
         <button className="px-4 py-2 bg-white/5 border border-white/5 text-white font-medium text-sm rounded-lg">Case Studies</button>
      </div>

      <div className="w-full py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5">
        <FolderOpen size={48} className="text-white/20 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
        <p className="text-white/50 text-sm max-w-sm text-center mb-6">
          You haven't uploaded any distinct portfolio case studies, project images, videos, or links yet.
        </p>
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2 text-white/40">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
               <ImageIcon size={20} />
             </div>
             <span className="text-[10px]">Images</span>
           </div>
           <div className="flex flex-col items-center gap-2 text-white/40">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
               <Video size={20} />
             </div>
             <span className="text-[10px]">Videos</span>
           </div>
           <div className="flex flex-col items-center gap-2 text-white/40">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
               <LinkIcon size={20} />
             </div>
             <span className="text-[10px]">Links</span>
           </div>
        </div>
      </div>
    </div>
  );
}
