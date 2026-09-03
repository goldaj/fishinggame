from PIL import Image,ImageOps,ImageDraw,ImageEnhance,ImageChops
from pathlib import Path
import hashlib,random,json,re,os
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'

def tint(path,dark,light,orig=.2,sat=.8):
 im=Image.open(path).convert('RGBA'); a=im.getchannel('A'); rgb=im.convert('RGB'); g=ImageOps.grayscale(rgb); c=ImageOps.colorize(g,dark,light).convert('RGB'); m=Image.blend(c,rgb,orig); m=ImageEnhance.Color(m).enhance(sat).convert('RGBA'); m.putalpha(a); return m

def clipdraw(im,fn):
 ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov); fn(d); ov.putalpha(ImageChops.multiply(ov.getchannel('A'),im.getchannel('A'))); im.alpha_composite(ov)

def spots(im,coords,color=(35,35,30,210),radii=None):
 clipdraw(im,lambda d:[d.ellipse((x-(radii[i] if radii else 3),y-(radii[i] if radii else 3),x+(radii[i] if radii else 3),y+(radii[i] if radii else 3)),fill=color) for i,(x,y) in enumerate(coords)])

def randspots(im,seed,count,box,color=(35,35,30,190),rr=(2,4)):
 rnd=random.Random(seed); pts=[(rnd.randint(box[0],box[2]),rnd.randint(box[1],box[3])) for _ in range(count)]; rs=[rnd.randint(*rr) for _ in pts]; spots(im,pts,color,rs)

def lamprey(id_,dark,light,marine=False,thin=.8):
 im=tint(ART/'030.webp',dark,light,.12,.75)
 if thin!=1:
  h=int(256*thin); z=im.resize((256,h),Image.Resampling.LANCZOS); c=Image.new('RGBA',(256,256),(0,0,0,0)); c.alpha_composite(z,(0,(256-h)//2)); im=c
 ov=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(ov); cy=128
 d.ellipse((10,119,29,138),fill=(83,46,42,255),outline=(30,30,28,255),width=2); d.ellipse((15,124,24,133),fill=(20,18,17,255))
 for i in range(7): d.ellipse((34+i*7,124,37+i*7,127),fill=(30,28,25,220))
 d.ellipse((31,111,36,116),fill=(205,155,65,255),outline=(20,20,20,255),width=1); im.alpha_composite(ov)
 if marine: randspots(im,id_,28,(45,88,220,170),(55,45,38,135),(2,5))
 return im

def save(id_,im): im.save(ART/f'{id_:03}.webp','WEBP',lossless=True,method=6)

# 121 Huchon
im=tint(ART/'119.webp','#30352b','#b58a62',.20,.82); randspots(im,121,42,(50,78,205,160),(35,28,22,215),(2,4)); save(121,im)
# 122 Saumon du Danube
im=tint(ART/'118.webp','#394340','#c1ad91',.14,.68); randspots(im,122,28,(55,70,205,155),(32,32,30,205),(2,3)); save(122,im)
save(123,lamprey(123,'#554b43','#a28b75',True,.88)); save(124,lamprey(124,'#5e615d','#b7aa95',False,.78)); save(125,lamprey(125,'#5e5b43','#a79a70',False,.64))
save(126,tint(ART/'030.webp','#3f4938','#aaa16f',.18,.8)); save(127,tint(ART/'030.webp','#42443e','#9b9584',.16,.65))
im=tint(ART/'116.webp','#45656b','#d4d9d4',.20,.70); spots(im,[(56,109),(68,111),(80,113),(92,115),(104,116)],(25,35,37,230),[5,4,3,3,2]); save(128,im)
im=tint(ART/'117.webp','#526673','#d8d8d2',.18,.62); spots(im,[(62,112)],(25,30,33,235),[6]); save(129,im)
im=tint(ART/'039.webp','#3d372c','#987750',.25,.85); randspots(im,130,18,(70,80,205,155),(45,40,30,100),(2,4)); save(130,im)

names=['Huchon','Saumon du Danube','Lamproie marine','Lamproie fluviatile','Lamproie de Planer','Anguille d’Amérique','Anguille japonaise','Alosa feinte','Grande alose','Poisson-chat commun']
manifest=json.loads((ART/'manifest.json').read_text()); manifest=[e for e in manifest if not 121<=e['id']<=130]
for id_,name in zip(range(121,131),names):
 p=ART/f'{id_:03}.webp'; b=p.read_bytes();
 if b[:4]!=b'RIFF' or b[8:12]!=b'WEBP': raise RuntimeError(f'{p.name} invalide')
 manifest.append({'id':id_,'name':name,'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:e['id']); (ART/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
trash=ROOT/'app/src/main/assets/trash-art.js'; s=trash.read_text(); ids=','.join(str(i) for i in range(1,131)); s=re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f'GENERATED_IDS=new Set([{ids}])',s); trash.write_text(s)
qold=ART/'queue-121-130.json'; qold.unlink(missing_ok=True)
Q=[
(131,'Poisson-chat noir','Poisson-chat réel très sombre, corps trapu noir-brun, tête large et longs barbillons, sujet entier isolé sans texte ni décor, style schématique existant.'),
(132,'Black-bass à grande bouche','Black-bass réel vert olive, large bouche dépassant nettement l’œil et bande latérale sombre irrégulière, sujet entier isolé sans texte ni décor, style schématique existant.'),
(133,'Black-bass à petite bouche','Black-bass réel bronze olive, bouche plus courte et plusieurs bandes verticales sombres sur les flancs, sujet entier isolé sans texte ni décor, style schématique existant.'),
(134,'Perche soleil','Petit centrarchidé réel très coloré, flancs bleu-vert et orange, tache noire et rouge sur l’opercule, sujet entier isolé sans texte ni décor, style schématique existant.'),
(135,'Crapet arlequin','Crapet réel au corps haut bleu-vert, ventre orangé et motifs irisés sur les joues, sujet entier isolé sans texte ni décor, style schématique existant.'),
(136,'Crapet de roche','Crapet réel trapu brun olive moucheté, grand œil rougeâtre et nageoires épineuses, sujet entier isolé sans texte ni décor, style schématique existant.'),
(137,'Achigan tacheté','Achigan réel vert olive, ligne latérale de taches sombres et ventre clair, sujet entier isolé sans texte ni décor, style schématique existant.'),
(138,'Maskinongé','Grand prédateur réel très allongé vert argenté, museau de brochet et barres ou taches verticales sombres, sujet entier isolé sans texte ni décor, style schématique existant.'),
(139,'Grand brochet du Nord','Grand brochet réel long vert olive, nombreuses taches pâles ovales et museau aplati, sujet entier isolé sans texte ni décor, style schématique existant.'),
(140,'Doré jaune','Percidé réel doré olive, grands yeux, bandes sombres diffuses et nageoire dorsale épineuse, sujet entier isolé sans texte ni décor, style schématique existant.')]
(ART/'queue-131-140.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03}.webp','status':'generation-pending','reference':r} for i,n,r in Q],ensure_ascii=False,indent=2))
for p in [Path(__file__),ROOT/'.github/workflows/generate-card-art-121-130.yml']:
 if p.exists(): p.unlink()
print('generated 121-130; manifest',len(manifest))
