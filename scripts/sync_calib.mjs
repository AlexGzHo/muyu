import fs from 'node:fs';

const petAcc = fs.readFileSync('src/components/svg/PetAccessories.tsx', 'utf8');
const lines = petAcc.split(/\r?\n/);
// lines 33 to 301 is WEARABLE_CONFIG body
const start = 33; // line 34 is the opening brace
const end = 301;  // line 302 is the closing brace
const configLines = lines.slice(start, end);
const jsBlock = 'const WEARABLE_CONFIG = {\n' + configLines.join('\n');

let calib = fs.readFileSync('public/calibrate_accessories.html', 'utf8');
calib = calib.replace(/<script type="module">[\s\S]*?function getGlassesSvg/, '<script type="module">\n' + jsBlock + '\n\n    function getGlassesSvg');

fs.writeFileSync('public/calibrate_accessories.html', calib);
console.log('Successfully injected WEARABLE_CONFIG without TS types!');

