# gulp_img_optimisation

A lightweight, zero-config Gulp 5 task for batch image optimization. It scans `src/images`, compresses PNG, JPEG, GIF, and SVG files using the appropriate `imagemin` plugin for each format, and outputs the optimized assets to `dist/images` — cleaning up any previous build first.

## Features

- **Automatic cleanup** — removes the existing `dist` folder before each build, so output never contains stale files.
- **Format-aware compression** — routes each file type to a dedicated optimizer:
  - `imagemin-mozjpeg` for JPEG/JPG (progressive encoding, quality 75)
  - `imagemin-pngquant` for PNG (quality range 0.7–0.9)
  - `imagemin-gifsicle` for GIF (interlaced, optimization level 3)
  - `imagemin-svgo` for SVG (preserves `viewBox`, cleans up `id` attributes)
- **Pre-flight file check** — logs how many source images were found (or warns if none were), so a misconfigured path fails loudly instead of silently producing an empty `dist`.
- **Case-insensitive extension matching** — picks up both `.png`/`.PNG`, `.jpg`/`.JPG`, etc.
- **ESM-based gulpfile** — written as `gulpfile.mjs` using native ES module syntax (`import`/`export`), compatible with Gulp 5.
- **Recursive glob discovery** via [`globby`](https://github.com/sindresorhus/globby), so nested subfolders under `src/images` are picked up automatically.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (ESM `gulpfile.mjs` support)
- npm

## Installation

```bash
git clone https://github.com/petrony/gulp_img_optimisation.git
cd gulp_img_optimisation
npm install
```

## Project structure

```
gulp_img_optimisation/
├── src/
│   └── images/          # Place your source images here (subfolders supported)
├── dist/
│   └── images/          # Generated — optimized output (created on build)
├── gulpfile.mjs          # Gulp task definitions
├── package.json
└── package-lock.json
```

## Usage

1. Drop your source images into `src/images/` (nested folders are supported, e.g. `src/images/icons/logo.svg`).
2. Run the default Gulp task:

```bash
npx gulp
```

This runs the full pipeline in sequence:

| Step | Task            | What it does                                                              |
| ---- | --------------- | -------------------------------------------------------------------------- |
| 1    | `cleanDist`      | Deletes the existing `dist` folder, if present.                            |
| 2    | `ensureDistDir`  | Recreates `dist/images`.                                                   |
| 3    | `checkFiles`     | Scans `src/images` and logs the list of files found (or a warning if empty).|
| 4    | `optimizeImages` | Compresses every image and writes the result to `dist/images`.             |

Optimized files land in `dist/images`, mirroring the folder structure of `src/images`.

### Running individual tasks

Each task is also exported individually, so you can run a single step directly:

```bash
npx gulp cleanDist
npx gulp checkFiles
npx gulp optimizeImages
```

> Note: `optimizeImages` alone assumes `dist/images` already exists (created by `ensureDistDir` in the default pipeline). If you run it standalone on a fresh clone, run `npx gulp cleanDist` and let the default task create the directory first, or add an npm script that ensures the folder exists.

### Adding an npm script (optional)

For convenience, you can add this to `package.json`:

```json
{
  "scripts": {
    "optimize": "gulp"
  }
}
```

Then simply run:

```bash
npm run optimize
```

## Supported formats

| Format | Extensions matched                | Optimizer            |
| ------ | ---------------------------------- | --------------------- |
| JPEG   | `.jpg`, `.jpeg`, `.JPG`, `.JPEG`   | `imagemin-mozjpeg`     |
| PNG    | `.png`, `.PNG`                     | `imagemin-pngquant`    |
| GIF    | `.gif`, `.GIF`                     | `imagemin-gifsicle`    |
| SVG    | `.svg`, `.SVG`                     | `imagemin-svgo`        |

## Configuration

Compression settings are defined directly inside `gulpfile.mjs`, in the `optimizeImages` task. You can tune them to fit your project's needs:

```js
imageminMozjpeg({
  quality: 75,        // 0–100, higher = better quality / larger file
  progressive: true
}),
imageminPngquant({
  quality: [0.7, 0.9], // min/max quality range, 0–1
  speed: 1              // 1 = best compression (slowest), 11 = fastest
}),
imageminGifsicle({
  interlaced: true,
  optimizationLevel: 3  // 1–3, higher = more aggressive
}),
imageminSvgo({
  plugins: [
    { name: 'removeViewBox', active: false }, // keep viewBox for responsive SVGs
    { name: 'cleanupIDs', active: true }
  ]
})
```

## Dependencies

| Package               | Purpose                                      |
| ---------------------- | --------------------------------------------- |
| `gulp`                 | Task runner                                   |
| `gulp-imagemin`        | Gulp wrapper around `imagemin`                |
| `imagemin-mozjpeg`     | JPEG compression                              |
| `imagemin-pngquant`    | PNG compression                               |
| `imagemin-gifsicle`    | GIF compression                               |
| `imagemin-svgo`        | SVG optimization                              |
| `gulp-clean`           | Removes the `dist` folder before each build   |
| `globby`               | Recursive glob-based file discovery           |
| `gulp-cache`           | (available as a dependency for caching optimized files between runs) |

## How it works

The default export composes four tasks with Gulp's `series()`, so each step waits for the previous one to finish:

```js
export default series(cleanDist, ensureDistDir, checkFiles, optimizeImages);
```

This guarantees a fully clean, predictable output on every run — no leftover files from previous builds, no silent failures when the source folder is empty.

## License

No license specified. Add a `LICENSE` file if you intend to make this project open source under a specific license.
