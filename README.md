# AetherView

[![Last Commit](https://img.shields.io/github/last-commit/somethingisnotrightokay/Aetherview?style=flat-square)](https://github.com/somethingisnotrightokay/Aetherview)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Made with Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=three.js)](https://threejs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-00C853?style=flat-square&logo=githubpages)](https://somethingisnotrightokay.github.io/Aetherview)

> AetherView is a free, self-hosted 3D wallpaper engine that turns your screen into a live window into another world.  
> Using webcam face tracking, gyroscope input, and touch interaction, it delivers true off-axis parallax and dynamic depth effects on desktop and mobile.

---

## 🎯 What's Special?

**AetherView recreates real depth — it doesn't fake it.**  

It uses **off-axis projection**, the same principle as head-tracked displays. Instead of moving objects, it shifts the camera’s frustum based on your perspective, producing an authentic depth illusion.

---

## ✨ Features

- **Real off-axis parallax rendering** — objects stay static, depth comes from the camera
- **Panoramic 360° environments** with sphere mapping
- **Image & video backgrounds** with depth-enhanced rendering
- **3D model support** (.glb / .gltf) with responsive parallax rotation
- **Webcam face tracking** for natural perspective shift
- **Mobile gyroscope support** (HTTPS required)
- **Touch/drag fallback** works even offline (file://)
- **Dynamic scene system** with nebulae, starfields, forests, city streets, planets, and more
- **Physically-based lighting** + tone mapping for realistic materials
- **Advanced color and scene controls** (brightness, contrast, saturation, fog, particles)
- **Modular architecture** — no build step needed
- **Zero setup** — runs in-browser, perfect for GitHub Pages hosting

---

## 🌌 Why AetherView?

| Feature | Traditional Engines | AetherView |
|---------|--------------------:|:-----------|
| **Parallax Type** | 2D sprite movement | True 3D projection shift |
| **Depth Perception** | Simulated | Physically accurate |
| **Perspective Tracking** | Static view | Head-tracked |
| **Browser Compatible** | Usually not | ✓ Yes |
| **Self-hosted** | Rarely | ✓ Always |

---

## 🚀 Use Cases

- 🖥️ Live 3D desktop wallpapers  
- 🎬 Immersive panoramic environments  
- 🔬 Head-tracked rendering experiments in the browser  
- 🎨 Interactive wallpapers and scene builders  

---

## 🎮 Getting Started

AetherView runs entirely in your browser and can be **self-hosted anywhere** that serves static files: GitHub Pages, your personal web server, or locally.

### Using it locally (Limited Mode):

```bash
# Clone the repository
git clone https://github.com/somethingisnotrightokay/Aetherview.git
cd Aetherview

# Open index.html in a browser
open index.html
# or just drag it into any modern browser
```
> ⚠️ Local file:// limitations: Webcam face tracking and mobile gyroscope are disabled. Touch/drag works as a fallback. Hosting via HTTPS enables full functionality.




---

💡 How It Works

AetherView uses off-axis projection — the camera frustum moves in response to your head or device position.

This produces true perspective change without moving the objects, creating a realistic 3D effect similar to real-world head-tracked displays.

Additional effects include:

Depth-enhanced images and videos

Near-field objects shift dramatically with head movement

Far-field objects shift minimally for realistic parallax

Dynamic lights and shadows respond to camera movement



---

📝 License

This project is licensed under the MIT License — see the LICENSE file for details.

> You may use, modify, or host it freely, but you cannot sell it as your own product.




---

🤝 Contributing

Contributions are welcome!
Open issues or submit pull requests to improve scenes, performance, or features.


---

<p align="center">
  <strong>Turn your screen into a window. 🪟</strong><br>
  <sub>Or better yet — another world.</sub>
