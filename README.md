# ✨ Aether View

[![GitHub stars](https://img.shields.io/github/stars/somethingisnotrightokay/Aetherview?style=flat-square&logo=github)](https://github.com/somethingisnotrightokay/Aetherview)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Made with WebGL](https://img.shields.io/badge/made%20with-WebGL-FF6B6B?style=flat-square&logo=three.js)](https://threejs.org/)
[![Open Source](https://img.shields.io/badge/open%20source-❤-red?style=flat-square)](https://github.com/somethingisnotrightokay/Aetherview)

> A free, self-hosted, cross-platform 3D wallpaper engine that turns your screen into a dynamic window into another world.
>
> Using webcam face tracking, gyroscope input, and touch interaction, it delivers physically-based off-axis parallax for a true depth illusion on both desktop and mobile.

---

## 🎯 What's Special?

**AetherView doesn't fake 3D** — it recreates it using **off-axis rendering**, the same principle used in real-world head-tracked displays. This shifts the camera projection itself, not just the objects, creating the true illusion of looking through an actual window.

---

## ✨ Features

- **Real off-axis parallax rendering** ← Not fake camera movement
- **Panoramic (360°) environments** with correct sphere mapping
- **Image & video backgrounds** with depth-enhanced rendering
- **3D model support** (.glb / .gltf) with responsive parallax rotation
- **🎥 Face tracking** (webcam) for natural head-based perspective shift
- **📱 Gyroscope support** (mobile, HTTPS)
- **👆 Touch drag fallback** (works even on `file://`)
- **Dynamic scene system** with nebulae, starfields, and ambient effects
- **Improved color pipeline** (sRGB + ACES tone mapping)
- **Modular architecture** (multi-file, no build step required)
- **Zero setup** — runs directly in the browser (perfect for GitHub Pages)

---

## 🚀 Use Cases

- 🖥️ Turn your desktop into a **live 3D scene**
- 🎬 Create immersive **video or panoramic environments**
- 🔬 Experiment with **head-tracked rendering in the browser**
- 🎨 Build your own custom **interactive wallpaper setups**

---

## 🌌 Why AetherView?

| Feature | Traditional Engines | AetherView |
|---------|--------------------:|:-----------|
| **Parallax Type** | 2D sprite movement | True 3D projection shift |
| **Depth Perception** | Simulated | Physically accurate |
| **Perspective Tracking** | Static view | Head-tracked viewing |
| **Browser Compatible** | Usually not | ✓ Yes |
| **Self-hosted** | Rarely | ✓ Always |

---

## 🎮 Get Started

```bash
# Clone the repository
git clone https://github.com/somethingisnotrightokay/Aetherview.git
cd Aetherview

# Open in your browser
open index.html
# or just drag it to your browser
```

---

## 💡 How It Works

AetherView uses **off-axis projection** — the camera's frustum is shifted based on your head position or device orientation, creating the illusion of true depth without moving 3D objects around. This is the same technology used in museum exhibits and head-tracked displays.

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve AetherView.

---

<p align="center">
  <strong>Turn your screen into a window. 🪟</strong>
</p>
