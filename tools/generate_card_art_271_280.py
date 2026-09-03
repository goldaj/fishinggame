from pathlib import Path
from PIL import Image, ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-271-280.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(23,31,39,255)
def P(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def E(d,x,y,r=6): d.ellipse((x-r,y-r,x+r,y+r),fill=(236,195,55,255),outline=OUT,width=3); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def tuna(body=(83,117,151,255),fin=(35,55,74,255),yellow=False,bigeye=False,blackfin=False,teeth=False):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); d.ellipse((34,82,205,171),fill=body,outline=OUT,width=5); tail=(220,178,45,255) if yellow else fin; P(d,[(198,103),(239,82),(228,126),(239,171),(198,150)],tail); P(d,[(91,91),(122,58),(139,91)],(220,185,45,255) if yellow else fin); P(d,[(113,164),(134,193),(145,162)],(220,185,45,255) if yellow else fin); P(d,[(151,104),(178,112),(156,128)],(60,66,72,255) if blackfin else (120,143,158,255));
 for x in range(183,212,8): P(d,[(x,100),(x+4,89),(x+8,101)],tail,2); P(d,[(x,151),(x+4,162),(x+8,149)],tail,2)
 E(d,61,112,9 if bigeye else 6); d.arc((34,111,72,145),20,102,fill=OUT,width=3)
 if teeth:
  for x in (42,48,54): d.polygon([(x,132),(x+3,126),(x+6,132)],fill=(245,245,235,255))
 return im
def mackerel(mode):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(145,163,176,255); dark=(42,69,87,255); d.ellipse((25,94,210,158),fill=body,outline=OUT,width=5); P(d,[(202,105),(241,84),(231,126),(241,169),(202,148)],dark); P(d,[(76,99),(103,72),(142,98)],dark); P(d,[(112,154),(137,181),(163,151)],dark); P(d,[(141,113),(178,119),(145,135)],(103,124,138,255)); E(d,48,116)
 if mode=='white': d.line((64,121,196,121),fill=(225,232,235,255),width=5)
 if mode=='stripe':
  for x in range(68,171,17): d.line((x,102,x+13,124),fill=(36,63,82,230),width=4)
 if mode=='spots':
  for x,y in ((78,111),(95,105),(112,116),(132,107),(151,118),(170,109)): d.ellipse((x-3,y-3,x+3,y+3),fill=(38,68,86,255))
 if mode=='king': d.line((66,128,188,128),fill=(55,95,115,255),width=5)
 return im
def marlin(dark=False):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(57,70,88,255) if dark else (150,167,184,255); fin=(31,39,51,255) if dark else (92,115,139,255); d.ellipse((55,87,205,164),fill=body,outline=OUT,width=5); P(d,[(196,101),(239,80),(227,126),(239,172),(196,149)],fin); P(d,[(83,92),(111,48),(173,92)],fin); P(d,[(107,158),(133,189),(160,157)],fin); P(d,[(145,108),(188,113),(152,130)],fin); P(d,[(58,112),(8,119),(57,127)],body,4); E(d,75,111); return im
def make(i):
 return {271:lambda:tuna((69,96,126,255),(30,48,68,255),bigeye=True),272:lambda:tuna((88,127,158,255),(48,68,80,255),yellow=True),273:lambda:tuna((98,130,151,255),(20,27,34,255),blackfin=True),274:lambda:tuna((105,135,158,255),(40,57,72,255),teeth=True),275:lambda:mackerel('white'),276:lambda:mackerel('stripe'),277:lambda:mackerel('spots'),278:lambda:mackerel('king'),279:lambda:marlin(False),280:lambda:marlin(True)}[i]()
q=json.loads(QUE.read_text()); assert [x['id'] for x in q]==list(range(271,281)); m=json.loads(MAN.read_text()); assert m[-1]['id']==270 and len(m)==270
for x in q:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,281)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(281,301))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-281-300.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 271-280; next queue 281-300')
