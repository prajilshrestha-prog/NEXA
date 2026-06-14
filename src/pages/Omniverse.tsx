import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Text,
  Environment,
  Line,
} from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Globe,
  Network,
  Zap,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ParticleGalaxy() {
  const count = 2000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 20;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.2; // flatten
      const z = r * Math.cos(phi);

      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a855f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function CreatorNodes() {
  const nodes = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 15,
      ),
      name: `Civilization ${i + 1}`,
    }));
  }, []);

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i} position={node.position}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={2}
            />
          </mesh>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {node.name}
          </Text>
        </group>
      ))}

      {/* Interconnections */}
      {nodes.map((node, i) => {
        if (i < nodes.length - 1) {
          return (
            <Line
              key={i}
              points={[node.position, nodes[i + 1].position]}
              color="#ffffff"
              opacity={0.1}
              transparent
              lineWidth={1}
            />
          );
        }
        return null;
      })}
    </group>
  );
}

export function Omniverse() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative bg-[#020205] overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 p-6 md:p-12 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="pointer-events-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] tracking-tighter uppercase">
              Absolute Omniverse Network
            </h1>
            <p className="text-[var(--color-nexa-text-muted)] text-sm font-mono mt-2 flex items-center gap-2">
              <InfinityIcon size={14} className="text-fuchsia-400" /> Connecting
              Infinite Creator Civilizations
            </p>
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full glass border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-xl">
              <Globe size={16} className="text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                Generate Existence
              </span>
            </button>
          </div>
        </div>

        <div className="pointer-events-auto max-w-md">
          <div className="glass p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Network size={18} className="text-fuchsia-400" /> Current
              Coordinate
            </h3>
            <p className="text-sm text-[var(--color-nexa-text-muted)] leading-relaxed">
              All realities converge here. Seamlessly traverse interconnected
              eternal omniversal spaces and synchronize origin consciousness
              across creator systems.
            </p>

            <div className="mt-6 space-y-3">
              <button className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex justify-between items-center group">
                <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white">
                  Emotional Reality Node 4
                </span>
                <Zap
                  size={14}
                  className="text-[var(--color-nexa-accent-light)]"
                />
              </button>
              <button className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex justify-between items-center group">
                <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white">
                  Consciousness Space 00X
                </span>
                <Zap
                  size={14}
                  className="text-[var(--color-nexa-accent-light)]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
        <fog attach="fog" args={["#020205", 10, 40]} />
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          color="#6366f1"
        />

        <Stars
          radius={100}
          depth={50}
          count={10000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        <ParticleGalaxy />
        <CreatorNodes />

        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2 + 0.2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
