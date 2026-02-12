import { useState, useEffect, useRef, useCallback } from "react";

const AURELO_LOGO = "/aurelo-logo.png";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop",

];

const COMPONENT_CODE = `import { useState, useEffect, useRef, useCallback } from "react";

let _trailId = 0;

function TrailImage({ id, x, y, src, size, rotation, lifetime, borderRadius = 4, onComplete }) {
  const [phase, setPhase] = useState("enter");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setPhase("visible"));
    const exitTimer = setTimeout(() => setPhase("exit"), lifetime * 0.6);
    const removeTimer = setTimeout(() => onComplete(id), lifetime);
    return () => { cancelAnimationFrame(raf); clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, []);

  return (
    <div ref={ref} style={{
      position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size,
      pointerEvents: "none", zIndex: id, willChange: "transform, opacity", borderRadius, overflow: "hidden",
      boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      transition: phase === "enter" ? "none"
        : phase === "visible"
          ? "transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s cubic-bezier(0.22,1,0.36,1)"
          : "transform 0.5s cubic-bezier(0.55,0,1,0.45), opacity 0.5s cubic-bezier(0.55,0,1,0.45)",
      transform: phase === "enter"
        ? \`rotate(\${rotation}deg) scale(0.3)\`
        : phase === "visible"
          ? \`rotate(\${rotation}deg) scale(1)\`
          : \`rotate(\${rotation + 8}deg) scale(0.85)\`,
      opacity: phase === "enter" ? 0 : phase === "visible" ? 1 : 0,
    }}>
      <img src={src} alt="" draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }} />
    </div>
  );
}

export function CursorImageTrail({
  images, imageSize = 180, rotationRange = 15, throttleMs = 120,
  lifetime = 1200, maxTrails = 12, minDistance = 40, borderRadius = 4,
  children, className, style,
}) {
  const [trails, setTrails] = useState([]);
  const containerRef = useRef(null);
  const imgIdx = useRef(0);
  const lastTime = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  const remove = useCallback((id) => setTrails((p) => p.filter((t) => t.id !== id)), []);

  const onMove = useCallback((e) => {
    const now = Date.now();
    if (now - lastTime.current < throttleMs) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dx = x - lastPos.current.x, dy = y - lastPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < minDistance) return;
    lastTime.current = now; lastPos.current = { x, y };
    const rotation = (Math.random() - 0.5) * 2 * rotationRange;
    const src = images[imgIdx.current % images.length];
    imgIdx.current++;
    setTrails((p) => {
      const next = [...p, { id: ++_trailId, x, y, src, rotation }];
      return next.length > maxTrails ? next.slice(-maxTrails) : next;
    });
  }, [images, rotationRange, throttleMs, maxTrails, minDistance]);

  return (
    <div ref={containerRef} onMouseMove={onMove} className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}>
      {trails.map((t) => (
        <TrailImage key={t.id} {...t} size={imageSize}
          lifetime={lifetime} borderRadius={borderRadius} onComplete={remove} />
      ))}
      {children}
    </div>
  );
}`;

const USAGE_CODE = `import { CursorImageTrail } from "./components/CursorImageTrail";

const images = [
  "/images/trail-1.jpg",
  "/images/trail-2.jpg",
  "/images/trail-3.jpg",
  "/images/trail-4.jpg",
];

export default function Page() {
  return (
    <CursorImageTrail
      images={images}
      imageSize={180}
      rotationRange={15}
      throttleMs={120}
      lifetime={1200}
      maxTrails={12}
      style={{ width: "100vw", height: "100vh" }}
    >
      <h1>Your content here</h1>
    </CursorImageTrail>
  );
}`;

/* ─── Trail Image (internal) ──────────────────────────────────── */
let globalId = 0;

