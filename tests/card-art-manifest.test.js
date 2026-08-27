'use strict';
const fs=require('fs');
const path=require('path');
const assert=require('assert');
const G=require('../app/src/main/assets/v201.js');

const ROOT=path.resolve(__dirname,'..');
const ART_DIR=path.join(ROOT,'app/src/main/assets/card-art');
const MANIFEST_PATH=path.join(ART_DIR,'manifest.json');
const RENDERER_PATH=path.join(ROOT,'app/src/main/assets/trash-art.js');

const manifest=JSON.parse(fs.readFileSync(MANIFEST_PATH,'utf8'));
const cards=G.collectionCards();
const byId=new Map(cards.map(c=>[Number(c.id),c]));

assert.strictEqual(cards.length,504,'Le catalogue runtime doit contenir exactement 504 cartes.');
assert(Array.isArray(manifest),'Le manifeste card-art doit être un tableau.');

const seenIds=new Set();
const seenFiles=new Set();
for(const entry of manifest){
  assert(Number.isInteger(entry.id),`ID invalide dans le manifeste: ${entry.id}`);
  assert(!seenIds.has(entry.id),`ID dupliqué dans le manifeste: ${entry.id}`);
  seenIds.add(entry.id);

  const card=byId.get(entry.id);
  assert(card,`ID ${entry.id} absent du catalogue runtime.`);
  assert.strictEqual(entry.name,card.name,`Nom incorrect pour l'ID ${entry.id}: manifeste="${entry.name}", runtime="${card.name}".`);

  const expectedFile=`${String(entry.id).padStart(3,'0')}.webp`;
  assert.strictEqual(entry.file,expectedFile,`Nom de fichier incorrect pour l'ID ${entry.id}.`);
  assert(!seenFiles.has(entry.file),`Fichier dupliqué dans le manifeste: ${entry.file}`);
  seenFiles.add(entry.file);

  assert.strictEqual(entry.width,256,`Largeur attendue 256 pour ${entry.file}.`);
  assert.strictEqual(entry.height,256,`Hauteur attendue 256 pour ${entry.file}.`);
  assert.strictEqual(entry.transparent,true,`Le manifeste doit déclarer la transparence pour ${entry.file}.`);
  assert(/^[0-9a-f]{64}$/i.test(entry.sha256||''),`SHA-256 invalide pour ${entry.file}.`);

  const filePath=path.join(ART_DIR,entry.file);
  assert(fs.existsSync(filePath),`Asset absent: ${entry.file}`);
  const bytes=fs.readFileSync(filePath);
  assert(bytes.length>20,`Asset vide ou tronqué: ${entry.file}`);
  assert.strictEqual(bytes.subarray(0,4).toString('ascii'),'RIFF',`${entry.file} n'est pas un conteneur RIFF WebP.`);
  assert.strictEqual(bytes.subarray(8,12).toString('ascii'),'WEBP',`${entry.file} n'est pas un WebP valide.`);
}

const renderer=fs.readFileSync(RENDERER_PATH,'utf8');
const match=renderer.match(/GENERATED_IDS=new Set\(\[([^\]]*)\]\)/);
assert(match,'Impossible de trouver GENERATED_IDS dans trash-art.js.');
const renderedIds=match[1].split(',').map(x=>x.trim()).filter(Boolean).map(Number);
assert.deepStrictEqual(renderedIds,[...seenIds],`Les IDs activés dans le renderer doivent correspondre exactement au manifeste.`);

const orphanWebps=fs.readdirSync(ART_DIR).filter(x=>/^\d{3,4}\.webp$/.test(x)&&!seenFiles.has(x));
assert.deepStrictEqual(orphanWebps,[],`Assets WebP présents mais absents du manifeste: ${orphanWebps.join(', ')}`);

console.log(`card-art manifest OK: ${manifest.length}/504 assets intégrés, prochain ID attendu: ${manifest.length<500?String(manifest.length+1).padStart(3,'0'):'déchets 1001-1004'}`);
