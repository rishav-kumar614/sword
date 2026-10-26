# Vesper — Atelier of Edged Things

A scroll-driven 3D luxury sword website built for the fictional atelier **Vesper**, featuring three original GLB models:
1. Sheathed sword in scabbard
2. Bare pattern-welded blade
3. The empty scabbard ("The Pocket")

## Architecture & Technology

- **HTML5 & Vanilla CSS**: Clean, semantic structure with static concrete background textures rendered via dual SVG `feTurbulence` filters (320px fine grain + 2600px seamless mottled patches).
- **Vanilla Three.js (r169)** via jsdelivr import map.
- **Strict Rendering**:
  - `NoToneMapping`
  - `RoomEnvironment` via `PMREMGenerator` at intensity 1.0 (no extra lights; materials display dark gunmetal, bright silver trims, and deep red inlays).
  - Transparent WebGL canvas overlaid with CSS typography.
  - Zero post-processing, bloom, particles, or colored lights.
- **Object Alignment & Scale via PCA**:
  - Read-only vertex sampling to calculate covariance and principal long-axis vector.
  - Rotates each model to orient the hilt/mouth on top (`+Y`) and centers the bounding box.
  - Scabbard calibrated to exactly 2.0 units.
  - Blade crossguard detected in upper half slice; blade scaled so guard-to-tip spans 97% (1.94 units) of the scabbard.
  - Precise seat offset calculated and stored to mate the crossguard flush with the scabbard mouth.
  - Sheathed model footprint matched to identical bounds.
- **Procedural 3D Sumi-e Red Ink Splash**:
  - 1024px offscreen canvas with ragged solid core, ~26 overlapping horizontal dry-brush strokes (3–7px bristles), ~7 dynamic flicks, and fine garnet specks (`#9c0c16` to `#c0141f`).
  - Positioned at `z = -4` behind 3D text planes, smoothly tracking the sword.
- **3D Canvas Text Planes**:
  - Giant "Vesper" (hero) and italic "Return" (Section IV) at `z = -2`, rendered in off-white `#f3f2ef` with the sword always in front (`z = 0`).
- **Scroll Physics & Pose Interpolation**:
  - Lenis smooth scroll (`v1.1.13`).
  - Keyframe poses interpolated with `easeInOutCubic`.
  - Half-turn swap during Section I (facing away).
  - Blade extraction, horizontal inspection with specs count-up, scabbard rotation in The Pocket, and guided slide into scabbard during The Return with camera shake ceremony and "Home." transition.
  - Magnetic button drift and custom dot cursor.

## Quick Start

### macOS / Linux:
Double-click `start.command` or run:
```bash
python3 -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Windows:
Double-click `start.bat` or run:
```powershell
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080).
