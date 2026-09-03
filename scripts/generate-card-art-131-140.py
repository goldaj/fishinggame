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
# 131 Poisson-chat noir
save(131,tint(ART/'130.webp','#151716','#4e4638',.12,.45))
# 132 Black-bass grande bouche
im=tint(ART/'021.webp','#334638','#91a16f',.16,.72);clip(im,lambda d:d.line([(50,126),(205,131)],fill=(30,42,30,190),width=7));save(132,im)
# 133 Black-bass petite bouche
im=tint(ART/'021.webp','#4b4534','#b19a70',.16,.78)
def bars(d):
 for x in range(85,185,22):d.line([(x,92),(x+5,151)],fill=(55,45,35,150),width=5)
clip(im,bars);save(133,im)
# 134 Perche soleil
im=tint(ART/'038.webp','#1f5355','#d98a4b',.12,1.15)
def sun(d):
 d.ellipse((50,105,63,118),fill=(16,20,20,240));d.ellipse((54,108,61,115),fill=(220,65,35,255))
 for off in range(4):d.arc((35+off*2,88+off*5,100+off*5,150+off*3),190,310,fill=(40,170,190,180),width=3)
clip(im,sun);save(134,im)
# 135 Crapet arlequin
im=tint(ART/'038.webp','#284f55','#a6a56d',.12,1.05);clip(im,lambda d:[d.arc((35+i*8,88+i*4,110+i*5,148+i*2),195,315,fill=(45,150,175,170),width=3) for i in range(4)]);save(135,im)
# 136 Crapet de roche
im=tint(ART/'038.webp','#3c3b2f','#8b7751',.15,.75);randspots(im,136,24,(55,90,200,160),(45,40,30,130),(2,4));clip(im,lambda d:d.ellipse((45,108,54,117),fill=(180,45,35,220)));save(136,im)
# 137 Achigan tacheté
im=tint(ART/'021.webp','#32483a','#8f9a73',.14,.72)
def sp(d):
 d.line([(55,128),(200,132)],fill=(35,45,35,130),width=5)
 for x,y in [(85,137),(100,133),(115,140),(130,135),(145,139),(160,134),(176,138)]:d.ellipse((x-3,y-3,x+3,y+3),fill=(25,35,25,190))
clip(im,sp);save(137,im)
# 138 Maskinongé
im=tint(ART/'033.webp','#596a59','#b5b79b',.12,.55)
def musk(d):
 for x in range(85,195,20):d.line([(x,92),(x+8,150)],fill=(45,60,45,150),width=6)
clip(im,musk);save(138,im)
# 139 Grand brochet du Nord
im=tint(ART/'033.webp','#36543e','#87966d',.16,.75);randspots(im,139,34,(70,85,205,150),(205,205,155,170),(2,4));save(139,im)
# 140 Doré jaune
save(140,tint(ART/'034.webp','#42493e','#c3a663',.16,.82))
names=['Poisson-chat noir','Black-bass à grande bouche','Black-bass à petite bouche','Perche soleil','Crapet arlequin','Crapet de roche','Achigan tacheté','Maskinongé','Grand brochet du Nord','Doré jaune']
manifest=json.loads((ART/'manifest.json').read_text());manifest=[e for e in manifest if not 131<=e['id']<=140]
for id_,name in zip(range(131,141),names):
 p=ART/f'{id_:03}.webp';b=p.read_bytes();
 if b[:4]!=b'RIFF' or b[8:12]!=b'WEBP':raise RuntimeError(f'{p.name} invalide')
 manifest.append({'id':id_,'name':name,'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:e['id']);(ART/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
trash=ROOT/'app/src/main/assets/trash-art.js';s=trash.read_text();ids=','.join(str(i) for i in range(1,141));trash.write_text(re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f'GENERATED_IDS=new Set([{ids}])',s))
(ART/'queue-131-140.json').unlink(missing_ok=True)
Q=[
(141,'Doré noir','Percidé réel gris olive à argenté, grands yeux, flancs plus sombres que le doré jaune et dorsale épineuse, sujet entier isolé sans texte ni décor, style schématique existant.'),
(142,'Truite lacustre','Grande truite réelle gris argenté à olive, silhouette robuste et nombreuses taches pâles sur le dos et les flancs, sujet entier isolé sans texte ni décor, style schématique existant.'),
(143,'Truite brune','Truite réelle brun doré, points noirs et rouges cerclés de clair sur les flancs, sujet entier isolé sans texte ni décor, style schématique existant.'),
(144,'Truite dorée','Truite réelle jaune doré éclatant, bande latérale rouge-orangé et petites taches sombres, sujet entier isolé sans texte ni décor, style schématique existant.'),
(145,'Saumon chinook','Grand saumon réel argenté bleu-vert, dos sombre moucheté et puissante silhouette, sujet entier isolé sans texte ni décor, style schématique existant.'),
(146,'Saumon coho','Saumon réel argenté, dos bleu sombre, flancs légèrement rosés et petites taches noires sur le dos, sujet entier isolé sans texte ni décor, style schématique existant.'),
(147,'Saumon sockeye','Saumon réel en robe nuptiale rouge vif, tête vert olive et corps robuste, sujet entier isolé sans texte ni décor, style schématique existant.'),
(148,'Saumon keta','Saumon réel argenté à olive avec larges marbrures verticales pourpres et vertes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(149,'Saumon rose','Saumon réel argenté rosé, dos bleu-gris moucheté et légère bosse dorsale caractéristique, sujet entier isolé sans texte ni décor, style schématique existant.'),
(150,'Saumon masu','Saumon réel argenté, dos bleu-vert et petites taches sombres avec reflets rosés, sujet entier isolé sans texte ni décor, style schématique existant.')]
(ART/'queue-141-150.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03}.webp','status':'generation-pending','reference':r} for i,n,r in Q],ensure_ascii=False,indent=2))
for p in [Path(__file__),ROOT/'.github/workflows/generate-card-art-131-140.yml']:
 if p.exists():p.unlink()
print('generated 131-140; manifest',len(manifest))
