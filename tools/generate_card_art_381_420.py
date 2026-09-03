from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-381-400.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(23,30,37,255)
def poly(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-6,y-6,x+6,y+6),fill=(239,198,57,255),outline=OUT,width=3); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def lion(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={381:(173,73,61,255),382:(153,91,67,255),383:(137,82,60,255),384:(161,95,70,255),385:(111,82,65,255),386:(188,179,157,255)}; b=cols[i]; d.ellipse((43,82,194,169),fill=b,outline=OUT,width=5); tail=tuple(max(30,c-20) for c in b[:3])+(255,); poly(d,[(187,102),(232,77),(220,127),(232,177),(187,149)],tail); poly(d,[(85,91),(100,45),(113,91)],tail); poly(d,[(107,92),(130,39),(142,95)],tail); poly(d,[(132,97),(163,49),(172,103)],tail); poly(d,[(98,119),(72,188),(135,153)],tail); poly(d,[(128,121),(155,193),(181,147)],tail); eye(d,67,111)
 for x in (88,111,135,158): d.line((x,91,x+9,158),fill=(235,218,190,190),width=4)
 return im
def bottom(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={387:(111,101,85,255),388:(102,95,78,255),389:(126,103,77,255),390:(95,113,121,255),391:(110,120,126,255),392:(134,141,146,255)}; b=cols[i];
 if i in (390,391,392): d.ellipse((52,70,197,183),fill=b,outline=OUT,width=5)
 else: d.ellipse((37,87,205,172),fill=b,outline=OUT,width=5)
 poly(d,[(194,104),(232,91),(224,128),(232,164),(194,149)],tuple(max(25,c-18) for c in b[:3])+(255,)); eye(d,67,110)
 if i in (387,388,389):
  for x in range(70,176,19): poly(d,[(x,92),(x+8,62),(x+16,95)],tuple(max(25,c-25) for c in b[:3])+(255,),3)
 return im
def reef_small(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={393:(230,146,44,255),394:(206,68,46,255),395:(221,137,151,255),396:(116,55,45,255),397:(62,118,185,255),398:(76,129,183,255),399:(46,49,55,255),400:(70,165,164,255),401:(84,141,160,255)}; b=cols[i]; d.ellipse((51,76,201,178),fill=b,outline=OUT,width=5); fin=tuple(max(25,c-25) for c in b[:3])+(255,); poly(d,[(193,101),(231,82),(223,127),(231,172),(193,151)],fin); poly(d,[(92,87),(117,55),(152,87)],fin); poly(d,[(119,168),(144,195),(171,160)],fin); eye(d,75,108)
 if i in (393,394,395,396):
  for x in ((92,108),(136,151)): d.rectangle((x[0]-5,83,x[0]+7,170),fill=(235,229,205,215))
 if i==398: poly(d,[(193,101),(231,82),(223,127),(231,172),(193,151)],(235,199,48,255))
 if i==399:
  for x,y in ((109,105),(145,124),(171,101)): d.ellipse((x-6,y-6,x+6,y+6),fill=(232,236,237,230))
 if i==401: d.rectangle((51,76,118,178),fill=(50,76,103,145))
 return im
def surgeon(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={402:(126,91,65,255),403:(230,198,48,255),404:(86,118,148,255),405:(61,100,172,255),406:(92,132,158,255),407:(102,133,147,255),408:(113,141,147,255),409:(118,111,91,255)}; b=cols[i]; d.ellipse((52,61,202,191),fill=b,outline=OUT,width=5); fin=tuple(max(25,c-25) for c in b[:3])+(255,); poly(d,[(193,92),(234,72),(225,127),(234,182),(193,156)],fin); poly(d,[(88,75),(117,43),(164,72)],fin); poly(d,[(107,179),(138,211),(177,169)],fin); eye(d,77,101)
 if i==404: poly(d,[(86,73),(125,29),(172,77)],fin)
 if i==405:
  for x in (95,127,159): d.line((x,73,x+8,174),fill=(235,173,45,220),width=5)
 if i==406: d.polygon([(60,80),(113,78),(101,122),(58,132)],fill=(236,238,232,210))
 if i==407: d.ellipse((179,115,190,126),fill=(54,126,200,255))
 if i==408: poly(d,[(58,92),(36,75),(60,112)],b,3)
 if i==409:
  for x,y in ((103,97),(126,121),(151,88),(169,139)): d.ellipse((x-4,y-4,x+4,y+4),fill=(63,99,129,220))
 return im
def parrot(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={410:(42,117,178,255),411:(72,139,141,255),412:(86,116,176,255),413:(191,83,47,255)}; b=cols[i]; d.ellipse((46,69,202,185),fill=b,outline=OUT,width=5); fin=tuple(max(25,c-20) for c in b[:3])+(255,); poly(d,[(193,96),(235,74),(225,127),(235,180),(193,155)],fin); poly(d,[(88,82),(117,49),(165,81)],fin); poly(d,[(112,175),(143,204),(177,166)],fin); eye(d,72,102); poly(d,[(47,119),(30,111),(29,128),(48,137)],(223,211,177,255),3)
 if i==411: d.ellipse((54,72,108,111),fill=(53,105,108,180))
 if i==412: d.rectangle((48,69,115,185),fill=(229,213,190,120))
 if i==413: d.line((76,130,190,130),fill=(238,176,48,230),width=6)
 return im
def butterfly(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={414:(226,198,75,255),415:(225,202,93,255),416:(238,218,70,255),417:(211,182,88,255)}; b=cols[i]; d.ellipse((63,55,194,196),fill=b,outline=OUT,width=5); fin=(71,61,48,255); poly(d,[(183,90),(225,70),(218,126),(225,183),(183,157)],fin); poly(d,[(92,69),(120,36),(164,67)],fin); poly(d,[(106,184),(137,214),(171,176)],fin); poly(d,[(63,114),(36,120),(64,128)],b,3); eye(d,84,96)
 if i==414:
  for x in (100,130,158): d.rectangle((x,62,x+9,190),fill=(63,60,53,180))
 if i==415: d.ellipse((125,107,145,127),fill=(48,53,58,220))
 if i==417: d.rectangle((130,58,156,192),fill=(66,60,52,180))
 return im
def angel(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={418:(129,136,139,255),419:(50,79,155,255),420:(76,96,115,255)}; b=cols[i]; d.ellipse((65,53,193,198),fill=b,outline=OUT,width=5); fin=tuple(max(20,c-25) for c in b[:3])+(255,); poly(d,[(183,86),(228,65),(217,127),(228,188),(183,160)],fin); poly(d,[(92,70),(119,24),(161,69)],fin); poly(d,[(105,186),(134,231),(174,176)],fin); eye(d,86,96)
 if i==419:
  for x in (109,141): d.rectangle((x,59,x+12,194),fill=(235,188,47,210))
 if i==420:
  for x in (101,128,155): d.rectangle((x,58,x+10,194),fill=(44,48,54,190))
 return im
def make(i):
 if i<=386:return lion(i)
 if i<=392:return bottom(i)
 if i<=401:return reef_small(i)
 if i<=409:return surgeon(i)
 if i<=413:return parrot(i)
 if i<=417:return butterfly(i)
 return angel(i)
q=json.loads(QUE.read_text()); extra=json.loads(Path('/tmp/extra-card-art.json').read_text()); items=q+extra; assert [x['id'] for x in items]==list(range(381,421)); m=json.loads(MAN.read_text()); assert len(m)==380 and m[-1]['id']==380
for x in items:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,421)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(421,461))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-421-460.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 381-420; next queue 421-460')
