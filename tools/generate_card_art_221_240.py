from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'app/src/main/assets/card-art'; MANIFEST=ART/'manifest.json'; QUEUE=ART/'queue-221-230.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'
OUT=(25,33,38,255)

def poly(d,pts,fill,w=4): d.polygon(pts,fill=fill); d.line(pts+[pts[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-6,y-6,x+6,y+6),fill=(245,205,60,255),outline=OUT,width=2); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)

def fish(body=(150,150,145,255),tail=None,long=False,tall=False,head='normal',dorsals=1,pectoral=None):
    tail=tail or body; im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
    box=(34,103,194,153) if long else ((45,70,188,184) if tall else (38,88,190,168))
    x0,y0,x1,y1=box; cy=(y0+y1)//2
    poly(d,[(x1-4,cy),(232,96 if not tall else 82),(222,cy),(232,160 if not tall else 176)],tail)
    d.ellipse(box,fill=body,outline=OUT,width=5)
    if head=='big': d.ellipse((28,y0+4,92,y1-4),fill=body,outline=OUT,width=4)
    for k in range(dorsals):
        sx=76+k*39; poly(d,[(sx,y0+3),(sx+18,y0-20),(sx+34,y0+3)],body,3)
    if pectoral:
        poly(d,[(88,cy+8),(122,cy+44),(150,cy+12)],pectoral,3)
    eye(d,58,cy-8); d.line((36,cy+9,22,cy+9),fill=OUT,width=4)
    return im,d,box

def barbel(d,cy): d.line((43,cy+12,18,cy+25),fill=OUT,width=2); d.line((45,cy+14,24,cy+34),fill=OUT,width=2)
def save(i,im):
    p=ART/f'{i:03d}.webp'; im.save(p,'WEBP',quality=88,method=6); return hashlib.sha256(p.read_bytes()).hexdigest()

