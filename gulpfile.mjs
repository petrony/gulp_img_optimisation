import { src, dest, series } from 'gulp';
import imagemin from 'gulp-imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';
import clean from 'gulp-clean';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { globby } from 'globby';

// Завдання для очищення папки dist
async function cleanDist() {
  if (existsSync('dist')) {
    return src('dist', { read: false, allowEmpty: true })
      .pipe(clean());
  }
  return Promise.resolve();
}

// Завдання для створення папки dist/images
async function ensureDistDir() {
  await mkdir('dist/images', { recursive: true });
}

// Завдання для перевірки файлів
async function checkFiles() {
  const files = await globby('src/images/**/*.{png,jpg,jpeg,gif,svg,PNG,JPG,JPEG,GIF,SVG}');
  if (files.length === 0) {
    console.log('Помилка: Жодного файлу не знайдено в src/images!');
  } else {
    console.log('Знайдено файли:', files);
  }
  return Promise.resolve();
}

// Завдання для оптимізації зображень
async function optimizeImages() {
  return src('src/images/**/*.{png,jpg,jpeg,gif,svg,PNG,JPG,JPEG,GIF,SVG}', { allowEmpty: true, encoding: false })
    .pipe(imagemin([
      imageminGifsicle({
        interlaced: true,
        optimizationLevel: 3
      }),
      imageminMozjpeg({
        quality: 75,
        progressive: true
      }),
      imageminPngquant({
        quality: [0.7, 0.9],
        speed: 1
      }),
      imageminSvgo({
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'cleanupIDs', active: true }
        ]
      })
    ], {
      verbose: true
    }))
    .pipe(dest('dist/images'));
}

export { optimizeImages, cleanDist, checkFiles };
export default series(cleanDist, ensureDistDir, checkFiles, optimizeImages);