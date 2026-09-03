'use strict';
const fs=require('fs');const path=require('path');const crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');const ART=path.join(ROOT,'app/src/main/assets/card-art');
const manifestPath=path.join(ART,'manifest.json');const trashPath=path.join(ROOT,'app/src/main/assets/trash-art.js');
const cards=[
[111,'Spirlin'],[112,'Ide mélanote'],[113,'Aspe'],[114,'Apron du Rhône'],[115,'Ombre commun'],[116,'Corégone lavaret'],[117,'Corégone blanc'],[118,'Truite arc-en-ciel'],[119,'Omble chevalier'],[120,'Omble de fontaine']];
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8')).filter(e=>e.id<111||e.id>120);
for(const [id,name] of cards){const file=`${String(id).padStart(3,'0')}.webp`;const p=path.join(ART,file);const b=fs.readFileSync(p);if(b.subarray(0,4).toString('ascii')!=='RIFF'||b.subarray(8,12).toString('ascii')!=='WEBP')throw new Error(`${file} invalide`);manifest.push({id,name,file,width:256,height:256,transparent:true,sha256:crypto.createHash('sha256').update(b).digest('hex')});}
manifest.sort((a,b)=>a.id-b.id);fs.writeFileSync(manifestPath,JSON.stringify(manifest));
let trash=fs.readFileSync(trashPath,'utf8');trash=trash.replace(/GENERATED_IDS=new Set\(\[[^\]]*\]\)/,`GENERATED_IDS=new Set([${Array.from({length:120},(_,i)=>i+1).join(',')}])`);fs.writeFileSync(trashPath,trash);
const oldQ=path.join(ART,'queue-111-120.json');if(fs.existsSync(oldQ))fs.unlinkSync(oldQ);
const q=[
[121,'Huchon','Grand salmonidé réel massif, corps brun-olive à cuivré, taches sombres irrégulières et grande tête, sujet entier isolé sans texte ni décor, style schématique existant.'],
[122,'Saumon du Danube','Grand salmonidé réel robuste argenté-brun, dos sombre, flancs légèrement cuivrés et petites taches noires, sujet entier isolé sans texte ni décor, style schématique existant.'],
[123,'Lamproie marine','Lamproie réelle allongée gris-brun marbré, bouche ronde en ventouse bien visible et absence de nageoires paires, sujet entier isolé sans texte ni décor, style schématique existant.'],
[124,'Lamproie fluviatile','Lamproie réelle élancée gris argenté à brun, corps lisse et bouche circulaire en ventouse, sujet entier isolé sans texte ni décor, style schématique existant.'],
[125,'Lamproie de Planer','Petite lamproie réelle fine brun-olive, ventre plus clair et bouche en ventouse discrète, sujet entier isolé sans texte ni décor, style schématique existant.'],
[126,'Anguille d’Amérique','Anguille réelle très allongée brun-olive, ventre jaunâtre et nageoire continue autour de la queue, sujet entier isolé sans texte ni décor, style schématique existant.'],
[127,'Anguille japonaise','Anguille réelle allongée gris-brun à olive, ventre clair et silhouette serpentine lisse, sujet entier isolé sans texte ni décor, style schématique existant.'],
[128,'Alosa feinte','Alose réelle argentée au corps comprimé, dos bleu-vert et série de petites taches sombres derrière l’opercule, sujet entier isolé sans texte ni décor, style schématique existant.'],
[129,'Grande alose','Grande alose réelle argentée, corps haut et comprimé, dos bleu-gris et une grosse tache sombre derrière l’opercule, sujet entier isolé sans texte ni décor, style schématique existant.'],
[130,'Poisson-chat commun','Petit poisson-chat réel brun sombre, tête large, plusieurs longs barbillons et nageoires robustes, sujet entier isolé sans texte ni décor, style schématique existant.']];
fs.writeFileSync(path.join(ART,'queue-121-130.json'),JSON.stringify(q.map(([id,name,reference])=>({id,name,file:`${String(id).padStart(3,'0')}.webp`,status:'generation-pending',reference})),null,2));
for(const p of [__filename,path.join(ROOT,'.github/workflows/finalize-card-art-111-120.yml')])if(fs.existsSync(p))fs.unlinkSync(p);
console.log('Finalized card art 111-120; manifest=',manifest.length);
