from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-321-340.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(24,31,38,255)
def poly(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-6,y-6,x+6,y+6),fill=(238,197,57,255),outline=OUT,width=3); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def coast(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={321:(168,175,121,255),322:(172,180,185,255),323:(155,164,171,255),324:(151,154,173,255),325:(137,145,158,255)}; body=cols[i]; fin=(77,91,94,255); d.ellipse((45,82,207,171),fill=body,outline=OUT,width=5); poly(d,[(199,104),(237,87),(228,126),(237,166),(199,149)],fin); poly(d,[(85,91),(110,61),(151,91)],fin); poly(d,[(121,163),(145,188),(172,158)],fin); eye(d,67,110)
 if i==321:
  for y in (108,121,134): d.line((77,y,190,y+1),fill=(214,197,69,255),width=4)
 if i==322: d.rectangle((171,106,191,137),fill=(55,59,62,220))
 if i in (324,325): d.line((80,126,191,126),fill=(76,81,112,220),width=4)
 return im
def mullet(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={326:(159,157,132,255),327:(140,147,151,255),328:(133,145,147,255),329:(148,139,126,255),330:(158,166,169,255)}; body=cols[i]; fin=(70,83,87,255); d.ellipse((29,96,210,158),fill=body,outline=OUT,width=5); poly(d,[(201,105),(240,87),(230,127),(240,165),(201,147)],fin); poly(d,[(82,101),(102,75),(127,101)],fin); poly(d,[(139,100),(156,78),(175,102)],fin); poly(d,[(119,154),(139,178),(166,153)],fin); eye(d,50,116)
 if i==326: d.ellipse((56,103,65,112),fill=(220,189,69,255))
 if i==327: d.arc((27,117,68,146),15,110,fill=OUT,width=5)
 if i==329: d.arc((25,114,73,151),15,115,fill=OUT,width=6)
 if i==330: d.line((70,128,194,128),fill=(220,230,232,190),width=4)
 return im
def atherine():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(185,197,205,255); fin=(82,102,116,255); d.ellipse((28,108,211,145),fill=body,outline=OUT,width=4); poly(d,[(203,112),(240,98),(231,127),(240,156),(203,142)],fin); poly(d,[(93,109),(112,90),(134,109)],fin); poly(d,[(134,144),(153,163),(174,143)],fin); d.line((62,125,199,125),fill=(81,132,154,230),width=4); eye(d,49,120); return im
def remora(white=False):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(176,183,185,255) if white else (72,79,82,255); fin=(92,101,104,255) if white else (48,55,58,255); d.ellipse((34,95,210,158),fill=body,outline=OUT,width=5); poly(d,[(201,105),(239,89),(230,127),(239,165),(201,147)],fin); # sucker disc
 d.rounded_rectangle((55,79,116,103),radius=8,fill=(105,111,111,255) if white else (44,48,49,255),outline=OUT,width=4)
 for x in range(63,109,9): d.line((x,83,x,99),fill=(205,210,210,200) if white else (110,118,118,220),width=2)
 eye(d,56,119); return im
def pilot():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(162,170,170,255); fin=(52,62,68,255); d.ellipse((38,86,210,169),fill=body,outline=OUT,width=5); poly(d,[(200,103),(239,85),(229,127),(239,169),(200,149)],fin); poly(d,[(82,93),(107,61),(149,92)],fin); poly(d,[(119,162),(143,188),(172,157)],fin); eye(d,62,111)
 for x in (80,110,140,170): d.rectangle((x,88,x+12,164),fill=(44,51,58,220))
 return im
def flying(mode):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(111,145,169,255); fin=(54,92,129,255); d.ellipse((37,101,207,151),fill=body,outline=OUT,width=5); poly(d,[(199,108),(239,91),(230,126),(239,161),(199,145)],fin); # winglike pectorals
 poly(d,[(102,119),(144,54),(183,72),(147,127)],(69,111,151,210)); poly(d,[(110,137),(155,188),(185,173),(144,132)],(69,111,151,190)); eye(d,58,117)
 if mode=='striped':
  for x in (111,127,143,159): d.line((x,80,x+12,122),fill=(33,65,92,210),width=4)
 if mode=='tropical': d.line((75,127,192,127),fill=(50,170,187,230),width=4)
 return im
def jack(i):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={338:(146,157,162,255),339:(112,137,143,255),340:(157,165,167,255)}; body=cols[i]; fin=(59,76,87,255); tall=i==340; box=(42,70,208,180) if tall else (34,94,211,160); d.ellipse(box,fill=body,outline=OUT,width=5); poly(d,[(199,102),(241,82),(230,127),(241,171),(199,150)],fin); poly(d,[(82,96),(110,63),(151,96)],fin); poly(d,[(123,157),(146,187),(176,155)],fin); eye(d,64 if tall else 56,107 if tall else 115); return im
def make(i):
 if i<=325:return coast(i)
 if i<=330:return mullet(i)
 if i==331:return atherine()
 if i==332:return remora(False)
 if i==333:return remora(True)
 if i==334:return pilot()
 if i in (335,336,337):return flying('plain' if i==335 else ('striped' if i==336 else 'tropical'))
 return jack(i)
q=json.loads(QUE.read_text()); assert [x['id'] for x in q]==list(range(321,341)); m=json.loads(MAN.read_text()); assert len(m)==320 and m[-1]['id']==320
for x in q:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,341)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(341,361))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-341-360.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 321-340; next queue 341-360')
