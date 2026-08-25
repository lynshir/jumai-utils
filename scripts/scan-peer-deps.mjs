import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '../packages');
const pkgs = fs.readdirSync(root).filter((d) =>
  fs.existsSync(path.join(root, d, 'package.json'))
);

const builtins = new Set([
  'react/jsx-dev-runtime',
  'react/jsx-runtime',
]);

function getPackageName(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (['node_modules', 'dist', 'lib', '__tests__', 'test', 'stories'].includes(f)) continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(f)) {
      const c = fs.readFileSync(p, 'utf8');
      for (const re of [/from ['"]([^./][^'"]*)['"]/g, /require\(['"]([^./][^'"]*)['"]\)/g]) {
        for (const m of c.matchAll(re)) {
          const pkg = getPackageName(m[1]);
          if (!builtins.has(pkg) && !pkg.startsWith('node:')) out.add(pkg);
        }
      }
    }
  }
}

for (const name of pkgs.sort()) {
  const pkgDir = path.join(root, name);
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  if (pkg.private) continue;

  const declared = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);
  const devOnly = new Set(Object.keys(pkg.devDependencies || {}));
  const imports = new Set();
  walk(path.join(pkgDir, 'src'), imports);

  const runtime = [...imports]
    .filter((i) => !i.startsWith('jumai-') && !i.startsWith('@types/'))
    .sort();

  const shouldPeer = runtime.filter((i) => !declared.has(i));
  const inDevOnly = shouldPeer.filter((i) => devOnly.has(i));

  console.log(`=== ${name} ===`);
  console.log('runtime imports:', runtime.join(', ') || '(none)');
  console.log('need peer/add:', shouldPeer.join(', ') || '(none)');
  console.log('currently in devDeps only:', inDevOnly.join(', ') || '(none)');
  console.log('current peerDeps:', JSON.stringify(pkg.peerDependencies || {}, null, 2));
  console.log('');
}
