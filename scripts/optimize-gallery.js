/**
 * One-off gallery optimizer — turns a folder of raw category-organized photos
 * into web-ready renditions + a manifest for apps/web/lib/gallery.
 *
 *   node scripts/optimize-gallery.js <src-photos-dir> <out-dir>
 *
 * Emits <out>/full/<cat>/<name>.jpg (max 1600px, q80), <out>/thumb/... (max
 * 640px, q72) and <out>/manifest.json. Requires `sharp` (npm i sharp).
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const [SRC, OUT] = process.argv.slice(2);
if (!SRC || !OUT) {
  console.error("usage: node scripts/optimize-gallery.js <src-photos-dir> <out-dir>");
  process.exit(1);
}
const MANIFEST = [];

const slug = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png|heic|webp)$/i.test(e.name)) yield p;
  }
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const files = [...walk(SRC)];
  console.log("files:", files.length);
  let i = 0;
  const seen = new Set();
  for (const f of files) {
    const rel = path.relative(SRC, f);
    const parts = rel.split(path.sep);
    const category = parts[0]; // e.g. Shower_Rooms
    const base = path.basename(f).replace(/\.[^.]+$/, "");
    // project name: strip trailing _photoN / _photo N; subfolder (e.g. Shower3) is grouping only
    let project = base.replace(/[_ ]?photo[_ ]?\d+$/i, "").replace(/[_(]+\d*[)]?$/g, "").trim();
    if (/^[0-9A-F-]{20,}$/i.test(project) || !project) project = category.replace(/_/g, " ");
    const group = parts.length > 2 ? parts[1] : null; // e.g. Shower3
    let name = slug(`${category}-${group ? group + "-" : ""}${base}`);
    while (seen.has(name)) name += "-x";
    seen.add(name);

    const catSlug = slug(category);
    const fullDir = path.join(OUT, "full", catSlug);
    const thumbDir = path.join(OUT, "thumb", catSlug);
    fs.mkdirSync(fullDir, { recursive: true });
    fs.mkdirSync(thumbDir, { recursive: true });

    try {
      const img = sharp(f, { failOn: "none" }).rotate();
      const fullOut = path.join(fullDir, name + ".jpg");
      const info = await img
        .clone()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(fullOut);
      const tinfo = await img
        .clone()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(path.join(thumbDir, name + ".jpg"));
      MANIFEST.push({
        category,
        catSlug,
        project,
        group,
        file: `${catSlug}/${name}.jpg`,
        w: info.width,
        h: info.height,
        tw: tinfo.width,
        th: tinfo.height,
      });
      if (++i % 25 === 0) console.log(i, "done");
    } catch (e) {
      console.error("FAIL", rel, e.message);
    }
  }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(MANIFEST, null, 1));
  console.log("total ok:", MANIFEST.length);
})();