function TrailImage({ id, x, y, src, size, rotation, lifetime, onComplete }) {
  const [phase, setPhase] = useState("enter");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setPhase("visible"));
    const exitTimer = setTimeout(() => setPhase("exit"), lifetime * 0.6);
    const removeTimer = setTimeout(() => onComplete(id), lifetime);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: id,
        willChange: "transform, opacity",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        transition:
          phase === "enter"
            ? "none"
            : phase === "visible"
              ? "transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s cubic-bezier(0.22,1,0.36,1)"
              : "transform 0.5s cubic-bezier(0.55,0,1,0.45), opacity 0.5s cubic-bezier(0.55,0,1,0.45)",
        transform:
          phase === "enter"
            ? `rotate(${rotation}deg) scale(0.3)`
            : phase === "visible"
              ? `rotate(${rotation}deg) scale(1)`
              : `rotate(${rotation + 8}deg) scale(0.85)`,
        opacity: phase === "enter" ? 0 : phase === "visible" ? 1 : 0,
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
      />
    </div>
  );
}

/* ─── Cursor Image Trail (internal for demo) ──────────────────── */
function CursorImageTrail({
  images = DEFAULT_IMAGES,
  imageSize = 180,
  rotationRange = 15,
  throttleMs = 120,
  lifetime = 1200,
  maxTrails = 12,
}) {
  const [trails, setTrails] = useState([]);
  const containerRef = useRef(null);
  const imageIndexRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleRemove = useCallback((id) => {
    setTrails((p) => p.filter((t) => t.id !== id));
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const now = Date.now();
      if (now - lastTimeRef.current < throttleMs) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 40) return;
      lastTimeRef.current = now;
      lastPosRef.current = { x, y };
      const rotation = (Math.random() - 0.5) * 2 * rotationRange;
      const src = images[imageIndexRef.current % images.length];
      imageIndexRef.current++;
      setTrails((p) => {
        const next = [...p, { id: ++globalId, x, y, src, rotation }];
        return next.length > maxTrails ? next.slice(-maxTrails) : next;
      });
    },
    [images, rotationRange, throttleMs, maxTrails]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", cursor: "crosshair" }}
    >
      {trails.map((t) => (
        <TrailImage
          key={t.id}
          id={t.id}
          x={t.x}
          y={t.y}
          src={t.src}
          size={imageSize}
          rotation={t.rotation}
          lifetime={lifetime}
          onComplete={handleRemove}
        />
      ))}
    </div>
  );
}

