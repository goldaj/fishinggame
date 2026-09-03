from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, re, math

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'app/src/main/assets/card-art'
MANIFEST=ART/'manifest.json'
QUEUE=ART/'queue-261-270.json'
TRASH=ROOT/'app/src/main/assets/trash-art.js'
OUT=(24,31,38,255)

def poly(d,pts,fill,w=4):
    d.polygon(pts,fill=fill)
    d.line(pts+[pts[0]],fill=OUT,width=w,joint='curve')

def eye(d,x,y):
    d.ellipse((x-7,y-7,x+7,y+7),fill=(232,190,55,255),outline=OUT,width=3)
    d.ellipse((x-3,y-3,x+3,y+3),fill=OUT)

def base_canvas():
    im=Image.new('RGBA',(256,256),(0,0,0,0)); return im,ImageDraw.Draw(im)

def tuna(body=(90,125,155,255), accent=(35,55,75,255), long_pect=False, stripes=False, spots=False):
    im,d=base_canvas()
    d.ellipse((35,83,206,169),fill=body,outline=OUT,width=5)
    poly(d,[(199,104),(238,81),(226,126),(238,173),(199,149)],accent)
    poly(d,[(92,89),(124,58),(137,91)],accent); poly(d,[(111,162),(135,192),(145,161)],accent)
    poly(d,[(155,102),(198 if long_pect else 176,112),(159,126)],(120,145,160,255))
    for x in range(184,211,8):
        poly(d,[(x,99),(x+5,89),(x+8,101)],accent,2); poly(d,[(x,151),(x+5,162),(x+8,149)],accent,2)
    if stripes:
        for x in (72,84,96,108,120): d.line((x,133,x+8,153),fill=(30,43,55,220),width=5)
    if spots:
        for x,y in ((84,103),(98,98),(112,105),(126,101)): d.ellipse((x-3,y-3,x+3,y+3),fill=(38,50,60,220))
    eye(d,63,113); d.arc((36,110,73,144),20,100,fill=OUT,width=3)
    return im

def gadid(body=(130,110,70,255)):
    im,d=base_canvas()
    d.ellipse((35,83,205,172),fill=body,outline=OUT,width=5)
    poly(d,[(197,100),(236,82),(226,126),(236,169),(197,151)],(105,90,65,255))
    # long dorsal and anal
    poly(d,[(80,88),(98,59),(171,62),(198,92)],(145,120,72,255))
    poly(d,[(91,166),(116,191),(183,187),(199,151)],(120,100,70,255))
    poly(d,[(104,118),(143,110),(116,142)],(150,130,85,255))
    eye(d,62,112); d.line((54,144,62,154),fill=OUT,width=3)
    return im

def grenadier(dark=False):
    im,d=base_canvas(); body=(62,67,76,255) if dark else (112,102,88,255); fin=(45,50,58,255) if dark else (90,82,72,255)
    # large head + tapering rat-tail
    d.ellipse((29,76,130,178),fill=body,outline=OUT,width=5)
    poly(d,[(105,96),(229,122),(238,129),(229,136),(105,155)],body)
    poly(d,[(92,82),(120,52),(175,112)],fin); poly(d,[(100,166),(142,193),(183,145)],fin)
    poly(d,[(78,119),(121,109),(96,145)],(125,120,110,255))
    eye(d,56,111); d.arc((29,117,67,149),20,100,fill=OUT,width=3)
    return im

def ribbon(silver=False):
    im,d=base_canvas(); body=(190,198,205,255) if silver else (45,48,55,255); fin=(155,165,175,255) if silver else (32,35,42,255)
    pts=[(24,116),(51,91),(204,100),(239,119),(224,136),(67,151),(28,139)]
    poly(d,pts,body,5)
    poly(d,[(58,95),(92,68),(204,100)],fin); poly(d,[(76,149),(112,178),(210,136)],fin)
    # large jaw
    poly(d,[(25,118),(8,108),(24,133),(48,132)],body,4); eye(d,49,113)
    if silver: d.line((66,119,215,119),fill=(240,245,248,180),width=4)
    return im

def escolier(serpent=False):
    im,d=base_canvas(); body=(48,43,43,255); fin=(28,30,35,255)
    if serpent:
        pts=[(24,119),(48,98),(97,94),(143,106),(188,97),(232,116),(220,137),(173,143),(126,134),(80,148),(39,139)]
        poly(d,pts,body,5)
    else:
        d.ellipse((32,83,207,169),fill=body,outline=OUT,width=5); poly(d,[(198,103),(238,84),(228,126),(238,168),(198,149)],fin)
    poly(d,[(69,96),(104,62),(174,92)],fin); poly(d,[(92,153),(129,188),(185,145)],fin)
    eye(d,55,113); d.arc((27,114,66,144),20,100,fill=OUT,width=3)
    return im

def make(i):
    if i==261: return gadid((145,118,70,255))
    if i==262: return grenadier(False)
    if i==263: return grenadier(True)
    if i==264: return ribbon(False)
    if i==265: return ribbon(True)
    if i==266: return escolier(False)
    if i==267: return escolier(True)
    if i==268: return tuna((82,118,150,255),(36,54,71,255),False,True,False)
    if i==269: return tuna((58,84,112,255),(30,45,60,255),False,False,True)
    if i==270: return tuna((100,135,165,255),(35,57,78,255),True,False,False)
    raise ValueError(i)

queue=json.loads(QUEUE.read_text())
assert [x['id'] for x in queue]==list(range(261,271))
manifest=json.loads(MANIFEST.read_text())
assert len(manifest)==260 and manifest[-1]['id']==260
for item in queue:
    i=item['id']; im=make(i)
    p=ART/f'{i:03d}.webp'; im.save(p,'WEBP',quality=86,method=6)
    raw=p.read_bytes(); manifest.append({'id':i,'name':item['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n')
s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)', 'GENERATED_IDS=new Set(['+','.join(map(str,range(1,271)))+'])', s); TRASH.write_text(s)
next_data=json.loads(Path('/tmp/next-card-art.json').read_text())
assert [x['id'] for x in next_data]==list(range(271,281))
for x in next_data:
    x['file']=f"{x['id']:03d}.webp"; x['status']='generation-pending'; x['reference']=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent."
(ART/'queue-271-280.json').write_text(json.dumps(next_data,ensure_ascii=False,indent=2)+'\n')
QUEUE.unlink()
print('generated 261-270; next queue 271-280')
