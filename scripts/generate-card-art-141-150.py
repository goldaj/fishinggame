from PIL import Image,ImageOps,ImageDraw,ImageEnhance,ImageChops
from pathlib import Path
import hashlib,random,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'
def tint(path,dark,light,orig=.2,sat=.8):
 im=Image.open(path).convert('RGBA');a=im.getchannel('A');rgb=im.convert('RGB');g=ImageOps.grayscale(rgb);c=ImageOps.colorize(g,dark,light).convert('RGB');m=Image.blend(c,rgb,orig);m=ImageEnhance.Color(m).enhance(sat).convert('RGBA');m.putalpha(a);return m
def clip(im,fn):
 ov=Image.new('RGBA',im.size,(0,0,0,0));d=ImageDraw.Draw(ov);fn(d);ov.putalpha(ImageChops.multiply(ov.getchannel('A'),im.getchannel('A')));im.alpha_composite(ov)
def randspots(im,seed,n,box,col,rr=(2,4)):
 rnd=random.Random(seed)
 def fn(d):
  for _ in range(n):
   x=rnd.randint(box[0],box[2]);y=rnd.randint(box[1],box[3]);r=rnd.randint(*rr);d.ellipse((x-r,y-r,x+r,y+r),fill=col)
 clip(im,fn)
def save(i,im):im.save(ART/f'{i:03}.webp','WEBP',lossless=True,method=6)
# 141 Doré noir
save(141,tint(ART/'034.webp','#303738','#8b8a75',.12,.55))
# 142 Truite lacustre
im=tint(ART/'119.webp','#34484a','#9aa89e',.15,.55);randspots(im,142,46,(45,70,205,160),(210,210,180,180),(2,3));save(142,im)
# 143 Truite brune
im=tint(ART/'118.webp','#4b3f2d','#b58c56',.17,.82);randspots(im,143,26,(50,70,205,160),(25,25,23,220),(2,3));randspots(im,1143,12,(65,85,190,155),(165,45,35,215),(2,3));save(143,im)
# 144 Truite dorée
im=tint(ART/'118.webp','#ad682d','#f1c95b',.10,1.05);clip(im,lambda d:d.line([(45,125),(208,132)],fill=(205,65,35,170),width=10));randspots(im,144,20,(60,75,205,150),(40,30,25,180),(2,3));save(144,im)
# 145 Chinook
im=tint(ART/'122.webp','#2e4652','#b5c5c0',.14,.62);randspots(im,145,34,(50,65,210,150),(25,28,30,210),(2,3));save(145,im)
# 146 Coho
im=tint(ART/'122.webp','#365066','#ced5cc',.14,.62);clip(im,lambda d:d.line([(45,128),(210,134)],fill=(190,85,95,85),width=14));randspots(im,146,18,(65,65,205,120),(30,30,32,200),(2,3));save(146,im)
# 147 Sockeye
im=tint(ART/'122.webp','#812f26','#d86748',.10,1.0);clip(im,lambda d:d.ellipse((12,65,78,165),fill=(56,82,57,180)));save(147,im)
# 148 Keta
im=tint(ART/'122.webp','#485c4f','#b7b3a0',.10,.72)
def chum(d):
 for x,col in [(72,(85,55,95,105)),(105,(55,85,65,105)),(138,(90,60,100,105)),(171,(55,90,70,100))]:d.line([(x,82),(x+12,160)],fill=col,width=12)
clip(im,chum);save(148,im)
# 149 Saumon rose
im=tint(ART/'122.webp','#42576a','#c7beb7',.14,.65);clip(im,lambda d:d.line([(55,126),(205,132)],fill=(215,115,135,100),width=12));randspots(im,149,18,(60,65,205,115),(35,35,36,180),(2,3));save(149,im)
# 150 Masu
im=tint(ART/'122.webp','#3c5662','#c2c4b5',.14,.65);clip(im,lambda d:d.line([(60,127),(200,132)],fill=(180,90,100,65),width=10));randspots(im,150,22,(55,70,195,135),(35,35,35,195),(2,3));save(150,im)
names=['Doré noir','Truite lacustre','Truite brune','Truite dorée','Saumon chinook','Saumon coho','Saumon sockeye','Saumon keta','Saumon rose','Saumon masu']
manifest=json.loads((ART/'manifest.json').read_text());manifest=[e for e in manifest if not 141<=e['id']<=150]
for id_,name in zip(range(141,151),names):
 p=ART/f'{id_:03}.webp';b=p.read_bytes();
 if b[:4]!=b'RIFF' or b[8:12]!=b'WEBP':raise RuntimeError(f'{p.name} invalide')
 manifest.append({'id':id_,'name':name,'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:e['id']);(ART/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
trash=ROOT/'app/src/main/assets/trash-art.js';s=trash.read_text();ids=','.join(str(i) for i in range(1,151));trash.write_text(re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f'GENERATED_IDS=new Set([{ids}])',s))
(ART/'queue-141-150.json').unlink(missing_ok=True)
Q=[
(151,'Omble Dolly Varden','Omble réel sombre vert olive, nombreux points clairs et rouges, ventre orangé et liserés blancs aux nageoires, sujet entier isolé sans texte ni décor, style schématique existant.'),
(152,'Omble à tête plate','Grand omble réel gris olive, tête large aplatie, flancs mouchetés de points pâles et ventre clair, sujet entier isolé sans texte ni décor, style schématique existant.'),
(153,'Grand corégone','Grand corégone réel argenté, dos bleu-gris, corps fusiforme et petite bouche avec nageoire adipeuse, sujet entier isolé sans texte ni décor, style schématique existant.'),
(154,'Cisco de lac','Petit corégone réel argenté très élancé, dos bleu-vert et grande fourche caudale, sujet entier isolé sans texte ni décor, style schématique existant.'),
(155,'Esturgeon blanc','Grand esturgeon réel gris clair, cinq rangées de plaques osseuses, museau allongé et queue hétérocerque, sujet entier isolé sans texte ni décor, style schématique existant.'),
(156,'Esturgeon jaune','Esturgeon réel brun jaunâtre à olive, plaques osseuses marquées, museau pointu et barbillons, sujet entier isolé sans texte ni décor, style schématique existant.'),
(157,'Esturgeon sibérien','Esturgeon réel gris brun, corps allongé, plaques latérales claires et museau court, sujet entier isolé sans texte ni décor, style schématique existant.'),
(158,'Esturgeon étoilé','Esturgeon réel très élancé gris sombre, long museau fin et nombreuses petites plaques étoilées claires, sujet entier isolé sans texte ni décor, style schématique existant.'),
(159,'Esturgeon beluga','Très grand esturgeon réel gris argenté, corps massif, tête large et museau court, sujet entier isolé sans texte ni décor, style schématique existant.'),
(160,'Spatulaire','Poisson réel gris argenté, corps de grand poisson d’eau douce et rostre extrêmement long en forme de spatule, sujet entier isolé sans texte ni décor, style schématique existant.')]
(ART/'queue-151-160.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03}.webp','status':'generation-pending','reference':r} for i,n,r in Q],ensure_ascii=False,indent=2))
for p in [Path(__file__),ROOT/'.github/workflows/generate-card-art-141-150.yml']:
 if p.exists():p.unlink()
print('generated 141-150; manifest',len(manifest))
