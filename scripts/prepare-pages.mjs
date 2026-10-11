import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outputDir = process.argv[2] || 'dist';

// BrowserRouter needs the SPA entry point when a URL such as /teams/1
// is opened directly. GitHub Pages serves this entry point with HTTP 404.
const domain = (await readFile(join(outputDir, 'CNAME'), 'utf8')).trim();
if (domain !== 'kbmleague.my.id') {
  throw new Error('CNAME tidak sesuai domain KBMLeague.');
}
await copyFile(join(outputDir, 'index.html'), join(outputDir, '404.html'));
await writeFile(join(outputDir, '.nojekyll'), '');
console.log(`GitHub Pages ready: ${domain}; SPA fallback and .nojekyll generated.`);
