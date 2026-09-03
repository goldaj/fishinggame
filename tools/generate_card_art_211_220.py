from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, re, math

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'app/src/main/assets/card-art'
MANIFEST=ART/'manifest.json'
QUEUE=ART/'queue-211-220.json'
TRASH=ROOT/'app/src/main/assets/trash-art.js'
OUT=(25,33,38,255)


def outline_poly(d,pts,fill,w=4):
    d.polygon(pts,fill=fill)
    d.line(pts+[pts[0]],fill=OUT,width=w,joint='curve')

def eye(d,x,y):
    d.ellipse((x-6,y-6,x+6,y+6),fill=(245,205,60,255),outline=OUT,width=2)
    d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)

def base(body=(130,150,160,255),tail=(130,150,160,255),long=False,roundish=False,fan=False,dorsal=True):
    im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
    if long: box=(34,104,194,152)
    elif roundish: box=(44,78,188,174)
    else: box=(38,92,190,164)
    x0,y0,x1,y1=box; cy=(y0+y1)//2
    if fan:
        outline_poly(d,[(x1-4,cy),(236,70),(230,186)],tail)
    else:
        outline_poly(d,[(x1-5,cy),(232,92 if not long else 104),(221,cy),(232,164 if not long else 152)],tail)
    if dorsal:
        outline_poly(d,[(90,y0+3),(116,y0-24 if not long else y0-13),(150,y0+2)],body,3)
    d.ellipse(box,fill=body,outline=OUT,width=5)
    eye(d,58,cy-8)
    d.line((38,cy+8,24,cy+8),fill=OUT,width=4)
    return im,d,box

def save(i,im):
    p=ART/f'{i:03d}.webp'; im.save(p,'WEBP',quality=88,method=6)
    return hashlib.sha256(p.read_bytes()).hexdigest()

spec={}
# 211 Guppy
im,d,b=base((92,150,170,255),(232,120,52,255),long=True,fan=True)
for x,y,c in [(205,93,(45,100,205,255)),(218,112,(250,200,50,255)),(213,141,(40,130,210,255)),(226,156,(235,70,60,255))]: d.ellipse((x-6,y-6,x+6,y+6),fill=c)
d.line((80,115,165,140),fill=(46,96,135,255),width=4); spec[211]=im
# 212 Molly noir
im,d,b=base((35,39,45,255),(35,39,45,255),roundish=True)
d.polygon([(86,80),(125,51),(158,82)],fill=(35,39,45,255)); d.line([(86,80),(125,51),(158,82)],fill=OUT,width=4); spec[212]=im
# 213 Platy
im,d,b=base((228,113,47,255),(210,65,45,255),roundish=True)
d.ellipse((122,112,155,142),fill=(236,153,55,255)); spec[213]=im
# 214 Xipho
im,d,b=base((224,92,45,255),(220,65,43,255),long=True)
outline_poly(d,[(214,145),(246,178),(222,150)],(220,65,43,255),3); d.line((70,135,177,135),fill=(120,43,38,255),width=4); spec[214]=im
# 215 Loche clown
im,d,b=base((231,132,47,255),(226,102,43,255),long=True)
for x in [78,116,154]: d.line((x,106,x+8,150),fill=(26,30,34,255),width=13); spec[215]=im
# 216 Loche kuhli, serpentiforme
im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
pts=[(28,126),(48,111),(74,105),(102,111),(130,127),(158,142),(190,145),(223,132)]
d.line(pts,fill=OUT,width=34,joint='curve'); d.line(pts,fill=(202,119,55,255),width=25,joint='curve')
for x in [58,86,116,147,176]: d.line((x,105,x+7,145),fill=(35,31,31,255),width=9)
eye(d,43,120); spec[216]=im
# 217 Botia yoyo
im,d,b=base((198,180,138,255),(177,155,117,255),long=True)
for x in [70,92,116,143,166]:
    d.arc((x-9,111,x+9,145),0,300,fill=(45,48,50,255),width=5)
