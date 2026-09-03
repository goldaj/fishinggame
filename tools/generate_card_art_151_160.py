from PIL import Image, ImageDraw, ImageEnhance
from pathlib import Path
import hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'app/src/main/assets/card-art'
MANIFEST=ART/'manifest.json'
RENDERER=ROOT/'app/src/main/assets/trash-art.js'

NAMES={
151:'Omble Dolly Varden',152:'Omble à tête plate',153:'Grand corégone',154:'Cisco de lac',
155:'Esturgeon blanc',156:'Esturgeon jaune',157:'Esturgeon sibérien',158:'Esturgeon étoilé',
159:'Esturgeon beluga',160:'Spatulaire'}

NEXT=[
(161,'Alligator gar','Grand lépisosté réel vert olive, corps très allongé, museau large garni de dents et taches sombres sur les nageoires, sujet entier isolé sans texte ni décor, style schématique existant.'),
(162,'Lépisosté osseux','Lépisosté réel très allongé brun-olive, long museau étroit et corps couvert d’écailles dures, sujet entier isolé sans texte ni décor, style schématique existant.'),
(163,'Amie calva','Poisson réel robuste brun-olive, longue nageoire dorsale continue, tête arrondie et queue puissante, sujet entier isolé sans texte ni décor, style schématique existant.'),
(164,'Poisson-castor','Poisson d’eau douce réel trapu brun-vert, grosse tête et nageoire dorsale longue, sujet entier isolé sans texte ni décor, style schématique existant.'),
(165,'Pacu noir','Pacu réel au corps haut et comprimé gris sombre, ventre plus clair et nageoires robustes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(166,'Piranha rouge','Piranha réel au corps haut argenté, ventre rouge-orangé, mâchoire puissante et petite nageoire adipeuse, sujet entier isolé sans texte ni décor, style schématique existant.'),
(167,'Piranha noir','Piranha réel gris anthracite à noir, corps haut comprimé et mâchoire forte, sujet entier isolé sans texte ni décor, style schématique existant.'),
(168,'Arapaïma','Très grand poisson amazonien réel allongé gris-vert, larges écailles et reflets rouge-orangé vers la queue, sujet entier isolé sans texte ni décor, style schématique existant.'),
(169,'Arowana argenté','Arowana réel très allongé argenté, grande bouche tournée vers le haut et longues nageoires dorsale et anale, sujet entier isolé sans texte ni décor, style schématique existant.'),
(170,'Arowana asiatique','Arowana réel allongé aux grandes écailles dorées à rougeâtres, bouche relevée et longs barbillons, sujet entier isolé sans texte ni décor, style schématique existant.')]

def load_rgba(i): return Image.open(ART/f'{i:03d}.webp').convert('RGBA')

def fit(img,scale_x=1.0,scale_y=1.0,max_side=230):
    bb=img.getchannel('A').getbbox()
    src=img.crop(bb)
    w=max(1,int(src.width*scale_x)); h=max(1,int(src.height*scale_y))
    src=src.resize((w,h),Image.Resampling.LANCZOS)
    k=min(max_side/src.width,max_side/src.height,1.0)
    if k<1: src=src.resize((max(1,int(src.width*k)),max(1,int(src.height*k))),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(256,256),(0,0,0,0))
    out.alpha_composite(src,((256-src.width)//2,(256-src.height)//2))
    return out

def tint(img,color,strength):
    base=img.convert('RGBA')
    overlay=Image.new('RGBA',base.size,tuple(color)+(0,))
    a=base.getchannel('A')
    overlay.putalpha(a.point(lambda x:int(x*strength)))
    return Image.alpha_composite(base,overlay)

def sturgeon(body,scute,snout=44,slender=1.0,massive=1.0,stars=False):
    im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
    cy=130; x0=54; x1=204
    half=int(36*massive/slender)
    # body and heterocercal tail
    d.ellipse((x0,cy-half,x1,cy+half),fill=body+(255,),outline=(32,36,43,255),width=3)
    d.polygon([(198,cy-12),(236,cy-44),(222,cy-4),(242,cy+10),(199,cy+17)],fill=body+(255,),outline=(32,36,43,255))
    # pointed/short snout
    tip=max(8,x0-snout)
    d.polygon([(x0+18,cy-21),(tip,cy-2),(x0+18,cy+19)],fill=body+(255,),outline=(32,36,43,255))
    # dorsal and pectoral fins
    d.polygon([(154,cy-half+4),(170,cy-half-30),(182,cy-half+5)],fill=body+(245,),outline=(35,38,45,255))
    d.polygon([(101,cy+half-5),(122,cy+half+30),(140,cy+half-2)],fill=body+(235,),outline=(35,38,45,255))
    # eye and mouth
    d.ellipse((tip+30,cy-12,tip+38,cy-4),fill=(245,198,73,255),outline=(20,20,20,255),width=2)
    d.line((tip+5,cy+3,x0+20,cy+7),fill=(40,35,35,230),width=2)
    # barbels
    for off in (-7,0,7): d.line((tip+26+off,cy+9,tip+22+off,cy+24),fill=(56,47,39,230),width=2)
    # scutes: five visual rows, dense center row
    count=14 if stars else 10
    for r,yy in enumerate((cy-half+7,cy-14,cy,cy+14,cy+half-7)):
        for j in range(count):
            x=x0+30+j*((x1-x0-42)/(count-1))
            if r in (0,4) and j%2: continue
            s=3 if stars else 4
            d.polygon([(x,yy-s),(x+s,yy),(x,yy+s),(x-s,yy)],fill=scute+(240,))
    # highlights/shadow
    d.arc((x0+8,cy-half+5,x1-4,cy+half-8),200,335,fill=(255,255,255,75),width=3)
    d.arc((x0+12,cy-half+10,x1,cy+half+2),20,160,fill=(0,0,0,65),width=5)
    return im

def paddlefish():
    im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
    body=(82,112,151,255); outline=(28,35,48,255)
    d.ellipse((84,101,210,163),fill=body,outline=outline,width=3)
    # paddle rostrum
    d.rounded_rectangle((13,124,110,141),radius=9,fill=(93,125,170,255),outline=outline,width=3)
    d.polygon([(197,116),(238,82),(221,125),(243,145),(200,151)],fill=body,outline=outline)
    d.polygon([(153,105),(171,73),(183,108)],fill=body,outline=outline)
    d.polygon([(136,157),(157,183),(172,155)],fill=body,outline=outline)
    d.ellipse((102,117,111,126),fill=(245,205,74,255),outline=(15,18,22,255),width=2)
    d.arc((93,122,133,151),15,105,fill=(20,25,32,220),width=3)
    d.line((120,112,186,111),fill=(230,240,255,75),width=3)
    return im

# 151-152 are the exact generated WebP files staged before this script runs.
for i in (151,152):
    p=ART/f'{i:03d}.webp'
    if not p.exists(): raise SystemExit(f'Missing staged asset {p}')

# Corégones based on already validated silhouettes.
base116=load_rgba(116); base117=load_rgba(117)
fit(tint(base116,(214,229,244),0.15),1.05,1.06).save(ART/'153.webp','WEBP',quality=82,method=6)
fit(tint(base117,(186,215,229),0.10),1.12,0.88).save(ART/'154.webp','WEBP',quality=82,method=6)

# Esturgeons and paddlefish.
variants={
155:((147,151,153),(225,219,192),48,1.00,1.00,False),
156:((157,132,62),(236,194,71),50,1.00,0.92,False),
157:((69,82,105),(189,197,205),38,1.04,0.90,False),
158:((77,67,63),(229,206,158),64,1.30,0.78,True),
159:((103,91,111),(222,211,218),24,0.86,1.22,False)}
for i,(body,scute,snout,slender,massive,stars) in variants.items():
    fit(sturgeon(body,scute,snout,slender,massive,stars),1,1,236).save(ART/f'{i}.webp','WEBP',quality=82,method=6)
fit(paddlefish(),1,1,236).save(ART/'160.webp','WEBP',quality=82,method=6)

manifest=json.loads(MANIFEST.read_text('utf-8'))
manifest=[e for e in manifest if not (151<=int(e['id'])<=160)]
for i in range(151,161):
    p=ART/f'{i:03d}.webp'; b=p.read_bytes()
    with Image.open(p) as im:
        if im.size!=(256,256): raise SystemExit(f'Bad dimensions {i}: {im.size}')
        if im.mode not in ('RGBA','LA'): raise SystemExit(f'No alpha for {i}: {im.mode}')
    manifest.append({'id':i,'name':NAMES[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:int(e['id']))
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n','utf-8')

renderer=RENDERER.read_text('utf-8')
renderer=re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f"GENERATED_IDS=new Set([{','.join(str(i) for i in range(1,161))}])",renderer)
RENDERER.write_text(renderer,'utf-8')

oldq=ART/'queue-151-160.json'
if oldq.exists(): oldq.unlink()
queue=[]
for i,name,ref in NEXT:
    queue.append({'id':i,'name':name,'file':f'{i:03d}.webp','status':'generation-pending','reference':ref})
(ART/'queue-161-170.json').write_text(json.dumps(queue,ensure_ascii=False,indent=2)+'\n','utf-8')
print('generated/finalized card art 151-160')