spec={}
# 221 Pleco common
im,d,b=fish((104,87,63,255),long=True,head='big');
for x in range(70,175,18): d.line((x,109,x-5,148),fill=(67,59,49,255),width=3)
d.ellipse((32,125,49,139),outline=OUT,width=3); spec[221]=im
# 222 Ancistrus
im,d,b=fish((52,58,55,255),long=True,head='big');
for x,y in [(75,115),(95,136),(121,116),(147,139),(167,120)]: d.ellipse((x-3,y-3,x+3,y+3),fill=(210,205,170,255))
for ang in [-18,-9,0,9,18]: d.line((35,120,19+ang//2,100+abs(ang)),fill=OUT,width=2)
spec[222]=im
# 223 striped catfish
im,d,b=fish((175,190,198,255),long=True); barbel(d,128)
d.line((60,116,181,116),fill=(45,60,75,255),width=5); d.line((62,135,181,135),fill=(45,60,75,255),width=4); spec[223]=im
# 224 electric catfish
im,d,b=fish((121,108,87,255),tall=True,dorsals=0); barbel(d,127); spec[224]=im
# 225 African dogfish
im,d,b=fish((91,105,72,255),long=True,dorsals=1)
d.line((28,134,48,139),fill=OUT,width=5); [d.line((31+i*5,134,34+i*5,129),fill=(245,245,225,255),width=2) for i in range(4)]; spec[225]=im
# 226 Tacaud
im,d,b=fish((151,122,83,255),long=True,dorsals=3); barbel(d,128); d.line((70,138,170,138),fill=(95,75,55,255),width=3); spec[226]=im
# Gurnards 227-229
for i,body,pec in [(227,(205,82,51,255),(225,104,63,255)),(228,(213,103,85,255),(50,135,165,255)),(229,(126,119,105,255),(150,135,110,255))]:
    im,d,b=fish(body,long=True,head='big',pectoral=pec); poly(d,[(87,128),(115,174),(154,140)],pec,3); spec[i]=im
# Weevers 230-231
for i,body,dark in [(230,(170,151,103,255),(45,44,38,255)),(231,(188,163,105,255),(30,30,28,255))]:
    im,d,b=fish(body,long=True,dorsals=2); poly(d,[(78,106),(90,82),(104,106)],dark,3); d.line((80,142,175,142),fill=(115,100,75,255),width=3); spec[i]=im
# Sea bream family
im,d,b=fish((180,184,175,255),tall=True); [d.line((x,84,x,170),fill=(80,82,78,255),width=4) for x in [85,113,141]]; spec[232]=im
im,d,b=fish((190,190,180,255),tall=True); d.ellipse((46,83,86,128),fill=(38,41,42,255)); spec[233]=im
im,d,b=fish((170,175,168,255),tall=True); d.line((52,126,178,126),fill=(67,70,68,255),width=7); spec[234]=im
im,d,b=fish((195,122,95,255),tall=True); d.line((64,102,176,102),fill=(225,167,95,255),width=4); spec[235]=im
im,d,b=fish((193,176,130,255),tall=True); d.line((70,142,176,142),fill=(218,138,75,255),width=4); spec[236]=im
im,d,b=fish((183,160,117,255),tall=True); d.ellipse((151,108,171,130),fill=(225,110,60,255)); spec[237]=im
im,d,b=fish((214,156,166,255),tall=True); d.line((70,110,178,110),fill=(238,190,190,255),width=4); spec[238]=im
im,d,b=fish((182,182,170,255),tall=True,head='big'); d.line((31,132,52,136),fill=OUT,width=5); spec[239]=im
# Amberjack
im,d,b=fish((156,176,173,255),long=True); d.line((58,119,185,119),fill=(224,188,55,255),width=6); d.polygon([(87,106),(110,82),(134,106)],fill=(224,188,55,255)); spec[240]=im

q=json.loads(QUEUE.read_text()); assert [x['id'] for x in q]==list(range(221,231))
names={x['id']:x['name'] for x in q}; names.update({231:'Grande vive',232:'Sar commun',233:'Sar à tête noire',234:'Sar tambour',235:'Pagre commun',236:'Pageot commun',237:'Pageot acarné',238:'Daurade rose',239:'Denté commun',240:'Sériole couronnée'})
manifest=json.loads(MANIFEST.read_text()); assert len(manifest)==220 and manifest[-1]['id']==220
for i in range(221,241):
    sha=save(i,spec[i]); manifest.append({'id':i,'name':names[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':sha})
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n')
s=TRASH.read_text(); s=re.sub(r'const GENERATED_IDS=new Set\(\[[^\]]*\]\);','const GENERATED_IDS=new Set(['+','.join(map(str,range(1,241)))+']);',s,count=1); TRASH.write_text(s)
nextq=[
(241,'Sériole limon','Sériole limon réelle argentée avec bande jaune longitudinale, corps fuselé et queue fourchue, sujet entier isolé sans texte ni décor.'),
(242,'Chinchard commun','Chinchard commun réel argenté bleuté, corps fuselé avec ligne latérale marquée, sujet entier isolé sans texte ni décor.'),
(243,'Chinchard méditerranéen','Chinchard méditerranéen réel argenté, dos bleu-vert et silhouette fuselée, sujet entier isolé sans texte ni décor.'),
(244,'Chinchard jaune','Chinchard jaune réel argenté avec nageoires et ligne latérale jaunes, sujet entier isolé sans texte ni décor.'),
(245,'Maigre','Maigre réel gris argenté, corps allongé et nageoires sombres, sujet entier isolé sans texte ni décor.'),
(246,'Ombrine côtière','Ombrine côtière réelle dorée-brune, corps allongé et petit barbillon au menton, sujet entier isolé sans texte ni décor.'),
(247,'Corb commun','Corb commun réel sombre bronze-noir avec longues nageoires pelviennes, sujet entier isolé sans texte ni décor.'),
(248,'Mostelle de roche','Mostelle de roche réelle brun-rouge, corps de gadidé allongé et barbillons, sujet entier isolé sans texte ni décor.'),
(249,'Mostelle blanche','Mostelle blanche réelle beige argenté, corps de gadidé allongé et barbillons, sujet entier isolé sans texte ni décor.'),
(250,'Capelan','Capelan réel petit et fuselé, argenté avec dos vert-olive, sujet entier isolé sans texte ni décor.'),
]
(ART/'queue-241-250.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':r} for i,n,r in nextq],ensure_ascii=False,indent=2)+'\n')
QUEUE.unlink(); print('generated 221-240 and prepared 241-250')
