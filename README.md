# ✨ React Cursor Image Trail

A lightweight, fully customizable React component that creates a smooth image trail effect following the user’s cursor.

Perfect for creative portfolios, agency websites, landing pages, and interactive hero sections.

---

## 🚀 Features

- Smooth cursor-following image trail
- Fully customizable size, rotation, speed, and lifecycle
- Performance optimized
- No external dependencies
- TypeScript ready
- Works with React & Next.js
- Easy drop-in component

---

## 📦 Installation

Simply copy the component file into your project:

```
/components/CursorImageTrail.tsx
```

No additional packages required.

---

## 🧩 Usage

```tsx
import { CursorImageTrail } from "./components/CursorImageTrail";

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
}
```

---

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| images | string[] | required | Image URLs to cycle through |
| imageSize | number | 180 | Size of trail images in px |
| rotationRange | number | 15 | Max ± rotation in degrees |
| throttleMs | number | 120 | Minimum ms between spawns |
| lifetime | number | 1200 | Image lifespan in ms |
| maxTrails | number | 12 | Maximum visible trail images |
| minDistance | number | 40 | Minimum cursor movement before spawn |
| borderRadius | number | 4 | Image corner radius |
| children | ReactNode | — | Content inside container |

---

## 🎨 Customization Tips

- Square images work best
- 6–10 images recommended for variety
- Lower `throttleMs` for denser trails
- Increase `lifetime` for longer ghost effects
- Adjust `rotationRange` for more dynamic movement

---

## 🧠 How It Works

- Tracks mouse movement
- Spawns image elements when cursor moves beyond a threshold
- Applies randomized rotation within range
- Automatically removes images after lifespan
- Limits active trails for performance stability

Designed for smooth rendering without heavy animation libraries.

---

## 🛠 Built With

- React
- TypeScript
- Modern DOM animation techniques

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built by [Aurelo Web Studio](https://aurelo.uk)  
Creative frontend tools & interactive UI components
