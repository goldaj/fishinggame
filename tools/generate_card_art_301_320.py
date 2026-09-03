from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-301-320.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(24,31,38,255)
def poly(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-6,y-6,x+6,y+6),fill=(238,197,57,255),outline=OUT,width=3); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def grouper(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
 colors={301:(92,91,73,255),302:(161,74,62,255),303:(158,139,91,255),304:(115,103,88,255),305:(97,112,82,255),306:(132,113,84,255),307:(128,116,92,255),308:(82,89,77,255),309:(120,100,86,255),310:(91,87,81,255),311:(103,96,90,255)}; body=colors[i]; fin=(62,68,61,255)
 d.ellipse((32,77,210,177),fill=body,outline=OUT,width=5); poly(d,[(199,99),(238,84),(229,126),(238,170),(199,151)],fin); poly(d,[(73,87),(106,53),(163,87)],fin); poly(d,[(111,167),(139,195),(173,158)],fin); poly(d,[(113,117),(151,105),(124,145)],tuple(min(255,c+18) for c in body[:3])+(255,)); eye(d,59,108); d.arc((31,109,75,151),15,108,fill=OUT,width=4)
 if i in (303,305,306,308):
  for x,y in ((84,103),(105,94),(126,113),(148,99),(170,121),(188,105)): d.ellipse((x-5,y-4,x+5,y+4),fill=(60,55,47,190))
 if i in (304,307):
  for x in (88,116,144,172): d.rectangle((x,84,x+9,165),fill=(53,58,55,150))
 if i==302: d.line((72,128,190,128),fill=(213,117,91,255),width=5)
 return im
def wrasse(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
 colors={312:(121,111,84,255),313:(68,130,84,255),314:(115,73,67,255),315:(90,112,93,255),316:(62,126,123,255),317:(108,95,82,255),318:(130,92,67,255)}; body=colors[i]; fin=(49,77,72,255)
 d.ellipse((35,91,211,166),fill=body,outline=OUT,width=5); poly(d,[(201,103),(239,89),(230,128),(239,167),(201,149)],fin); poly(d,[(74,96),(104,69),(165,96)],fin); poly(d,[(120,160),(146,184),(176,154)],fin); eye(d,60,113); d.arc((35,114,72,143),22,105,fill=OUT,width=3)
 if i in (315,316,317):
  accent=(49,160,153,220) if i==316 else (170,94,70,210)
  for x,y in ((91,108),(111,122),(131,103),(151,130),(174,111)): d.ellipse((x-4,y-4,x+4,y+4),fill=accent)
 if i==313: d.line((73,126,193,126),fill=(118,178,87,255),width=5)
 if i==314:
  for x in (91,121,151): d.line((x,99,x+8,151),fill=(71,55,55,180),width=5)
 return im
def castagnole(red=False):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(166,65,65,255) if red else (52,65,82,255); fin=(117,50,55,255) if red else (38,49,63,255)
 d.ellipse((58,57,202,190),fill=body,outline=OUT,width=5); poly(d,[(193,91),(232,73),(224,125),(232,177),(193,153)],fin); poly(d,[(89,71),(119,37),(168,69)],fin); poly(d,[(105,179),(135,211),(174,174)],fin); eye(d,82,102); return im
def make(i):
 if i<=311:return grouper(i)
 if i<=318:return wrasse(i)
 return castagnole(i==320)
q=json.loads(QUE.read_text()); assert [x['id'] for x in q]==list(range(301,321)); m=json.loads(MAN.read_text()); assert len(m)==300 and m[-1]['id']==300
for x in q:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,321)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(321,341))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-321-340.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 301-320; next queue 321-340')
