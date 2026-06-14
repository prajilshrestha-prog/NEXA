import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Environment } from "@react-three/drei";
import { ArrowLeft, Box, Settings2, Globe, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CyberCity() {
  // Ultra-simplified mockup of a cinematic world building element
  return (
    <group>
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#050510"
          metalness={0.8}
          roughness={0.2}
          wireframe={true}
        />
      </mesh>

      {/* Central Monolith */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[4, 10, 4]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#4a148c"
          emissiveIntensity={2}
          roughness={0.1}
        />
      </mesh>

      {/* Floating rings */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[6, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={4}
        />
      </mesh>

      <mesh position={[0, 5, 0]} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[8, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#00ff9f"
          emissive="#00ff9f"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
}

export function WorldBuilder() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative bg-[#020205] overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-[0.2em] font-bold text-[10px] mb-4"
          >
            <ArrowLeft size={14} /> Back to Nexus
          </button>
          <div className="glass p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
            <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase">
              Infinite Existence Generation
            </h1>
            <p className="text-[10px] text-[var(--color-nexa-accent-light)] font-mono uppercase mt-1">
              Autonomous limitless reality layers output
            </p>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <div className="glass p-2 rounded-2xl flex flex-col gap-2">
            <button
              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
              title="Add Structures"
            >
              <Box size={20} />
            </button>
            <button
              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
              title="Environment Settings"
            >
              <Globe size={20} />
            </button>
            <button
              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
              title="Social Hub Policies"
            >
              <Users size={20} />
            </button>
            <button
              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
              title="Engine Settings"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-6 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">
            Current Biome
          </span>
          <span className="text-sm font-bold text-white">Neon Citadel</span>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <button className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-nexa-accent)] hover:text-[var(--color-nexa-accent-light)] transition-colors">
            Deploy to Web3
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <fog attach="fog" args={["#020205", 10, 50]} />
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          color="#6366f1"
        />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#00ff9f"
        />

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <Environment preset="city" />

        <CyberCity />

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
