import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  MeshReflectorMaterial,
  Text,
  Image as DreiImage,
  OrbitControls,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "motion/react";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ITEMS = [
  {
    id: 1,
    title: "Cyber Protocol",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    author: "Kaelen Vance",
  },
  {
    id: 2,
    title: "Neon Dystopia",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    author: "Sia Valerius",
  },
  {
    id: 3,
    title: "Synthetic Dreams",
    url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=800&auto=format&fit=crop",
    author: "Aris Thorne",
  },
  {
    id: 4,
    title: "Neural Network",
    url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
    author: "Lexi Nova",
  },
  {
    id: 5,
    title: "Abstract Void",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    author: "Sia Valerius",
  },
];

function Frame({
  url,
  title,
  author,
  index,
  total,
  hovered,
  setHovered,
  active,
  setActive,
}: any) {
  const ref = useRef<THREE.Group>(null);
  const imageRef = useRef<any>(null);

  const angle = (index / total) * Math.PI * 2;
  const radius = 5;
  const targetX = Math.sin(angle) * radius;
  const targetZ = Math.cos(angle) * radius;

  const isActive = active === index;
  const isHovered = hovered === index;

  useCursor(isHovered);

  useFrame((state, dt) => {
    if (!ref.current) return;

    // Position
    const p = new THREE.Vector3(targetX, isActive ? 0.5 : 0, targetZ);
    if (isActive) {
      p.set(0, 0, 2);
    }
    ref.current.position.lerp(p, 0.1);

    // Rotation
    if (isActive) {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
      ref.current.quaternion.slerp(q, 0.1);
    } else {
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, angle, 0),
      );
      ref.current.quaternion.slerp(q, 0.1);
    }

    // Hover scale
    const s = isActive ? 1.5 : isHovered ? 1.1 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

    if (imageRef.current) {
      imageRef.current.material.zoom = THREE.MathUtils.lerp(
        imageRef.current.material.zoom,
        isActive ? 1 : 1.2,
        0.1,
      );
      imageRef.current.material.grayscale = THREE.MathUtils.lerp(
        imageRef.current.material.grayscale,
        isHovered || isActive ? 0 : 0.8,
        0.1,
      );
    }
  });

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setActive(isActive ? null : index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(index);
      }}
      onPointerOut={() => setHovered(null)}
    >
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[2, 2.5]} />
        <meshBasicMaterial color="black" />
        <DreiImage
          ref={imageRef}
          url={url}
          transparent
          opacity={1}
          position={[0, 0, 0.01]}
          scale={[1.9, 2.4]}
        />
      </mesh>

      <Text
        color={isHovered || isActive ? "white" : "gray"}
        fontSize={0.15}
        position={[0, -0.7, 0.01]}
        anchorX="center"
        anchorY="top"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        {title}
      </Text>
      <Text
        color="gray"
        fontSize={0.08}
        position={[0, -0.9, 0.01]}
        anchorX="center"
        anchorY="top"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        {author}
      </Text>
    </group>
  );
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const orbitRef = useRef<any>(null);

  useFrame(() => {
    if (orbitRef.current && active !== null) {
      // orbitRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {ITEMS.map((item, i) => (
        <Frame
          key={item.id}
          {...item}
          index={i}
          total={ITEMS.length}
          hovered={hovered}
          setHovered={setHovered}
          active={active}
          setActive={setActive}
        />
      ))}

      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
        />
      </mesh>

      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2 - 0.2}
        maxPolarAngle={Math.PI / 2}
        autoRotate={active === null}
        autoRotateSpeed={0.5}
      />
    </group>
  );
}

export function Gallery3D() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-[0.2em] font-bold text-[10px]"
          >
            <ArrowLeft size={14} /> Back to Nexus
          </button>
          <h1 className="text-4xl font-display font-bold mt-4 text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] tracking-wider">
            Absolute Cinematic Gallery
          </h1>
          <p className="text-indigo-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">
            NEXA SINGULARITY ENGINE
          </p>
        </div>

        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
            <Maximize2 size={16} className="text-white" />
          </button>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 5, 15]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={1} penumbra={1} />

        <Suspense fallback={null}>
          <Scene />
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 text-[10px] uppercase tracking-widest font-bold">
        Drag to rotate • Click to inspect
      </div>
    </div>
  );
}
