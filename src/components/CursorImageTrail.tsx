import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────

interface TrailItem {
  id: number;
  x: number;
  y: number;
  src: string;
  rotation: number;
}

interface TrailImageProps {
  id: number;
  x: number;
  y: number;
  src: string;
  size: number;
  rotation: number;
  lifetime: number;
  borderRadius: number;
  onComplete: (id: number) => void;
}

interface CursorImageTrailProps {
  /**
   * Array of image URLs to cycle through.
   */
  images: string[];
  /**
   * Width and height of each trail image in pixels.
   * @default 180
   */
  imageSize?: number;
  /**
   * Maximum random rotation in degrees (applied ±).
   * @default 15
   */
  rotationRange?: number;
  /**
   * Minimum time between spawning images in ms.
   * @default 120
   */
  throttleMs?: number;
  /**
   * Total lifetime of each trail image in ms (enter + visible + exit).
   * @default 1200
   */
  lifetime?: number;
  /**
   * Maximum number of trail images visible at once.
   * @default 12
   */
  maxTrails?: number;
  /**
   * Minimum cursor distance in px before spawning a new image.
   * @default 40
   */
  minDistance?: number;
  /**
   * Border radius of trail images in px.
   * @default 4
   */
  borderRadius?: number;
  /**
   * Optional children rendered inside the trail container.
   */
  children?: ReactNode;
  /**
   * Optional className for the container div.
   */
  className?: string;
  /**
   * Optional inline styles for the container div.
   */
  style?: React.CSSProperties;
}

// ─── Internal counter ────────────────────────────────────────────

let _trailId = 0;

// ─── Trail Image ─────────────────────────────────────────────────

type Phase = "enter" | "visible" | "exit";

function TrailImage({
  id,
  x,
  y,
  src,
  size,
  rotation,
  lifetime,
  borderRadius,
  onComplete,
}: TrailImageProps) {
  const [phase, setPhase] = useState<Phase>("enter");
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force layout read, then trigger enter → visible
    elRef.current?.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setPhase("visible"));

    const exitTimer = setTimeout(() => setPhase("exit"), lifetime * 0.6);
    const removeTimer = setTimeout(() => onComplete(id), lifetime);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [id, lifetime, onComplete]);

  const transitions: Record<Phase, string> = {
    enter: "none",
    visible:
      "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
    exit:
      "transform 0.5s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.5s cubic-bezier(0.55, 0, 1, 0.45)",
  };

  const transforms: Record<Phase, string> = {
    enter: `rotate(${rotation}deg) scale(0.3)`,
    visible: `rotate(${rotation}deg) scale(1)`,
    exit: `rotate(${rotation + 8}deg) scale(0.85)`,
  };

  const opacities: Record<Phase, number> = {
    enter: 0,
    visible: 1,
    exit: 0,
  };

  return (
    <div
      ref={elRef}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: id,
        willChange: "transform, opacity",
        transition: transitions[phase],
        transform: transforms[phase],
        opacity: opacities[phase],
        borderRadius,
        overflow: "hidden",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          userSelect: "none",
        }}
      />
    </div>
  );
}

// ─── Cursor Image Trail ──────────────────────────────────────────

export function CursorImageTrail({
  images,
  imageSize = 180,
  rotationRange = 15,
  throttleMs = 120,
  lifetime = 1200,
  maxTrails = 12,
  minDistance = 40,
  borderRadius = 4,
  children,
  className,
  style,
}: CursorImageTrailProps) {
  const [trails, setTrails] = useState<TrailItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgIndexRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleRemove = useCallback((id: number) => {
    setTrails((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = Date.now();
      if (now - lastTimeRef.current < throttleMs) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < minDistance) return;

      lastTimeRef.current = now;
      lastPosRef.current = { x, y };

      const rotation = (Math.random() - 0.5) * 2 * rotationRange;
      const src = images[imgIndexRef.current % images.length];
      imgIndexRef.current++;

      const newTrail: TrailItem = {
        id: ++_trailId,
        x,
        y,
        src,
        rotation,
      };

      setTrails((prev) => {
        const next = [...prev, newTrail];
        return next.length > maxTrails ? next.slice(-maxTrails) : next;
      });
    },
    [images, rotationRange, throttleMs, maxTrails, minDistance]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {trails.map((trail) => (
        <TrailImage
          key={trail.id}
          id={trail.id}
          x={trail.x}
          y={trail.y}
          src={trail.src}
          size={imageSize}
          rotation={trail.rotation}
          lifetime={lifetime}
          borderRadius={borderRadius}
          onComplete={handleRemove}
        />
      ))}
      {children}
    </div>
  );
}

export default CursorImageTrail;
