
# ✨ AetherView

[![Last Commit](https://img.shields.io/github/last-commit/somethingisnotrightokay/Aetherview?style=flat-square)](https://github.com/somethingisnotrightokay/Aetherview)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Made with Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=three.js)](https://threejs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-00C853?style=flat-square&logo=githubpages)](https://somethingisnotrightokay.github.io/Aetherview)

> A free, self-hosted, cross-platform **3D wallpaper engine** that turns your screen into a dynamic window into another world.
>
> Powered by webcam face tracking, gyroscope input, and touch interaction, AetherView delivers **physically-based off-axis parallax** for a true depth illusion on both desktop and mobile.

---

## 🎯 What's Special?

**AetherView doesn’t fake 3D — it recreates it.**

Instead of moving objects like typical parallax effects, it uses **off-axis projection** — the same principle used in real head-tracked displays.

👉 The result:  
It feels like you're looking **through** your screen, not at it.

---

## ✨ Features

- 🧠 **True off-axis parallax rendering** *(not fake camera movement)*
- 🌌 **Panoramic (360°) environments**
- 🖼️ **Image & video backgrounds** with depth enhancement
- 🧊 **3D model support** (`.glb` / `.gltf`)
- 🎥 **Face tracking** (webcam-based head tracking)
- 📱 **Gyroscope support** *(mobile, HTTPS only)*
- 👆 **Touch drag fallback** *(works on `file://`)*
- 🎨 **Advanced rendering pipeline** *(sRGB + ACES tone mapping)*
- 🌠 **Dynamic scenes & presets** *(space, forest, abstract, etc.)*
- ⚙️ **Extensive tuning controls** *(parallax, lighting, color, depth)*
- 🧩 **Modular, multi-file architecture**
- ⚡ **No build step required** — runs directly in the browser

---

## 🚀 Use Cases

- 🖥️ Turn your desktop into a **live 3D environment**
- 🎬 Create immersive **video or panoramic scenes**
- 🔬 Experiment with **head-tracked rendering**
- 🎨 Build your own **interactive wallpaper setups**

---

## 🌌 Why AetherView?

| Feature | Traditional Engines | AetherView |
|---------|--------------------:|:-----------|
| **Parallax Type** | 2D movement | True 3D projection |
| **Depth Perception** | Simulated | Physically accurate |
| **Perspective Tracking** | Static | Head-tracked |
| **Browser Support** | Rare | ✓ Yes |
| **Self-hosted** | Rare | ✓ Always |

---

## 🎮 Getting Started

### 🌐 Recommended (Full Experience)

Use the live version:

👉 https://somethingisnotrightokay.github.io/Aetherview/

---

### 💻 Local Setup (Limited Mode)

```bash
# Clone the repository
git clone https://github.com/somethingisnotrightokay/Aetherview.git
cd Aetherview

# Open in browser
open index.html
# or drag it into your browser
```

---

⚠️ Important (Local Limitations)

Running via file:// will disable:

❌ Camera (face tracking)

❌ Gyroscope


👉 You’ll still have:

✅ Touch / drag parallax

✅ Full scene rendering


Reason: Modern browsers block camera & motion APIs on insecure origins.


---

💡 How It Works

AetherView shifts the camera’s projection matrix, not the objects.

As your head moves:

The “virtual eye” moves

The projection updates

The scene appears to shift naturally


This creates a real spatial illusion, similar to looking through a physical window.


---

🛠️ Tech Stack

Three.js — rendering engine

MediaPipe FaceMesh — head tracking

Web APIs — camera, motion, input



---

📝 License

Licensed under the MIT License.
See LICENSE for details.


---

🤝 Contributing

Contributions are welcome!

Open issues

Suggest features

Submit pull requests


Let’s make this thing insane 🚀


---

<p align="center">
  <strong>Turn your screen into a window. 🪟</strong><br>
  <sub>Or better yet — another world.</sub>
</p>