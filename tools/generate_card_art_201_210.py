from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'app/src/main/assets/card-art'
MANIFEST=ART/'manifest.json'
QUEUE=ART/'queue-201-210.json'
TRASH=ROOT/'app/src/main/assets/trash-art.js'

W=H=256
OUTLINE=(25,33,38,255)

def poly(draw, pts, fill, width=4):
    draw.polygon(pts, fill=fill)
    draw.line(pts+[pts[0]], fill=OUTLINE, width=width, joint='curve')

def fish(body=(80,140,180,255), tail=(100,150,190,255), shape='oval', tall=False, slender=False,
         stripes=None, spots=None, split=None, fin=(120,160,190,255), beak=False, bump=False,
         fin_edges=None, bars=None):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    if slender:
        box=(38,96,190,158)
    elif tall:
        box=(42,66,188,184)
    else:
        box=(38,78,190,174)
    x0,y0,x1,y1=box
    cy=(y0+y1)//2
    # tail first
    poly(d,[(x1-8,cy),(232,82 if tall else 94),(224,cy),(232,174 if tall else 162)],tail)
    # dorsal / ventral fins
    poly(d,[(82,y0+4),(112,y0-28 if not slender else y0-16),(145,y0+3)],fin,3)
    if not slender:
        poly(d,[(98,y1-4),(124,y1+24),(150,y1-3)],fin,3)
    # body
    if shape=='round':
        d.ellipse(box,fill=body,outline=OUTLINE,width=5)
    else:
        d.ellipse(box,fill=body,outline=OUTLINE,width=5)
    # forehead bump for frontosa
    if bump:
        d.ellipse((44,62,92,103),fill=body,outline=OUTLINE,width=4)
    # bicolor split
    if split:
        sx=int(x0+(x1-x0)*split[0])
        mask=Image.new('L',(W,H),0); md=ImageDraw.Draw(mask); md.rectangle((sx,y0,x1,y1),fill=255)
        layer=Image.new('RGBA',(W,H),(0,0,0,0)); ld=ImageDraw.Draw(layer); ld.ellipse(box,fill=split[1])
        im.alpha_composite(Image.composite(layer,Image.new('RGBA',(W,H),(0,0,0,0)),mask))
        d=ImageDraw.Draw(im)
        d.ellipse(box,outline=OUTLINE,width=5)
    # stripes
    if stripes:
        color,count=stripes
        for i in range(count):
            x=int(x0+32+i*(x1-x0-48)/max(1,count-1))
            d.line((x,y0+10,x+4,y1-10),fill=color,width=9)
    if bars:
        color,count=bars
        for i in range(count):
            x=int(x0+25+i*(x1-x0-40)/max(1,count-1))
            d.line((x,y0+8,x,y1-8),fill=color,width=6)
    if spots:
        color,pts=spots
        for px,py,r in pts:
            d.ellipse((px-r,py-r,px+r,py+r),fill=color)
    # eye and mouth
    d.ellipse((54,108 if not tall else 106,66,120 if not tall else 118),fill=(245,202,55,255),outline=OUTLINE,width=2)
    d.ellipse((58,111 if not tall else 109,63,116 if not tall else 114),fill=OUTLINE)
    if beak:
        poly(d,[(38,122),(22,116),(18,126),(38,132)],body,3)
    else:
        d.line((38,126,24,126),fill=OUTLINE,width=4)
    # fin edge accents
    if fin_edges:
        c=fin_edges
        d.line((84,y0+3,113,y0-26 if not slender else y0-14,145,y0+2),fill=c,width=5,joint='curve')
        d.line((101,y1-4,124,y1+21,148,y1-4),fill=c,width=5,joint='curve')
    return im

def save(id_,im):
    p=ART/f'{id_:03d}.webp'
    im.save(p,'WEBP',quality=88,method=6)
    b=p.read_bytes()
    return hashlib.sha256(b).hexdigest()

