from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-341-360.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(24,31,38,255)
def poly(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-5,y-5,x+5,y+5),fill=(238,197,57,255),outline=OUT,width=2); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def jack(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={341:(66,126,162,255),342:(62,67,70,255),343:(126,151,151,255),344:(205,165,60,255),345:(89,157,151,255),346:(146,151,145,255)}; body=cols[i]; fin=(51,73,86,255); d.ellipse((42,74,207,181),fill=body,outline=OUT,width=5); poly(d,[(197,99),(240,80),(229,127),(240,174),(197,151)],fin); poly(d,[(82,88),(109,54),(149,87)],fin); poly(d,[(121,168),(145,195),(173,162)],fin); eye(d,64,107)
 if i==343:
  for x,y in ((91,103),(112,115),(135,97),(158,119),(179,105)): d.ellipse((x-4,y-4,x+4,y+4),fill=(31,111,178,235))
 if i==344: d.line((72,132,190,132),fill=(242,210,74,255),width=5)
 if i==345:
  d.line((74,112,190,112),fill=(62,112,190,230),width=4); d.line((75,131,191,131),fill=(230,191,57,230),width=4)
 return im
def flatfish(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
 cols={347:(132,112,86,255),348:(108,100,80,255),349:(111,102,88,255),350:(58,63,65,255),351:(78,76,72,255),352:(132,115,96,255),353:(137,111,90,255),354:(151,121,88,255),355:(136,113,82,255),356:(151,112,74,255),357:(127,98,69,255),358:(121,102,81,255),359:(146,86,73,255),360:(152,128,92,255)}; body=cols[i]
 # asymmetrical oval flatfish silhouette
 pts=[(27,128),(43,94),(82,72),(145,71),(198,94),(232,126),(207,157),(151,177),(83,173),(43,153)]
 poly(d,pts,body,5); poly(d,[(199,102),(238,92),(224,126),(238,160),(199,151)],tuple(max(20,c-20) for c in body[:3])+(255,)); eye(d,70,103); eye(d,88,110); d.arc((29,119,72,145),20,105,fill=OUT,width=3)
 if i in (347,348,357):
  for x,y in ((105,96),(126,122),(150,94),(174,130),(118,151),(84,139)): d.ellipse((x-4,y-4,x+4,y+4),fill=(67,60,49,180))
 if i==348:
  for x,y in ((110,97),(144,112),(171,142)): d.line((x-5,y,x+5,y),fill=(225,215,175,230),width=2); d.line((x,y-5,x,y+5),fill=(225,215,175,230),width=2)
 if i==353:
  for x,y in ((109,98),(151,101),(119,149),(169,140)): d.ellipse((x-6,y-5,x+6,y+5),fill=(54,49,44,230))
 if i==359: d.line((76,134,196,134),fill=(199,104,83,220),width=5)
 return im
def make(i): return jack(i) if i<=346 else flatfish(i)
q=json.loads(QUE.read_text()); assert [x['id'] for x in q]==list(range(341,361)); m=json.loads(MAN.read_text()); assert len(m)==340 and m[-1]['id']==340
for x in q:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,361)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(361,381))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-361-380.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 341-360; next queue 361-380')
