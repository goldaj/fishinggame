from PIL import Image, ImageDraw
from pathlib import Path
import hashlib,json,re,math
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; REN=ROOT/'app/src/main/assets/trash-art.js'
N={161:'Alligator gar',162:'Lépisosté osseux',163:'Amie calva',164:'Poisson-castor',165:'Pacu noir',166:'Piranha rouge',167:'Piranha noir',168:'Arapaïma',169:'Arowana argenté',170:'Arowana asiatique'}
NEXT=[
(171,'Tambaqui','Grand characidé réel au corps haut gris sombre, ventre plus clair et nageoires puissantes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(172,'Poisson-tigre goliath','Très grand poisson-tigre africain argenté, corps puissant, grandes dents triangulaires visibles et nageoires rougeâtres, sujet entier isolé sans texte ni décor, style schématique existant.'),
(173,'Poisson-tigre africain','Poisson-tigre réel argenté et fusiforme, mâchoire dentée, bandes sombres discrètes et nageoires rouge-orangé, sujet entier isolé sans texte ni décor, style schématique existant.'),
(174,'Perche du Nil','Grande perche réelle argentée-olive, corps massif, grosse bouche et deux nageoires dorsales, sujet entier isolé sans texte ni décor, style schématique existant.'),
(175,'Tilapia du Nil','Tilapia réel gris-olive au corps haut comprimé, nageoire dorsale épineuse et bandes verticales discrètes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(176,'Tilapia bleu','Tilapia réel bleu-gris au corps haut, reflets turquoise et longue nageoire dorsale, sujet entier isolé sans texte ni décor, style schématique existant.'),
(177,'Poisson-éléphant','Poisson africain réel brun sombre, corps comprimé et museau inférieur allongé en petite trompe, sujet entier isolé sans texte ni décor, style schématique existant.'),
(178,'Polyptère du Sénégal','Polyptère réel allongé gris-olive, nombreux petits ailerons dorsaux séparés et nageoires pectorales charnues, sujet entier isolé sans texte ni décor, style schématique existant.'),
(179,'Polyptère orné','Polyptère réel sombre à motifs jaunes réticulés, corps allongé et série d’ailerons dorsaux, sujet entier isolé sans texte ni décor, style schématique existant.'),
(180,'Poisson-couteau clown','Poisson-couteau réel très comprimé argenté, dos arqué, longue nageoire anale et grandes taches rondes noires sur le flanc, sujet entier isolé sans texte ni décor, style schématique existant.')]

def canvas(): return Image.new('RGBA',(256,256),(0,0,0,0))
def save(i,im): im.save(ART/f'{i:03d}.webp','WEBP',quality=82,method=6)
def gar(col,snout,spots=False):
 im=canvas(); d=ImageDraw.Draw(im,'RGBA'); cy=130
 d.ellipse((48,103,209,157),fill=col+(255,),outline=(29,35,33,255),width=3); tip=12 if snout>45 else 22
 d.polygon([(64,113),(tip,124),(64,142)],fill=col+(255,),outline=(29,35,33,255)); d.polygon([(200,114),(239,95),(225,129),(241,152),(201,146)],fill=col+(255,),outline=(29,35,33,255))
 d.polygon([(145,105),(162,83),(176,106)],fill=col+(245,),outline=(29,35,33,255)); d.polygon([(120,154),(139,176),(155,153)],fill=col+(235,),outline=(29,35,33,255)); d.ellipse((49,119,57,127),fill=(245,202,65,255),outline=(15,15,15,255),width=2)
 d.line((tip+2,132,63,132),fill=(55,42,35,230),width=2)
 if spots:
  for x in range(82,196,18):
   for y in (116,135,145): d.ellipse((x,y,x+5,y+4),fill=(45,48,36,160))
 return im
def robust(col,long_dorsal=False):
 im=canvas(); d=ImageDraw.Draw(im,'RGBA'); d.ellipse((36,92,207,169),fill=col+(255,),outline=(27,31,30,255),width=3); d.polygon([(199,107),(239,82),(225,130),(241,167),(200,151)],fill=col+(255,),outline=(27,31,30,255))
 if long_dorsal: d.polygon([(78,97),(95,68),(177,76),(190,101)],fill=col+(240,),outline=(27,31,30,255))
 else: d.polygon([(125,96),(148,70),(172,98)],fill=col+(240,),outline=(27,31,30,255))
 d.polygon([(94,158),(118,188),(145,160)],fill=col+(230,),outline=(27,31,30,255)); d.ellipse((55,113,65,123),fill=(245,200,65,255),outline=(10,10,10,255),width=2); d.arc((38,118,82,148),15,105,fill=(30,25,25,220),width=3); return im
def tall(col,belly=None,teeth=False):
 im=canvas(); d=ImageDraw.Draw(im,'RGBA'); d.ellipse((49,69,199,183),fill=col+(255,),outline=(24,27,29,255),width=3); d.polygon([(187,93),(236,72),(217,127),(238,177),(187,158)],fill=col+(255,),outline=(24,27,29,255)); d.polygon([(110,79),(135,50),(164,79)],fill=col+(240,),outline=(24,27,29,255)); d.polygon([(94,171),(120,202),(145,172)],fill=col+(235,),outline=(24,27,29,255))
 if belly: d.ellipse((59,127,184,176),fill=belly+(150,))
 d.ellipse((70,103,81,114),fill=(245,202,62,255),outline=(10,10,10,255),width=2); d.arc((49,114,91,151),10,100,fill=(25,20,20,230),width=3)
 if teeth:
  for k in range(4): d.polygon([(57+k*6,135),(60+k*6,143),(63+k*6,135)],fill=(245,245,230,255))
 return im
def arapaima():
 im=canvas(); d=ImageDraw.Draw(im,'RGBA'); body=(82,100,91,255); d.ellipse((22,101,211,156),fill=body,outline=(30,35,32,255),width=3); d.polygon([(201,110),(242,88),(226,128),(243,163),(202,148)],fill=(147,61,45,255),outline=(30,35,32,255))
 d.polygon([(137,103),(197,84),(205,107)],fill=(91,106,92,245)); d.polygon([(135,155),(200,176),(203,150)],fill=(130,58,48,230)); d.ellipse((40,117,49,126),fill=(235,190,62,255),outline=(10,10,10,255),width=2)
 for x in range(65,193,16):
  for y in (116,132,145): d.ellipse((x,y,x+9,y+7),outline=(176,112,75,150),width=2)
 return im
def arowana(col,gold=False):
 im=canvas(); d=ImageDraw.Draw(im,'RGBA'); d.ellipse((28,105,214,152),fill=col+(255,),outline=(26,31,35,255),width=3); d.polygon([(206,113),(240,91),(228,129),(241,160),(205,145)],fill=col+(255,),outline=(26,31,35,255)); d.polygon([(92,107),(187,86),(206,108)],fill=col+(235,),outline=(26,31,35,255)); d.polygon([(88,150),(190,171),(207,146)],fill=col+(235,),outline=(26,31,35,255)); d.polygon([(29,118),(11,104),(28,137),(55,139)],fill=col+(255,),outline=(26,31,35,255)); d.ellipse((40,117,48,125),fill=(245,203,66,255),outline=(10,10,10,255),width=2); d.line((22,126,8,120),fill=(55,45,36,230),width=2); d.line((24,130,9,133),fill=(55,45,36,230),width=2)
 for x in range(65,194,20):
  for y in (119,135): d.ellipse((x,y,x+10,y+8),outline=((235,176,65,150) if gold else (220,235,245,130)),width=2)
 return im
save(161,gar((74,96,54),54,True)); save(162,gar((111,101,64),62,False)); save(163,robust((86,105,67),True)); save(164,robust((99,91,59),True)); save(165,tall((52,58,61))); save(166,tall((135,144,139),(220,63,45),True)); save(167,tall((46,49,52),None,True)); save(168,arapaima()); save(169,arowana((165,185,196),False)); save(170,arowana((171,112,51),True))
manifest=json.loads(MAN.read_text('utf-8')); manifest=[e for e in manifest if not 161<=int(e['id'])<=170]
for i in range(161,171):
 p=ART/f'{i:03d}.webp'; b=p.read_bytes(); im=Image.open(p); assert im.size==(256,256); manifest.append({'id':i,'name':N[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:int(e['id'])); MAN.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n','utf-8')
r=REN.read_text('utf-8'); r=re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f"GENERATED_IDS=new Set([{','.join(str(i) for i in range(1,171))}])",r); REN.write_text(r,'utf-8')
q=ART/'queue-161-170.json'; q.unlink(missing_ok=True); (ART/'queue-171-180.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':ref} for i,n,ref in NEXT],ensure_ascii=False,indent=2)+'\n','utf-8')
print('generated/finalized 161-170')