/* ─── Slider ──────────────────────────────────────────────────── */
function Slider({ label, value, min, max, suffix, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8070" }}>{label}</span>
        <span style={{ fontSize: 13, color: "#3d3529", fontVariantNumeric: "tabular-nums", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
          {value}{suffix}
        </span>
      </div>
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "#d6cec4" }} />
        <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: 1, background: "#3d3529", transition: "width 0.1s ease" }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "relative", width: "100%", margin: 0, appearance: "none",
            WebkitAppearance: "none", background: "transparent", cursor: "pointer", height: 20, zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Code Block ──────────────────────────────────────────────── */
function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8070" }}>{label}</span>
          <button
            onClick={copy}
            style={{
              background: copied ? "rgba(61,53,41,0.08)" : "transparent",
              border: "1px solid rgba(61,53,41,0.12)", borderRadius: 6, padding: "5px 14px",
              fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
              color: copied ? "#3d3529" : "#8a8070", cursor: "pointer", transition: "all 0.25s ease",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <div
        style={{
          background: "#1a1714", borderRadius: 10, padding: "20px 22px", overflow: "auto", maxHeight: 340,
          border: "1px solid rgba(61,53,41,0.06)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "#c4bab0", fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace", whiteSpace: "pre", tabSize: 2 }}>
          {code}
        </pre>
      </div>
    </div>
  );
}

/* ─── Step ────────────────────────────────────────────────────── */
function Step({ number, title, description }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(61,53,41,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontSize: 11, color: "#8a8070", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic",
        }}
      >
        {number}
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#3d3529", fontWeight: 500, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#8a8070", lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

/* ─── Global CSS ──────────────────────────────────────────────── */
const globalCSS = `
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%;
    background: #3d3529; border: 2px solid #f4efe8; cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12); transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
  input[type="range"]::-moz-range-thumb {
    width: 14px; height: 14px; border-radius: 50%; background: #3d3529;
    border: 2px solid #f4efe8; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  }
  input[type="range"]::-moz-range-track { background: transparent; border: none; height: 1px; }
  input[type="range"]::-webkit-slider-runnable-track { background: transparent; height: 1px; }
  input[type="range"]:focus { outline: none; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .nav-link {
    background: none; border: none; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    color: #8a8070; cursor: pointer; padding: 6px 0; border-bottom: 1px solid transparent;
    transition: border-color 0.3s ease, color 0.3s ease; text-decoration: none;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  .nav-link:hover { border-bottom-color: #3d3529; color: #3d3529; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(61,53,41,0.15); border-radius: 4px; }
`;

/* ─── App ─────────────────────────────────────────────────────── */
export default function App() {
  const [config, setConfig] = useState({
    imageSize: 180,
    rotationRange: 15,
    throttleMs: 120,
    lifetime: 1200,
    maxTrails: 12,
  });
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("component");
  const codeRef = useRef(null);

  const set = (key) => (val) => setConfig((p) => ({ ...p, [key]: val }));
  const scrollToCode = () => codeRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#f4efe8", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", position: "relative" }}>
      <style>{globalCSS}</style>

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, padding: "0 32px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(244,239,232,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(61,53,41,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={AURELO_LOGO} alt="Aurelo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d3529", fontWeight: 500 }}>
              Cursor Trail
            </span>
            <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#b0a898" }}>
              React Component
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <button className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Demo</button>
          <button className="nav-link" onClick={scrollToCode}>Get Code</button>
          <a className="nav-link" href="https://aurelo.uk" target="_blank" rel="noopener noreferrer">aurelo.uk</a>
        </div>
      </nav>

      {/* ─── Hero / Demo ───────────────────────────────────── */}
      <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
        {/* Grain */}
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.25, pointerEvents: "none", mixBlendMode: "multiply",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
        {/* Grid */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(61,53,41,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(61,53,41,0.03) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <CursorImageTrail
          imageSize={config.imageSize}
          rotationRange={config.rotationRange}
          throttleMs={config.throttleMs}
          lifetime={config.lifetime}
          maxTrails={config.maxTrails}
        />

        {/* Center text */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", zIndex: 0 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#b0a898", marginBottom: 20, animation: "fadeInUp 0.8s ease both", animationDelay: "0.2s" }}>
            Move your cursor to explore
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(40px, 7vw, 96px)", fontWeight: 400,
              fontStyle: "italic", color: "#3d3529", letterSpacing: "-0.02em", lineHeight: 1.05, margin: 0,
              opacity: 0.15, animation: "fadeInUp 0.8s ease both", animationDelay: "0.4s",
            }}
          >
            Image Trail
          </h1>
          <div style={{ width: 48, height: 1, background: "#c4bab0", margin: "24px auto 0", transformOrigin: "left", animation: "lineGrow 0.6s ease both", animationDelay: "0.8s" }} />
        </div>

        {/* Config toggle */}
        <button onClick={() => setPanelOpen(!panelOpen)} className="nav-link" style={{ position: "absolute", top: 80, right: 32, zIndex: 9999 }}>
          {panelOpen ? "Hide Controls" : "Configure"}
        </button>

        {/* Config panel */}
        <div
          style={{
            position: "absolute", bottom: 32, left: "50%",
            transform: `translateX(-50%) translateY(${panelOpen ? "0" : "calc(100% + 40px)"})`,
            background: "rgba(244,239,232,0.88)", border: "1px solid rgba(61,53,41,0.08)", borderRadius: 16,
            padding: "28px 32px 20px", zIndex: 9999, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            width: "min(560px, calc(100vw - 64px))",
            boxShadow: "0 16px 64px rgba(61,53,41,0.06), 0 2px 12px rgba(61,53,41,0.03)",
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease",
            opacity: panelOpen ? 1 : 0, pointerEvents: panelOpen ? "auto" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#b0a898" }}>Parameters</span>
            <div style={{ width: 24, height: 1, background: "#d6cec4" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <Slider label="Size" value={config.imageSize} min={80} max={350} suffix="px" onChange={set("imageSize")} />
            <Slider label="Rotation" value={config.rotationRange} min={0} max={45} suffix="°" onChange={set("rotationRange")} />
            <Slider label="Speed" value={config.throttleMs} min={40} max={300} suffix="ms" onChange={set("throttleMs")} />
            <Slider label="Duration" value={config.lifetime} min={400} max={3000} suffix="ms" onChange={set("lifetime")} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Slider label="Trail Count" value={config.maxTrails} min={1} max={30} suffix=" images" onChange={set("maxTrails")} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Code Section ──────────────────────────────────── */}
      <section ref={codeRef} style={{ padding: "80px 32px 60px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b0a898", marginBottom: 12 }}>Installation</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 400, fontStyle: "italic", color: "#3d3529", margin: 0, letterSpacing: "-0.01em" }}>
            Add to your project
          </h2>
          <div style={{ width: 32, height: 1, background: "#d6cec4", marginTop: 20 }} />
        </div>

        <div style={{ marginBottom: 40 }}>
          <Step number="1" title="Create the component file" description="Copy the component code below and save it as CursorImageTrail.tsx (or .jsx) in your components directory." />
          <Step number="2" title="Import and use" description="Import CursorImageTrail into any page or layout. Pass your images array and configure the props to match your design." />
          <Step number="3" title="Add your images" description="Use any image URLs — local imports, Unsplash, CDN links. Square aspect ratios work best. Recommended: 6-10 images for variety." />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid rgba(61,53,41,0.08)" }}>
          {[{ key: "component", label: "Component" }, { key: "usage", label: "Usage" }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                background: "none", border: "none",
                borderBottom: activeTab === key ? "1px solid #3d3529" : "1px solid transparent",
                padding: "12px 20px", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                color: activeTab === key ? "#3d3529" : "#8a8070",
                cursor: "pointer", transition: "all 0.25s ease", marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ paddingTop: 24 }}>
          {activeTab === "component" && <CodeBlock code={COMPONENT_CODE} label="CursorImageTrail.tsx" />}
          {activeTab === "usage" && <CodeBlock code={USAGE_CODE} label="page.tsx" />}
        </div>

        {/* Props table */}
        <div style={{ marginTop: 48, marginBottom: 48 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#b0a898", marginBottom: 16 }}>Props</p>
          <div style={{ border: "1px solid rgba(61,53,41,0.08)", borderRadius: 12, overflow: "hidden" }}>
            {[
              ["images", "string[]", "required", "Image URLs to cycle through"],
              ["imageSize", "number", "180", "Trail image size in px"],
              ["rotationRange", "number", "15", "Max ± rotation in degrees"],
              ["throttleMs", "number", "120", "Min ms between spawns"],
              ["lifetime", "number", "1200", "Image lifespan in ms"],
              ["maxTrails", "number", "12", "Max visible images"],
              ["minDistance", "number", "40", "Min cursor px before spawn"],
              ["borderRadius", "number", "4", "Image corner radius"],
              ["children", "ReactNode", "—", "Content inside container"],
            ].map(([prop, type, def, desc], i) => (
              <div
                key={prop}
                style={{
                  display: "grid", gridTemplateColumns: "140px 80px 70px 1fr", padding: "12px 20px",
                  fontSize: 12, borderBottom: i < 8 ? "1px solid rgba(61,53,41,0.05)" : "none",
                  background: i % 2 === 0 ? "rgba(61,53,41,0.015)" : "transparent",
                }}
              >
                <span style={{ color: "#3d3529", fontFamily: "'SF Mono', Consolas, monospace", fontSize: 11 }}>{prop}</span>
                <span style={{ color: "#8a8070", fontSize: 11 }}>{type}</span>
                <span style={{ color: "#b0a898", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: 11 }}>{def}</span>
                <span style={{ color: "#8a8070" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          padding: "40px 32px", borderTop: "1px solid rgba(61,53,41,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 720, margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={AURELO_LOGO} alt="Aurelo" style={{ width: 22, height: 22, borderRadius: 5, objectFit: "cover" }} />
          <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#3d3529", fontWeight: 500 }}>
            Aurelo Web Studio
          </span>
        </div>
        <a href="https://aurelo.uk" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
          aurelo.uk
        </a>
      </footer>
    </div>
  );
}
