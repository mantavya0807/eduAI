// import { Avatar } from "./Avatar";
// import { Canvas } from "@react-three/fiber";
import Chatbot from "../Api/ChatbotApi";
import Spline from "@splinetool/react-spline";

const Splinechar = () => {
  return (
    <Spline scene="https://prod.spline.design/QouV2IAel-56ksYd/scene.splinecode" />
  );
};

export const Experience = () => {
  return (
    <>
      <div className="flex flex-col m-4 w-full h-full justify-end">
        {/* <div className="h-full w-full">
          <Canvas
            className="!h-auto"
            shadows
            camera={{ position: [0, 2, 5], fov: 30 }}
          >
            <group position-y={-1}>
              <Avatar />
            </group>
            <ambientLight intensity={2} />
          </Canvas>

        </div> */}
        <div className="flex-1 character">
          <Splinechar  />
          {/* <iframe src='https://my.spline.design/nexbotrobotcharacterconcept-df748dba479665ca8682295292d1dfa0/' frameborder='0' width='100%' height='100%'></iframe> */}
        </div>
        <div className="">
          <Chatbot />
        </div>
      </div>
    </>
  );
};
