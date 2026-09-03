from PIL import Image,ImageDraw
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; REN=ROOT/'app/src/main/assets/trash-art.js'
N={181:'Poisson-couteau noir',182:'Gourami géant',183:'Gourami perlé',184:'Gourami bleu',185:'Combattant du Siam',186:'Poisson paradis',187:'Barbus cerise',188:'Barbus tigre',189:'Danio rerio',190:'Rasbora arlequin'}
NEXT=[
(191,'Néon bleu','Petit tétra réel argenté avec bande horizontale bleu électrique et zone rouge postérieure, sujet entier isolé sans texte ni décor, style schématique existant.'),
(192,'Cardinalis','Petit tétra réel au dos bleu irisé et large bande rouge sur toute la moitié inférieure du corps, sujet entier isolé sans texte ni décor, style schématique existant.'),
(193,'Tétra empereur','Tétra réel argenté-violet, bande latérale noire, reflets bleus et nageoires élégantes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(194,'Tétra citron','Petit tétra réel jaune citron translucide, iris rouge et nageoires jaunes à noires, sujet entier isolé sans texte ni décor, style schématique existant.'),
(195,'Tétra fantôme noir','Petit tétra réel gris argenté, grande tache noire derrière l’opercule et nageoires sombres, sujet entier isolé sans texte ni décor, style schématique existant.'),
(196,'Tétra du Congo','Tétra réel irisé bleu-orangé, corps comprimé et nageoires allongées aux bords clairs, sujet entier isolé sans texte ni décor, style schématique existant.'),
(197,'Discus','Discus réel presque circulaire, corps haut et comprimé avec bandes verticales et couleurs chaudes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(198,'Scalaire','Scalaire réel très haut et comprimé, longues nageoires triangulaires et bandes verticales sombres, sujet entier isolé sans texte ni décor, style schématique existant.'),
(199,'Oscar','Grand cichlidé réel sombre, corps massif, motifs orange-rouge irréguliers et grosse tête, sujet entier isolé sans texte ni décor, style schématique existant.'),
(200,'Cichlidé jaguar','Cichlidé réel argenté-brun couvert de taches noires irrégulières rappelant un jaguar, sujet entier isolé sans texte ni décor, style schématique existant.')]
def C(): return Image.new('RGBA',(256,256),(0,0,0,0))
def save(i,im): im.save(ART/f'{i:03d}.webp','WEBP',quality=82,method=6)
def fish(col=(120,130,130),tall=False,long=False):
 im=C(); d=ImageDraw.Draw(im,'RGBA'); box=(42,80 if tall else 101,199,180 if tall else 157); d.ellipse(box,fill=col+(255,),outline=(25,28,30,255),width=3); d.polygon([(190,100),(236,78),(216,130),(239,177),(191,156)],fill=col+(255,),outline=(25,28,30,255)); d.polygon([(100,box[1]+4),(126,box[1]-30),(159,box[1]+4)],fill=col+(240,),outline=(25,28,30,255)); d.ellipse((62,111,72,121),fill=(244,200,62,255),outline=(10,10,10,255),width=2); return im
def knife():
 im=C();d=ImageDraw.Draw(im,'RGBA'); d.ellipse((42,65,205,187),fill=(31,34,38,255),outline=(10,12,14,255),width=3);d.polygon([(197,88),(236,105),(214,135),(236,164),(197,166)],fill=(27,30,34,255),outline=(10,12,14,255));d.polygon([(64,169),(194,201),(209,157),(70,153)],fill=(42,45,48,245),outline=(10,12,14,255));d.ellipse((62,105,71,114),fill=(240,194,60,255)); return im
def gourami(base,pearls=False,spots=False):
 im=fish(base,True); d=ImageDraw.Draw(im,'RGBA'); d.line((92,166,80,220),fill=base+(220,),width=3); d.line((107,168,106,224),fill=base+(220,),width=3)
 if pearls:
  for x in range(78,180,18):
   for y in range(102,160,17): d.ellipse((x,y,x+4,y+4),fill=(236,236,215,220))
 if spots:
  for x,y in ((126,129),(171,130)): d.ellipse((x-7,y-7,x+7,y+7),fill=(38,43,48,190))
 return im
def betta():
 im=C();d=ImageDraw.Draw(im,'RGBA');col=(60,92,164,255);d.ellipse((62,110,154,150),fill=col,outline=(24,25,35,255),width=3);d.polygon([(145,113),(222,72),(188,128),(224,184),(145,148)],fill=(190,48,67,225),outline=(24,25,35,255));d.polygon([(98,112),(125,63),(150,111)],fill=(68,118,200,225),outline=(24,25,35,255));d.polygon([(96,146),(120,202),(153,148)],fill=(199,54,71,220),outline=(24,25,35,255));d.ellipse((73,120,81,128),fill=(244,201,64,255));return im
def paradise():
 im=fish((90,139,173),False);d=ImageDraw.Draw(im,'RGBA');
 for x in range(80,180,20): d.line((x,108,x-5,150),fill=(191,53,55,170),width=5)
 d.polygon([(192,108),(239,69),(216,131),(239,188),(191,151)],fill=(62,112,168,230),outline=(25,28,30,255));return im
def barb(col,bands=False):
 im=fish(col,False);d=ImageDraw.Draw(im,'RGBA');
 if bands:
  for x in (84,113,147,178): d.line((x,106,x-6,151),fill=(29,29,31,220),width=7)
 return im
def danio():
 im=fish((168,184,189),False);d=ImageDraw.Draw(im,'RGBA');
 for y in (116,128,140): d.line((71,y,188,y),fill=(41,85,128,220),width=4)
 return im
def rasbora():
 im=fish((188,131,72),False);d=ImageDraw.Draw(im,'RGBA');d.polygon([(135,111),(188,126),(138,151)],fill=(24,27,29,230));return im
save(181,knife());save(182,gourami((108,116,84)));save(183,gourami((132,146,139),True,False));save(184,gourami((91,140,176),False,True));save(185,betta());save(186,paradise());save(187,barb((161,61,57)));save(188,barb((196,129,55),True));save(189,danio());save(190,rasbora())
manifest=json.loads(MAN.read_text('utf-8'));manifest=[e for e in manifest if not 181<=int(e['id'])<=190]
for i in range(181,191):
 p=ART/f'{i:03d}.webp';b=p.read_bytes();im=Image.open(p);assert im.size==(256,256);manifest.append({'id':i,'name':N[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:int(e['id']));MAN.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n','utf-8');r=REN.read_text('utf-8');r=re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f"GENERATED_IDS=new Set([{','.join(str(i) for i in range(1,191))}])",r);REN.write_text(r,'utf-8');(ART/'queue-181-190.json').unlink(missing_ok=True);(ART/'queue-191-200.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':ref} for i,n,ref in NEXT],ensure_ascii=False,indent=2)+'\n','utf-8');print('generated/finalized 181-190')
