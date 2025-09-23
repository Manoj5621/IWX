import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const MaleModel = (props) => {
  const group = useRef();
  const { scene } = useGLTF("/models/male.glb");

  useEffect(() => {
    if (scene) {
      // Compute bounding box of model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());

      // Shift model so it’s centered
      scene.position.sub(center);
    }
  }, [scene]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        (state.mouse.x * Math.PI) / 6,
        0.1
      );
    }
  });

  return <primitive ref={group} object={scene} scale={1.2} {...props} />;
};

export const FemaleModel = (props) => {
  const group = useRef();
  const { scene } = useGLTF("/models/female.glb");

  useEffect(() => {
    if (scene) {
      // Compute bounding box of model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());

      // Shift model so it's centered
      scene.position.sub(center);
    }
  }, [scene]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        (state.mouse.x * Math.PI) / 6,
        0.1
      );
    }
  });

  return <primitive ref={group} object={scene} scale={1.} position={[5, 0, 0.5]} {...props} />;
};

export const SampleModel = ({ position = [0, 0, 0], scale = 1, ...props }) => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        (state.mouse.x * Math.PI) / 6,
        0.1
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        (state.mouse.y * Math.PI) / 12,
        0.1
      );
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Enhanced torus with gradient effect */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 4, 0, Math.PI / 6]} castShadow>
        <torusGeometry args={[1.1, 0.25, 32, 100]} />
        <meshStandardMaterial 
          color="#6366F1" 
          emissive="#4F46E5" 
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glowing icosahedron with subtle pulse */}
      <mesh position={[0, 1, 0]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial 
          color="#10B981" 
          emissive="#059669" 
          emissiveIntensity={0.5}
          wireframe={false}
          transparent
          opacity={0.9}
          metalness={0.7}
        />
      </mesh>
      
      {/* Sleek cone with metallic finish */}
      <mesh position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.5, 1.8, 16]} />
        <meshStandardMaterial 
          color="#F59E0B" 
          emissive="#D97706" 
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Additional floating orb for balance */}
      <mesh position={[1.2, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#EC4899" 
          emissive="#DB2777" 
          emissiveIntensity={0.6}
          metalness={0.8}
        />
      </mesh>
      
      {/* Subtle ring around the center */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <ringGeometry args={[1.3, 1.4, 32]} />
        <meshStandardMaterial 
          color="#6B7280" 
          emissive="#4B5563" 
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Preload GLTFs
useGLTF.preload('/models/male.glb');
useGLTF.preload('/models/female.glb');
