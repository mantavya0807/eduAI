import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import SpotlightCard from "../../Animations/SpotlightCard";

const Card3D = ({ title, children, icon }) => {
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const shineRef = useRef(null);
  const childrenRef = useRef(null);

  useEffect(() => {
    const titleElement = titleRef.current;
    const childrenElement = childrenRef.current;

    if (!titleElement || !childrenElement) return;

    gsap.fromTo(
      [titleElement, childrenElement],
      { y: -5 },
      {
        y: 0,
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        repeatDelay: 0.5,
        stagger: 0.2,
      }
    );
  }, []);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const titleElement = titleRef.current;
    const shine = shineRef.current;
    const childrenElement = childrenRef.current;

    if (!card || !shine || !titleElement || !childrenElement) return;

    const { left, top, width, height } = card.getBoundingClientRect();
    const mouseX = (e.clientX - (left + width / 2)) / (width / 2);
    const mouseY = (e.clientY - (top + height / 2)) / (height / 2);

    gsap.to(card, {
      rotationX: -mouseY * 15,
      rotationY: mouseX * 15,
      scale: 1.05,
      transformPerspective: 1000,
      willChange: "transform",
      force3D: true,
      duration: 0.2,
    });

    gsap.to([titleElement, childrenElement], {
      rotationY: mouseX * 1.2,
      rotationX: -mouseY * 0.5,
      z: 50,
      x: Math.round(mouseX * 10),
      duration: 0.3,
    });

    gsap.to(shine, {
      opacity: 0.1,
      rotate: Math.round(mouseX * 10),
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const titleElement = titleRef.current;
    const shine = shineRef.current;
    const childrenElement = childrenRef.current;

    if (!card || !shine || !titleElement || !childrenElement) return;

    gsap.killTweensOf([card, titleElement, childrenElement, shine]);

    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      transformPerspective: 1000,
      willChange: "auto",
      duration: 0.5,
    });

    gsap.to([titleElement, childrenElement], {
      rotationY: 0,
      rotationX: 0,
      z: 0,
      x: 0,
      duration: 0.5,
    });

    gsap.to(shine, { opacity: 0, duration: 0.5 });
  };

  return (
    <SpotlightCard className="custom-spotlight-card w-max" spotlightColor="#301E47">
      <div
        ref={cardRef}
        className="relative w-96 h-[27vh] rounded-xl overflow-hidden shadow-xl cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-70"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-2.5 flex flex-col text-white !bg-transparent rounded-xl">
          <div className=" mx-auto flex flex-col justify-between h-full w-full">
            {/* Icon & Title */}
            <div className="flex items-center gap-2.5">
              {icon}
              <h2 ref={titleRef} className="text-[14px] font-medium relative">
                {title}
              </h2>
            </div>

            {/* Shine Effect */}
            <div
              ref={shineRef}
              className="absolute inset-0 opacity-0 pointer-events-none"
            ></div>

            {/* Interactive Children */}
            <div
              ref={childrenRef}
              className="mt-4 relative h-full flex flex-col justify-evenly"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default Card3D;
