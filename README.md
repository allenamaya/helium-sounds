# Helium Sounds &nbsp;&nbsp; <img width="120" height="120" alt="HELIUM LOGO ANIMATED" src="./public/helium-logo-animated.svg" align="middle" />

Helium Sounds is an open-source desktop DJ workstation designed with the physical, tactile, minimalist, and playful design language of Teenage Engineering.

It is NOT a clone of traditional DJ software like Serato or Traktor. Instead, it is built from first principles, placing typography, whitespace, microinteractions, and physical controls at the core.

---

## Core Technologies
- **Desktop Shell**: [Tauri v2](https://tauri.app) (Rust-backed desktop application framework)
- **Frontend**: [React 19](https://react.dev) + [Vite](https://vite.dev) + [TypeScript](https://www.typescriptlang.org)
- **Style**: [TailwindCSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Audio Engine**: [CPAL](https://github.com/RustAudio/cpal) (low-level audio routing), [Symphonia](https://github.com/pdeljanov/symphonia) (media decoding), and [Rubato](https://github.com/HEnquist/rubato) (high-quality resampling)
- **Database**: SQLite (local library indexing)
- **Testing**: Vitest (frontend unit testing) and Playwright (E2E testing)

---

## Design System
- **Colors**: Matte-style curated tones (e.g., `#F7F7F5` matte light gray background, `#FFB800` warning accent gold).
- **Typography**: Geist Sans, Inter, and IBM Plex Mono (for hardware dials and deck statistics).
- **Aesthetic Guidelines**: No tiny, crowded buttons. Ample breathing room, large touch-friendly knobs, high-fidelity micro-animations (Framer Motion).

---

## Local Development

### 1. Prerequisites

#### Windows Host
To compile and package the Windows desktop binaries locally:
- **Rust**: Install via [rustup](https://rustup.rs).
- **Node.js**: Version 20+ (with npm 10+).
- **C++ Build Tools**: Install Visual Studio C++ Build Tools (specifically MSVC v143 build tools and Windows SDK).
- **WebView2**: Standard on Windows 11, must be installed on Windows 10.

#### WSL (Linux Environment)
To run or develop using WSL (Ubuntu/Debian):
- **Rust**:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- **System Dependencies** (Tauri v2 compiler dependencies):
  ```bash
  sudo apt-get update
  sudo apt-get install -y build-essential curl wget file libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
  ```

---

### 2. Frontend Development (Web Sandbox)
To run and iterate on the UI, waveforms, and sequencer without compiling the desktop shell:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Tauri Desktop Mode
To run the full desktop application:
```bash
npm run tauri dev
```

---

## Branching Strategy
We follow a feature-based branching model:
- `main`: Production-ready release branch. Deployments are triggered automatically on push.
- `development`: Main integration branch where feature branches are merged.
- Feature branches (`feature/ui`, `feature/audio-engine`, etc.): Isolated branches for implementing distinct milestones.

Commit messages must conform to **Conventional Commits**:
- `feat: add EQ controls to mixer`
- `fix: resolve click on play pause transition`
- `docs: update build instruction`
- `style: refine Teenage Engineering matte theme colors`
