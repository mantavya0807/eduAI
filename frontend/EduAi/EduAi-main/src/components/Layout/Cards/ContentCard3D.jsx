import React, { useEffect, useRef } from "react";
import Card3D from "../Card3D/Card3D";
import { GalleryVertical } from "lucide-react";
import { gsap } from "gsap";

function ContentCard3D({ title, description, imageUrl, gradient }) {
  const titleRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const cardsContainerRef = useRef(null);

  useEffect(() => {
    // Initial animation sequence
    const ctx = gsap.context(() => {
      // Set 3D properties for the main heading
      gsap.set(headingRef.current, {
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      });

      // Animate title and description
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Add a subtle floating effect to the main heading
      gsap.to(headingRef.current, {
        rotationX: 5,
        rotationY: -5,
        y: -5,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Add a different floating effect to the description
      gsap.to(descriptionRef.current, {
        rotationX: 3,
        rotationY: 3,
        y: -3,
        duration: 3,
        delay: 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Animate cards with staggered effect
      gsap.from(".card-item", {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  // Handle mouse movement for the main title
  const handleMouseMove = (e) => {
    if (!headingRef.current || !descriptionRef.current) return;

    const container = titleRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to element center
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);

    // Apply 3D rotation to heading
    gsap.to(headingRef.current, {
      rotationY: mouseX * 10,
      rotationX: -mouseY * 10,
      textShadow: `${mouseX * -5}px ${
        mouseY * -5
      }px 5px rgba(138, 43, 226, 0.3)`,
      duration: 0.3,
      ease: "power2.out",
    });

    // Apply different 3D rotation to description
    gsap.to(descriptionRef.current, {
      rotationY: mouseX * 5,
      rotationX: -mouseY * 5,
      textShadow: `${mouseX * -3}px ${
        mouseY * -3
      }px 3px rgba(138, 43, 226, 0.2)`,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!headingRef.current || !descriptionRef.current) return;

    // Reset to gentle floating animation
    gsap.to(headingRef.current, {
      rotationX: 5,
      rotationY: -5,
      y: -5,
      textShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 1.5,
      ease: "power3.out",
    });

    gsap.to(descriptionRef.current, {
      rotationX: 3,
      rotationY: 3,
      y: -3,
      textShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 1.5,
      ease: "power3.out",
    });
  };

  return (
    <>
      <div
        ref={cardsContainerRef}
        className="flex flex-wrap gap-8 justify-center"
      >
        <div className="card-item">
          <Card3D
            title={title}
            description={description}
            imageUrl={imageUrl}
            gradient={gradient}
          />
        </div>
      </div>
    </>
  );
}

export default ContentCard3D;
