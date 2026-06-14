import { Briefcase, Users, UserPlus, FileEdit, Plus, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function Opportunities() {
  const [activeTab, setActiveTab] = useState<"jobs" | "collaborations" | "recruiters" | "freelance">("jobs");
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const tabs = [
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "collaborations", label: "Collaborations", icon: Users },
    { id: "recruiters", label: "Recruiters", icon: UserPlus },
    { id: "freelance", label: "Freelance", icon: FileEdit },
  ] as const;

  useEffect(() => {
    const fetchOpps = async () => {
      const { data } = await supabase.from("opportunities").select("*, profiles(name, avatar, username)").eq("type", activeTab).order("created_at", { ascending: false });
      setOpportunities(data || []);
    };
    fetchOpps();
  }, [activeTab]);

  return (
    <div className="w-full h-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Opportunities</h1>
          <p className="text-white/60 text-sm">Discover jobs, freelance gigs, and collaborations.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
          <Plus size={18} />
          Post Opportunity
        </button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto scrollbar-hide border-b border-white/10 pb-4">
         {tabs.map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`px-4 py-2 flex items-center gap-2 font-medium text-sm rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-white text-black" : "bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
           >
             <tab.icon size={16} className={activeTab === tab.id ? "text-black" : "text-white/50"} />
             {tab.label}
           </button>
         ))}
      </div>

      {opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <div key={opp.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-colors flex flex-col gap-4">
               <div>
                  <h3 className="font-bold text-lg text-white">{opp.title}</h3>
                  <div className="text-xs text-white/50 mt-1 flex gap-3">
                     <span>{opp.profiles?.name}</span>
                     {opp.location && <span>• {opp.location}</span>}
                  </div>
               </div>
               <p className="text-sm text-white/80 line-clamp-3">{opp.description}</p>
               <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
                 <span className="font-mono text-indigo-400 font-bold">{opp.budget || "Unpaid/Negotiable"}</span>
                 <button className="flex items-center gap-2 text-xs font-bold bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200">
                    Apply <ExternalLink size={14} />
                 </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5">
          <Briefcase size={48} className="text-white/20 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No {tabs.find(t => t.id === activeTab)?.label} Found</h3>
          <p className="text-white/50 text-sm max-w-sm text-center mb-6">
            There are currently no {activeTab} available. Create a new posting or check back later!
          </p>
        </div>
      )}
    </div>
  );
}
