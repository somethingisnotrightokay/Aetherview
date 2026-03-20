
# ✨ AetherView

[![GitHub stars](https://img.shields.io/github/stars/somethingisnotrightokay/Aetherview?style=flat-square&logo=github)](https://github.com/somethingisnotrightokay/Aetherview)
[![Last Commit](https://img.shields.io/github/last-commit/somethingisnotrightokay/Aetherview?style=flat-square)](https://github.com/somethingisnotrightokay/Aetherview)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Made with Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=three.js)](https://threejs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-00C853?style=flat-square&logo=githubpages)](https://somethingisnotrightokay.github.io/Aetherview)

> A free, self-hosted, cross-platform 3D wallpaper engine that turns your screen into a dynamic window into another world.
>
> Using webcam face tracking, gyroscope input, and touch interaction, it delivers physically-based off-axis parallax for a true depth illusion on both desktop and mobile.

---

## 🎯 What's Special?

**AetherView doesn't fake 3D — it recreates it.**  

It uses **off-axis projection**, the same principle found in real-world head-tracked displays. Instead of moving objects, it shifts the camera’s projection itself, creating a convincing illusion of depth — like looking through a real window.

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
- 🎨 Build custom **interactive wallpaper setups**  

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
# or just drag it into your browser


---

💡 How It Works

AetherView uses off-axis projection — the camera’s frustum is dynamically shifted based on your head position or device orientation.

This creates true perspective change without moving objects in the scene, producing a natural depth illusion similar to real-world head-tracked displays.


---

📝 License

This project is licensed under the MIT License — see the LICENSE file for details.


---

🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.


---

<p align="center">
  <strong>Turn your screen into a window. 🪟</strong><br>
  <sub>Or better yet — another world.</sub>
</p>