spec[217]=im
# 218 Silure de verre
im,d,b=base((180,210,220,115),(175,205,220,115),long=True)
d.line((42,132,15,148),fill=(65,80,90,210),width=2); d.line((45,135,19,160),fill=(65,80,90,210),width=2)
d.line((70,128,176,128),fill=(75,95,105,170),width=3); spec[218]=im
# 219 Corydoras bronze
im,d,b=base((153,128,76,255),(125,105,72,255),roundish=True)
for x in [76,98,120,142,164]: d.line((x,95,x-5,153),fill=(112,92,58,255),width=3)
d.line((43,138,19,151),fill=OUT,width=2); d.line((44,141,23,164),fill=OUT,width=2); spec[219]=im
# 220 Corydoras panda
im,d,b=base((224,215,188,255),(212,205,180,255),roundish=True)
d.ellipse((48,103,78,135),fill=(34,38,42,255)); d.polygon([(105,79),(128,61),(145,82)],fill=(34,38,42,255)); d.ellipse((164,112,194,146),fill=(34,38,42,255))
d.line((43,138,19,151),fill=OUT,width=2); d.line((44,141,23,164),fill=OUT,width=2); spec[220]=im

queue=json.loads(QUEUE.read_text())
assert [q['id'] for q in queue]==list(range(211,221))
manifest=json.loads(MANIFEST.read_text())
assert len(manifest)==210 and manifest[-1]['id']==210
for q in queue:
    sha=save(q['id'],spec[q['id']])
    manifest.append({'id':q['id'],'name':q['name'],'file':q['file'],'width':256,'height':256,'transparent':True,'sha256':sha})
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n')

s=TRASH.read_text(); s=re.sub(r'const GENERATED_IDS=new Set\(\[[^\]]*\]\);','const GENERATED_IDS=new Set(['+','.join(map(str,range(1,221)))+']);',s,count=1); TRASH.write_text(s)
nextq=[
(221,'Pléco commun','Grand pléco réel brun-gris, corps aplati cuirassé et bouche ventouse, sujet entier isolé sans texte ni décor, style schématique existant.'),
(222,'Ancistrus','Ancistrus réel sombre à petits points clairs, corps de pléco et tentacules courts sur le museau, sujet entier isolé sans texte ni décor.'),
(223,'Silure rayé','Silure rayé réel argenté avec longues bandes sombres longitudinales et barbillons, sujet entier isolé sans texte ni décor.'),
(224,'Silure électrique','Silure électrique africain réel brun-gris, corps épais sans écailles et petites nageoires, sujet entier isolé sans texte ni décor.'),
(225,'Poisson-chien africain','Poisson-chien africain réel allongé, brun-olive avec dents visibles et nageoires postérieures, sujet entier isolé sans texte ni décor.'),
(226,'Tacaud','Tacaud réel brun doré, corps de gadidé avec trois dorsales et petit barbillon, sujet entier isolé sans texte ni décor.'),
(227,'Grondin rouge','Grondin rouge réel rouge-orangé avec grosse tête osseuse et nageoires pectorales larges, sujet entier isolé sans texte ni décor.'),
(228,'Grondin perlon','Grondin perlon réel rouge rosé avec nageoires pectorales bleu-vert déployées, sujet entier isolé sans texte ni décor.'),
(229,'Grondin gris','Grondin gris réel gris-brun, grosse tête anguleuse et nageoires pectorales, sujet entier isolé sans texte ni décor.'),
(230,'Vive commune','Vive commune réelle sable-brun, corps allongé et première dorsale épineuse sombre, sujet entier isolé sans texte ni décor.'),
]
(ART/'queue-221-230.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':r} for i,n,r in nextq],ensure_ascii=False,indent=2)+'\n')
QUEUE.unlink(); print('generated 211-220 and prepared 221-230')
