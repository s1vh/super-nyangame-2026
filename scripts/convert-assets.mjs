// Build-time conversion only. Original PNG and audio bytes are never modified.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(root, 'public/assets');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', parseAttributeValue: true });
const copies = [];

async function copy(source, target) {
  const from = resolve(root, 'legacy/media', source);
  const to = resolve(destination, target);
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
  const bytes = await readFile(from);
  copies.push({ source: `legacy/media/${source}`, target, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}

export function convertAtlas(xml, image, imageSize) {
  const frames = {};
  const atlas = parser.parse(xml).TextureAtlas;
  for (const region of atlas.SubTexture) {
    const { name, x, y, width: w, height: h } = region;
    if (frames[name]) throw new Error(`Duplicate frame: ${name}`);
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0 || x < 0 || y < 0 || x+w > imageSize.w || y+h > imageSize.h) {
      throw new Error(`Invalid packed rectangle: ${name}`);
    }
    frames[name] = {
      frame: { x, y, w, h }, rotated: false,
      trimmed: region.frameWidth !== undefined,
      spriteSourceSize: { x: -(region.frameX ?? 0), y: -(region.frameY ?? 0), w, h },
      sourceSize: { w: region.frameWidth ?? w, h: region.frameHeight ?? h },
    };
  }
  const animations = {};
  for (const prefix of ['cat00', 'cat_hit00', 'invader00', 'destructor00', 'star00', 'token00', 'backgroundStar']) {
    const names = Object.keys(frames).filter((name) => name.startsWith(prefix)).sort();
    if (names.length) animations[prefix] = names;
  }
  return { frames, animations, meta: { image, format: 'RGBA8888', size: imageSize, scale: '1' } };
}

export async function generateAssets() {
  copies.length = 0;
  await mkdir(destination, { recursive: true });
  for (const [source, target] of [['gameSprites_sheet', 'game'], ['welcomeScreen_sheet', 'menu']]) {
    const png = await readFile(resolve(root, `legacy/media/Graphics/${source}.png`));
    const size = { w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
    const xml = await readFile(resolve(root, `legacy/media/Graphics/${source}.xml`), 'utf8');
    const data = convertAtlas(xml, `${target}.png`, size);
    await writeFile(resolve(destination, `${target}.json`), JSON.stringify(data, null, 2) + '\n');
    await copy(`Graphics/${source}.png`, `${target}.png`);
    console.log(`${target}: ${Object.keys(data.frames).length} regions, ${size.w} x ${size.h}, PNG unchanged`);
  }
  for (const size of [24, 48]) {
    for (const extension of ['png', 'fnt']) await copy(`Fonts/NyanImpact${size}/NyanImpact${size}.${extension}`, `fonts/NyanImpact${size}.${extension}`);
  }
  await copy('Graphics/star0000.png', 'result-star.png');
  await copy('Graphics/particle.png', 'particle.png');
  for (const name of ['collect', 'damage', 'death', 'meow', 'start', 'takeOff']) await copy(`Effect_Sounds/${name}.mp3`, `audio/${name}.mp3`);
  for (const name of ['NyanLoop', 'NyanWelcome']) await copy(`Music_Sounds/${name}.mp3`, `audio/${name}.mp3`);
  await writeFile(resolve(destination, 'provenance.json'), JSON.stringify(copies, null, 2) + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generateAssets();
