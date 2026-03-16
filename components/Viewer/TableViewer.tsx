"use client";

import {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from "react";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Html,
  OrbitControls,
  useDetectGPU,
  useGLTF
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Cache, Group, Mesh } from "three";

import { createViewerScreenshot } from "@/lib/utils/viewerScreenshot";

Cache.enabled = true;

const WOOD_TEXTURES = {
  oak: "/textures/oak.jpg",
  walnut: "/textures/walnut.jpg",
  ash: "/textures/ash.jpg",
  maple: "/textures/maple.jpg"
} as const;

type WoodType = keyof typeof WOOD_TEXTURES;
type LegStyle = "standard" | "sled" | "xframe" | "panel";

type TableDimensions = {
  length: number;
  width: number;
  height: number;
};

type TableViewerProps = {
  modelUrl: string;
  woodType?: WoodType;
  woodTexture?: string;
  epoxyColor?: string;
  legStyle?: LegStyle;
  legModel?: string;
  dimensions?: TableDimensions;
};

type SceneModelProps = {
  modelUrl: string;
  woodType?: WoodType;
  woodTexture?: string;
  epoxyColor?: string;
  legStyle?: LegStyle;
  legModel?: string;
  dimensions?: TableDimensions;
};

export type TableViewerHandle = {
  captureScreenshot: () => ReturnType<typeof createViewerScreenshot> | null;
};

// Minimal viewer: keep original model materials without re-coloring or textures.

function resolveLegModelUrl(legStyle?: LegStyle, legModel?: string) {
  // External leg GLB models are optional. If a custom legModel is provided,
  // use it; otherwise fall back to the built-in legs inside the main model.
  if (legModel) {
    return legModel;
  }

  return undefined;
}

function updateMeshShadowState(group: Group) {
  group.traverse((object) => {
    const mesh = object as Mesh;

    if (!("isMesh" in mesh) || !mesh.isMesh) {
      return;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

function setBuiltInLegVisibility(group: Group, visible: boolean) {
  group.traverse((object) => {
    const mesh = object as Mesh;

    if (!("isMesh" in mesh) || !mesh.isMesh) {
      return;
    }

    const meshName = mesh.name.toLowerCase();
    const isLegMesh =
      meshName.includes("leg") ||
      meshName.includes("base") ||
      meshName.includes("feet") ||
      meshName.includes("support");

    if (isLegMesh) {
      mesh.visible = visible;
    }
  });
}

function getTableScale(dimensions?: TableDimensions) {
  const baseDimensions = {
    length: 180,
    width: 90,
    height: 75
  };

  if (!dimensions) {
    return [1, 1, 1] as const;
  }

  return [
    Math.max(dimensions.length / baseDimensions.length, 0.4),
    Math.max(dimensions.height / baseDimensions.height, 0.4),
    Math.max(dimensions.width / baseDimensions.width, 0.4)
  ] as const;
}

function useAssetAvailability(assetUrl?: string) {
  const [status, setStatus] = useState<"loading" | "available" | "missing">(
    assetUrl ? "loading" : "missing"
  );

  useEffect(() => {
    if (!assetUrl) {
      setStatus("missing");
      return;
    }

    let isActive = true;
    setStatus("loading");

    fetch(assetUrl, {
      method: "HEAD",
      cache: "no-store"
    })
      .then((response) => {
        if (isActive) {
          setStatus(response.ok ? "available" : "missing");
        }
      })
      .catch(() => {
        if (isActive) {
          setStatus("missing");
        }
      });

    return () => {
      isActive = false;
    };
  }, [assetUrl]);

  return status;
}

function SceneModel({
  modelUrl,
  legStyle,
  legModel,
  dimensions
}: SceneModelProps) {
  const { scene } = useGLTF(modelUrl);
  const resolvedLegModel = resolveLegModelUrl(legStyle, legModel);
  const tableScene = useMemo(() => scene.clone(true), [scene]);
  const tableScale = useMemo(() => getTableScale(dimensions), [dimensions]);
  const legGltf = useGLTF(resolvedLegModel ?? modelUrl);
  const legScene = useMemo(() => {
    if (!resolvedLegModel) {
      return null;
    }

    return legGltf.scene.clone(true);
  }, [legGltf.scene, resolvedLegModel]);

  useEffect(() => {
    updateMeshShadowState(tableScene);
    setBuiltInLegVisibility(tableScene, !legScene);
  }, [legScene, tableScene]);

  useEffect(() => {
    if (!legScene) {
      return;
    }

    updateMeshShadowState(legScene);
  }, [legScene]);

  return (
    <group dispose={null} scale={tableScale}>
      <primitive object={tableScene} />
      {legScene ? <primitive object={legScene} /> : null}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 backdrop-blur">
        Loading 3D model...
      </div>
    </Html>
  );
}

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

export const TableViewer = forwardRef<TableViewerHandle, TableViewerProps>(
  function TableViewer(
    {
      modelUrl,
      woodType = "oak",
      woodTexture,
      epoxyColor = "#2563eb",
      legStyle = "standard",
      legModel,
      dimensions
    },
    ref
  ) {
    const gpu = useDetectGPU();
    const [captureDataUrl, setCaptureDataUrl] = useState<(() => string) | null>(
      null
    );
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const shadowMapSize = isMobile || gpu.tier <= 1 ? 512 : 1024;
    const dpr: [number, number] = isMobile ? [1, 1.25] : [1, 1.75];
    const enableShadows = !isMobile || gpu.tier >= 2;
    const antialias = !isMobile && gpu.tier >= 2;
    const modelStatus = useAssetAvailability(modelUrl);
    const resolvedLegModel = resolveLegModelUrl(legStyle, legModel);
    const legStatus = useAssetAvailability(resolvedLegModel);
    const resolvedLegModelUrl =
      legStatus === "available" ? resolvedLegModel : undefined;

    const handleCaptureReady = useCallback((capture: (() => string) | null) => {
      setCaptureDataUrl(() => capture);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        captureScreenshot() {
          if (!captureDataUrl) {
            return null;
          }

          return createViewerScreenshot(captureDataUrl(), {
            designName: modelUrl.split("/").pop()?.replace(".glb", "") || "table"
          });
        }
      }),
      [captureDataUrl, modelUrl]
    );

    return (
      <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-2xl bg-neutral-900">
        <Canvas
          className="h-full w-full"
          dpr={dpr}
          frameloop="demand"
          performance={{ min: 0.6 }}
          shadows={enableShadows}
          camera={{ position: [2.8, 1.8, 3.4], fov: 38 }}
          gl={{
            antialias,
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true
          }}
        >
          <ScreenshotBridge onReady={handleCaptureReady} />
          <color attach="background" args={["#0b1120"]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            intensity={1.4}
            position={[6, 8, 5]}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
          />
          <group position={[0, -0.6, 0]}>
            {modelStatus === "available" ? (
              <Suspense fallback={<LoadingFallback />}>
                <SceneModel
                  modelUrl={modelUrl}
                  legStyle={legStyle}
                  legModel={resolvedLegModelUrl}
                  dimensions={dimensions}
                />
              </Suspense>
            ) : null}
          </group>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            position={[0, -0.65, 0]}
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={1} />
          </mesh>
          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={1.8}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2.05}
          />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          {modelStatus === "loading" ? <LoadingFallback /> : null}
        </Canvas>
      </div>
    );
  }
);

// Optional: preload a custom leg model here if you pass `legModel`.

