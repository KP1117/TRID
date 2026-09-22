const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const zip = new JSZip();
const rootDir = path.resolve(__dirname, '..');
const outputZipPath = path.resolve(rootDir, 'public', 'trid-media-player.zip');

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'dev-dist',
  'release',
  '.git',
]);

const IGNORED_FILES = new Set([
  'trid-media-player.zip',
]);

function addDirectoryToZip(dirPath, zipFolder) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        const nextZipFolder = zipFolder.folder(entry.name);
        addDirectoryToZip(fullPath, nextZipFolder);
      }
    } else if (entry.isFile()) {
      if (!IGNORED_FILES.has(entry.name)) {
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(entry.name, fileData);
      }
    }
  }
}

console.log('Packaging project into public/trid-media-player.zip ...');
addDirectoryToZip(rootDir, zip);

zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
}).then((content) => {
  fs.writeFileSync(outputZipPath, content);
  const sizeMb = (content.length / (1024 * 1024)).toFixed(2);
  console.log(`Successfully generated public/trid-media-player.zip (${sizeMb} MB)`);
}).catch((err) => {
  console.error('Error generating zip:', err);
  process.exit(1);
});