specs={
201: fish(body=(43,116,205,255),tail=(235,125,48,255),fin=(235,125,48,255),stripes=((24,57,108,255),4),spots=((238,160,45,255),[(90,101,4),(116,92,4),(139,105,4)])),
202: fish(body=(150,190,226,255),tail=(130,170,210,255),fin=(130,170,210,255),stripes=((18,28,42,255),5)),
203: fish(body=(225,62,45,255),tail=(235,75,50,255),fin=(240,88,55,255),shape='round',tall=True,beak=True),
204: fish(body=(155,188,215,255),tail=(120,155,192,255),fin=(120,155,192,255),tall=True,bump=True,stripes=((22,36,54,255),5)),
205: fish(body=(244,203,44,255),tail=(244,203,44,255),fin=(244,203,44,255),fin_edges=(35,42,40,255)),
206: fish(body=(42,120,210,255),tail=(50,125,215,255),fin=(50,125,215,255),stripes=((22,55,110,255),5)),
207: fish(body=(65,135,195,255),tail=(235,151,58,255),fin=(105,165,195,255),split=(0.52,(235,151,58,255)),tall=True),
208: fish(body=(205,74,64,255),tail=(220,72,60,255),fin=(225,90,60,255),tall=True,split=(0.35,(235,145,58,255))),
209: fish(body=(232,224,185,255),tail=(215,68,50,255),fin=(62,120,205,255),slender=True,bars=((32,35,40,255),4),fin_edges=(220,70,50,255)),
210: fish(body=(55,142,160,255),tail=(75,145,190,255),fin=(75,145,190,255),slender=True,spots=((225,70,55,255),[(77,112,3),(91,127,3),(108,105,3),(124,134,3),(141,116,3),(156,101,3)])),
}

queue=json.loads(QUEUE.read_text())
assert [q['id'] for q in queue]==list(range(201,211))
manifest=json.loads(MANIFEST.read_text())
assert len(manifest)==200 and manifest[-1]['id']==200
for q in queue:
    id_=q['id']; sha=save(id_,specs[id_])
    manifest.append({'id':id_,'name':q['name'],'file':q['file'],'width':256,'height':256,'transparent':True,'sha256':sha})
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n')

s=TRASH.read_text()
s=re.sub(r'const GENERATED_IDS=new Set\(\[[^\]]*\]\);', 'const GENERATED_IDS=new Set(['+','.join(map(str,range(1,211)))+']);', s, count=1)
TRASH.write_text(s)

nextq=[
(211,'Guppy','Petit guppy réel au corps fin, queue large très colorée, sujet entier isolé sans texte ni décor, style schématique existant.'),
(212,'Molly noir','Molly réel noir profond, corps trapu et nageoire dorsale haute, sujet entier isolé sans texte ni décor, style schématique existant.'),
(213,'Platy','Petit platy réel orange et rouge, corps court et arrondi, sujet entier isolé sans texte ni décor, style schématique existant.'),
(214,'Xipho','Xipho réel orangé avec long prolongement inférieur de la nageoire caudale en forme d’épée, sujet entier isolé sans texte ni décor.'),
(215,'Loche clown','Loche clown réelle orange vif avec trois larges bandes noires verticales, corps allongé, sujet entier isolé sans texte ni décor.'),
(216,'Loche kuhli','Loche kuhli réelle très allongée et serpentiforme, brun-orange avec bandes noires, sujet entier isolé sans texte ni décor.'),
(217,'Botia yoyo','Botia yoyo réelle beige argenté avec motifs noirs irréguliers, corps de loche robuste, sujet entier isolé sans texte ni décor.'),
(218,'Silure de verre','Silure de verre réel translucide argenté, silhouette fine avec barbillons visibles, sujet entier isolé sans texte ni décor.'),
(219,'Corydoras bronze','Corydoras bronze réel brun doré, corps cuirassé et petits barbillons, sujet entier isolé sans texte ni décor.'),
(220,'Corydoras panda','Corydoras panda réel crème avec taches noires sur l’œil, la dorsale et le pédoncule caudal, sujet entier isolé sans texte ni décor.'),
]
(ART/'queue-211-220.json').write_text(json.dumps([
 {'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':r} for i,n,r in nextq
],ensure_ascii=False,indent=2)+'\n')
QUEUE.unlink()
print('generated 201-210 and prepared 211-220')
