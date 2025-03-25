import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";

const Cards = ({ title, children, icon, chatperson }) => {
  const cardRef = useRef();

  useEffect(() => {
    const card = cardRef.current;
    
    gsap.fromTo(
      card.rotation,
      { x: -0.2, y: -0.2 },
      {
        x: 0,
        y: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      }
    );
  }, []);

  useFrame(({ mouse }) => {
    if (cardRef.current) {
      gsap.to(cardRef.current.rotation, {
        x: mouse.y * 0.2,
        y: mouse.x * 0.2,
        duration: 0.5,
      });
    }
  });

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 5]} intensity={1} />
      <mesh ref={cardRef} position={[0, 0, 0]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#0D0D0D" metalness={0.3} roughness={0.6} />
        <Html transform position={[0, 0, 0.06]}>
          <div
            style={{
              width: "200px",
              height: "100px",
              backgroundColor: "#0D0D0D",
              color: "#A9A9A9",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #7e7e7e69",
              textAlign: "center",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {icon}
              {title}
              {chatperson}
            </span>
            {children}
          </div>
        </Html>
      </mesh>
    </Canvas>
  );
};

export default Cards;
