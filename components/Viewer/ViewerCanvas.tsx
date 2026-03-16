"use client";

import {
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState
} from "react";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  OrbitControls,
  useDetectGPU
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";

import type { DesignConfiguration } from "@/lib/utils/designs";
import { createViewerScreenshot } from "@/lib/utils/viewerScreenshot";

import { ConfiguredModel } from "./ConfiguredModel";

type ViewerCanvasProps = {
  design: DesignConfiguration;
};

export type ViewerCanvasHandle = {
  captureScreenshot: () => ReturnType<typeof createViewerScreenshot> | null;
};

type ScreenshotBridgeProps = {
  onReady: (capture: (() => string) | null) => void;
};

function ScreenshotBridge({ onReady }: ScreenshotBridgeProps) {
  const { gl } = useThree();

  useEffect(() => {
    onReady(() => gl.domElement.toDataURL("image/png"));
    return () => onReady(null);
  }, [gl, onReady]);

  return null;
}

export const ViewerCanvas = forwardRef<ViewerCanvasHandle, ViewerCanvasProps>(
  function ViewerCanvas({ design }, ref) {
    const gpu = useDetectGPU();
    const [captureDataUrl, setCaptureDataUrl] = useState<(() => string) | null>(
      null
    );
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const shadowMapSize = isMobile || gpu.tier <= 1 ? 1024 : 2048;
    const dpr: [number, number] = isMobile ? [1, 1.25] : [1, 1.75];
    const enableShadows = !isMobile || gpu.tier >= 2;

    const handleCaptureReady = useCallback(
      (capture: (() => string) | null) => {
        setCaptureDataUrl(() => capture);
      },
      []
    );

    useImperativeHandle(
      ref,
      () => ({
        captureScreenshot() {
          if (!captureDataUrl) {
            return null;
          }

          return createViewerScreenshot(captureDataUrl(), {
            designName: design.name
          });
        }
      }),
      [captureDataUrl, design.name]
    );

    return (
      <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-soft">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-white">Live 3D Viewer</h2>
            <p className="text-sm text-slate-400">
              Orbit, zoom, and preview finish changes instantly.
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            WebGL Ready
          </div>
        </div>

        <div className="absolute inset-0 bg-grid bg-[size:22px_22px] opacity-10" />

        <Canvas
          className="!h-full !w-full"
          dpr={dpr}
          frameloop="demand"
          performance={{ min: 0.6 }}
          shadows={enableShadows}
          camera={{ position: [5.5, 3.4, 6.5], fov: 40 }}
          gl={{ preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        >
          <ScreenshotBridge onReady={handleCaptureReady} />
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.8} />
          <directionalLight
            castShadow
            intensity={2}
            position={[8, 10, 6]}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
          />
          <spotLight
            position={[-5, 6, 5]}
            intensity={0.8}
            angle={0.35}
            penumbra={0.6}
          />
          <group position={[0, -0.05, 0]}>
            <ConfiguredModel design={design} />
          </group>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            position={[0, -0.01, 0]}
          >
            <planeGeometry args={[24, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={1} />
          </mesh>
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={4}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2.05}
          />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Canvas>
      </div>
    );
  }
);
