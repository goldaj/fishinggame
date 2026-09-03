from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-361-380.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(22,28,34,255)
def poly(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y,r=5): d.ellipse((x-r,y-r,x+r,y+r),fill=(235,194,57,255),outline=OUT,width=2); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def flat(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={361:(148,124,87,255),362:(126,104,82,255),363:(111,94,74,255),364:(152,108,75,255)}; body=cols[i]; pts=[(27,128),(43,94),(82,72),(145,71),(198,94),(232,126),(207,157),(151,177),(83,173),(43,153)]; poly(d,pts,body,5); tail=(217,182,50,255) if i==361 else tuple(max(25,c-20) for c in body[:3])+(255,); poly(d,[(199,102),(238,92),(224,126),(238,160),(199,151)],tail); eye(d,70,103); eye(d,88,110); return im
def longpred(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(95,104,92,255) if i in (365,376) else ((35,39,45,255) if i==367 else (58,62,70,255)); d.ellipse((28,105,213,151),fill=body,outline=OUT,width=4); poly(d,[(205,110),(241,97),(232,127),(241,157),(205,145)],tuple(max(20,c-15) for c in body[:3])+(255,)); poly(d,[(84,108),(105,84),(139,107)],tuple(max(20,c-12) for c in body[:3])+(255,)); eye(d,51,119)
 if i in (366,370):
  poly(d,[(28,119),(10,106),(18,132),(56,138)],body,4)
  for x in range(22,52,8): poly(d,[(x,125),(x+3,113),(x+6,126)],(242,238,220,255),1)
 if i==367:
  for x in range(76,191,20): d.ellipse((x,138,x+5,143),fill=(73,191,203,230))
 if i==376: d.rectangle((30,112,76,135),fill=(80,88,78,255),outline=OUT,width=3)
 return im
def lantern():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); d.ellipse((43,93,207,164),fill=(57,66,76,255),outline=OUT,width=5); poly(d,[(198,104),(236,89),(228,127),(236,164),(198,148)],(37,46,57,255)); eye(d,65,112)
 for x,y in ((82,137),(103,142),(126,136),(148,143),(170,138),(190,132)): d.ellipse((x-3,y-3,x+3,y+3),fill=(75,205,216,255))
 return im
def hatchet():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); poly(d,[(49,83),(160,87),(205,115),(173,160),(92,184),(49,146)],(170,185,193,255),5); poly(d,[(193,109),(235,95),(226,127),(235,161),(183,151)],(80,98,111,255)); eye(d,73,104); d.line((86,112,174,122),fill=(235,240,242,210),width=4); return im
def pelican():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(39,42,48,255); d.ellipse((45,105,211,146),fill=body,outline=OUT,width=4); poly(d,[(204,110),(243,98),(231,126),(243,155),(204,142)],body); poly(d,[(50,114),(8,87),(17,137),(70,148)],body,5); eye(d,55,108); return im
def tripod():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); d.ellipse((55,93,204,154),fill=(97,105,105,255),outline=OUT,width=4); poly(d,[(195,103),(233,90),(225,125),(233,161),(195,145)],(60,70,73,255)); eye(d,75,111); d.line((100,146,85,218),fill=OUT,width=5); d.line((145,149,153,221),fill=OUT,width=5); d.line((175,143,195,211),fill=OUT,width=5); return im
def blob(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={373:(121,102,75,255),374:(104,91,79,255),375:(48,48,54,255),377:(105,112,76,255),378:(134,74,62,255),379:(105,95,75,255),380:(117,104,82,255)}; body=cols[i]
 if i==374:
  poly(d,[(50,128),(91,79),(165,80),(210,128),(166,174),(91,174)],body,5); eye(d,87,112); d.line((89,165,75,211),fill=OUT,width=5); d.line((166,165,183,211),fill=OUT,width=5); return im
 d.ellipse((48,72,204,180),fill=body,outline=OUT,width=5); poly(d,[(190,105),(232,89),(224,128),(232,166),(190,151)],tuple(max(20,c-18) for c in body[:3])+(255,)); eye(d,76,105)
 if i==375:
  d.arc((88,25,154,98),180,300,fill=OUT,width=4); d.ellipse((145,49,158,62),fill=(102,225,211,255),outline=OUT,width=2)
 if i in (377,378):
  for x in range(70,185,18): poly(d,[(x,83),(x+8,48),(x+16,87)],tuple(max(20,c-20) for c in body[:3])+(255,),3)
 if i in (379,380):
  for x,y in ((88,91),(111,79),(139,93),(165,83),(99,142),(134,151),(171,136)): d.ellipse((x-8,y-6,x+8,y+6),fill=(72,69,57,190))
 return im
def make(i):
 if i<=364:return flat(i)
 if i in (365,366,367,370,376):return longpred(i)
 if i==368:return lantern()
 if i==369:return hatchet()
 if i==371:return pelican()
 if i==372:return tripod()
 return blob(i)
q=json.loads(QUE.read_text()); assert [x['id'] for x in q]==list(range(361,381)); m=json.loads(MAN.read_text()); assert len(m)==360 and m[-1]['id']==360
for x in q:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,381)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(381,401))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-381-400.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 361-380; next queue 381-400')
