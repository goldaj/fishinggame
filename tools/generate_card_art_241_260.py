from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'app/src/main/assets/card-art'; MANIFEST=ART/'manifest.json'; QUEUE=ART/'queue-241-250.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'
OUT=(25,33,38,255)

def poly(d,pts,fill,w=4): d.polygon(pts,fill=fill); d.line(pts+[pts[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-5,y-5,x+5,y+5),fill=(245,205,60,255),outline=OUT,width=2); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def fish(body=(150,160,165,255),tail=None,long=True,tall=False,dorsals=1,barbel=False):
    tail=tail or body; im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
    box=(32,104,194,152) if long else ((44,72,188,182) if tall else (38,90,190,166)); x0,y0,x1,y1=box; cy=(y0+y1)//2
    poly(d,[(x1-4,cy),(233,99 if long else 92),(221,cy),(233,157 if long else 164)],tail)
    d.ellipse(box,fill=body,outline=OUT,width=5)
    for k in range(dorsals):
        sx=78+k*38; poly(d,[(sx,y0+2),(sx+17,y0-17),(sx+31,y0+2)],body,3)
    eye(d,57,cy-8); d.line((34,cy+8,21,cy+8),fill=OUT,width=4)
    if barbel: d.line((43,cy+13,19,cy+27),fill=OUT,width=2)
    return im,d,box

def save(i,im):
    p=ART/f'{i:03d}.webp'; im.save(p,'WEBP',quality=88,method=6); return hashlib.sha256(p.read_bytes()).hexdigest()

spec={}
# 241 amberjack limon
im,d,b=fish((167,184,181,255),(210,191,74,255)); d.line((58,118,185,118),fill=(224,196,70,255),width=6); spec[241]=im
# 242-244 horse mackerels
for i,body,accent in [(242,(160,180,193,255),(55,95,120,255)),(243,(151,177,184,255),(52,105,91,255)),(244,(171,186,176,255),(224,197,64,255))]:
    im,d,b=fish(body,accent); d.line((68,130,185,130),fill=accent,width=4); [d.ellipse((x-2,126,x+2,130),fill=OUT) for x in range(90,181,15)]; spec[i]=im
# 245 maigre
im,d,b=fish((150,158,160,255),(125,135,145,255)); d.line((70,136,180,136),fill=(95,105,110,255),width=3); spec[245]=im
# 246 ombrine
im,d,b=fish((176,148,91,255),(152,128,82,255),barbel=True); d.line((67,119,183,119),fill=(207,177,104,255),width=3); spec[246]=im
# 247 corb
im,d,b=fish((62,58,50,255),(55,52,48,255),long=False,tall=True); poly(d,[(95,145),(111,196),(126,151)],(50,47,43,255),3); spec[247]=im
# 248-249 mostelles
for i,body in [(248,(142,82,64,255)),(249,(197,187,159,255))]:
    im,d,b=fish(body,body,long=True,dorsals=2,barbel=True); d.line((72,138,176,138),fill=(93,78,66,255),width=3); spec[i]=im
# 250 capelan
im,d,b=fish((170,185,178,255),(145,164,161,255)); d.line((68,118,184,118),fill=(88,116,91,255),width=3); spec[250]=im
# 251 sprat
im,d,b=fish((190,196,190,255),(160,176,182,255)); d.line((65,122,183,122),fill=(87,120,155,255),width=3); spec[251]=im
# 252-253 herrings
for i,back in [(252,(62,105,143,255)),(253,(72,120,126,255))]:
    im,d,b=fish((190,197,190,255),(155,174,180,255)); d.polygon([(39,116),(68,104),(188,104),(188,124),(67,124)],fill=back); d.ellipse((39,104,190,152),outline=OUT,width=5); spec[i]=im
# 254-256 hakes: elongated pale gadids, two dorsals
for i,body,back in [(254,(183,187,180,255),(88,101,101,255)),(255,(201,205,198,255),(115,127,131,255)),(256,(171,178,171,255),(75,89,91,255))]:
    im,d,b=fish(body,body,long=True,dorsals=2); d.line((68,116,183,116),fill=back,width=5); d.line((31,137,48,137),fill=OUT,width=5); spec[i]=im
# 257 pollock
im,d,b=fish((123,142,147,255),(111,130,137,255),long=True,dorsals=3); d.line((60,135,180,135),fill=(72,94,98,255),width=4); spec[257]=im
# 258 haddock
im,d,b=fish((185,192,188,255),(150,164,169,255),long=True,dorsals=3); d.line((62,126,181,126),fill=(42,54,58,255),width=5); d.ellipse((92,107,104,119),fill=(42,54,58,255)); spec[258]=im
# 259-260 ling
for i,body,accent in [(259,(127,111,85,255),(83,71,58,255)),(260,(97,120,142,255),(58,76,94,255))]:
    im,d,b=fish(body,body,long=True,dorsals=2,barbel=True); d.line((70,138,183,138),fill=accent,width=4); spec[i]=im

q=json.loads(QUEUE.read_text()); assert [x['id'] for x in q]==list(range(241,251))
names={x['id']:x['name'] for x in q}; names.update({251:'Sprat',252:'Hareng de l’Atlantique',253:'Hareng du Pacifique',254:'Merlu européen',255:'Merlu argenté',256:'Merlu du Cap',257:'Lieu noir',258:'Églefin',259:'Lingue franche',260:'Lingue bleue'})
manifest=json.loads(MANIFEST.read_text()); assert len(manifest)==240 and manifest[-1]['id']==240
for i in range(241,261):
    sha=save(i,spec[i]); manifest.append({'id':i,'name':names[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':sha})
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n')
s=TRASH.read_text(); s=re.sub(r'const GENERATED_IDS=new Set\(\[[^\]]*\]\);','const GENERATED_IDS=new Set(['+','.join(map(str,range(1,261)))+']);',s,count=1); TRASH.write_text(s)
nextq=[
(261,'Brosme','Brosme réel brun-jaune, corps épais de gadidé avec longues nageoires dorsale et anale, sujet entier isolé sans texte ni décor.'),
(262,'Grenadier de roche','Grenadier de roche réel gris-brun, grosse tête et longue queue effilée, sujet entier isolé sans texte ni décor.'),
(263,'Grenadier abyssal','Grenadier abyssal réel sombre, tête massive et queue très fine, sujet entier isolé sans texte ni décor.'),
(264,'Sabre noir','Sabre noir réel noir argenté, corps extrêmement allongé en ruban et grande mâchoire, sujet entier isolé sans texte ni décor.'),
(265,'Sabre argenté','Sabre argenté réel brillant, corps très allongé en ruban argenté, sujet entier isolé sans texte ni décor.'),
(266,'Escolier noir','Escolier noir réel brun-noir, corps allongé puissant avec grandes dorsales, sujet entier isolé sans texte ni décor.'),
(267,'Escolier serpent','Escolier serpent réel noir, corps très long serpentiforme et tête prédatrice, sujet entier isolé sans texte ni décor.'),
(268,'Bonite à ventre rayé','Bonite réelle fuselée bleu acier avec plusieurs rayures sombres sur le ventre, sujet entier isolé sans texte ni décor.'),
(269,'Thonine commune','Thonine réelle fuselée bleu sombre avec petites taches et nageoires courtes, sujet entier isolé sans texte ni décor.'),
(270,'Thon germon','Thon germon réel argenté bleu avec très longues nageoires pectorales, sujet entier isolé sans texte ni décor.'),
]
(ART/'queue-261-270.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':r} for i,n,r in nextq],ensure_ascii=False,indent=2)+'\n')
QUEUE.unlink(); print('generated 241-260 and prepared 261-270')
