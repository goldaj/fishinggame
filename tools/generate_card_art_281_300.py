from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; QUE=ART/'queue-281-300.json'; TRASH=ROOT/'app/src/main/assets/trash-art.js'; OUT=(24,31,38,255)
def poly(d,p,c,w=4): d.polygon(p,fill=c); d.line(p+[p[0]],fill=OUT,width=w,joint='curve')
def eye(d,x,y): d.ellipse((x-6,y-6,x+6,y+6),fill=(238,197,57,255),outline=OUT,width=3); d.ellipse((x-2,y-2,x+2,y+2),fill=OUT)
def billfish(kind):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); dark=kind=='black'; body=(60,73,90,255) if dark else (122,151,177,255); fin=(30,37,48,255) if dark else (44,72,105,255); d.ellipse((57,90,207,161),fill=body,outline=OUT,width=5); poly(d,[(198,102),(239,82),(228,126),(239,171),(198,149)],fin); poly(d,[(59,112),(8,120),(59,128)],body,4); sail=kind in ('sailA','sailB');
 if sail: poly(d,[(82,94),(96,38),(171,53),(187,98)],(38,70,115,255) if kind=='sailA' else (30,82,130,255))
 else: poly(d,[(85,95),(118,58),(172,93)],fin)
 poly(d,[(114,157),(138,185),(165,154)],fin); eye(d,76,112)
 if kind=='striped':
  for x in (103,120,137,154): d.line((x,98,x+8,151),fill=(45,83,120,220),width=4)
 return im
def needle(mode):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); body=(145,166,178,255) if mode!='green' else (82,135,112,255); dark=(40,64,76,255); d.ellipse((42,108,210,148),fill=body,outline=OUT,width=4); poly(d,[(202,111),(242,96),(231,127),(242,160),(202,145)],dark); poly(d,[(83,111),(103,88),(129,109)],dark); poly(d,[(125,146),(145,169),(169,145)],dark); eye(d,58,121)
 if mode=='half': poly(d,[(43,122),(10,128),(43,132)],body,3)
 else: poly(d,[(43,118),(8,118),(43,126)],body,3); poly(d,[(43,126),(8,132),(43,132)],body,3)
 if mode=='balaou': d.line((74,128,190,128),fill=(50,101,121,255),width=4)
 if mode=='silver': d.line((72,122,191,122),fill=(232,236,238,220),width=4)
 return im
def bass(mode):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); cols={'spot':(104,126,111,255),'stripe':(116,133,143,255),'white':(174,181,175,255),'black':(62,68,67,255),'moron':(126,143,148,255)}; body=cols[mode]; fin=(54,73,72,255); d.ellipse((35,84,208,171),fill=body,outline=OUT,width=5); poly(d,[(198,104),(237,87),(227,126),(237,166),(198,149)],fin); poly(d,[(78,91),(107,60),(147,91)],fin); poly(d,[(120,162),(142,188),(168,157)],fin); eye(d,61,111); d.arc((35,111,73,147),20,105,fill=OUT,width=3)
 if mode=='spot':
  for x,y in ((91,109),(111,101),(132,114),(153,105),(171,117)): d.ellipse((x-3,y-3,x+3,y+3),fill=(40,58,54,230))
 if mode in ('stripe','moron'):
  for y in (111,124,137): d.line((76,y,190,y+2),fill=(45,69,81,220),width=4)
 return im
def snapper(mode):
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im); base={'gray':(120,126,122,255),'dog':(118,104,89,255),'yellow':(190,156,77,255),'mutton':(180,116,92,255),'cubera':(116,79,66,255),'mangrove':(132,91,70,255),'twospot':(185,124,93,255)}[mode]; fin=(128,62,48,255) if mode not in ('gray','yellow') else ((70,82,78,255) if mode=='gray' else (227,190,42,255)); d.ellipse((37,82,208,171),fill=base,outline=OUT,width=5); poly(d,[(198,102),(238,84),(228,126),(238,170),(198,149)],fin); poly(d,[(79,91),(107,61),(151,91)],fin); poly(d,[(119,163),(142,189),(170,156)],fin); eye(d,61,111); d.arc((36,111,74,146),20,105,fill=OUT,width=3)
 if mode=='dog': poly(d,[(49,137),(55,128),(61,137)],(240,238,220,255),2)
 if mode=='yellow': d.line((73,126,196,126),fill=(241,204,49,255),width=6)
 if mode=='mutton': d.line((73,101,177,145),fill=(65,93,112,210),width=4)
 if mode=='twospot':
  for x in (135,162): d.ellipse((x-7,100,x+7,114),fill=(45,50,54,235))
 return im
def make(i):
 if i==281:return billfish('striped')
 if i==282:return billfish('sailA')
 if i==283:return billfish('sailB')
 if i==284:return needle('silver')
 if i==285:return needle('green')
 if i==286:return needle('balaou')
 if i in (287,288):return needle('half' if i==287 else 'silver')
 if i==289:return bass('spot')
 if i==290:return bass('stripe')
 if i==291:return bass('white')
 if i==292:return bass('black')
 if i==293:return bass('moron')
 modes={294:'gray',295:'dog',296:'yellow',297:'mutton',298:'cubera',299:'mangrove',300:'twospot'}; return snapper(modes[i])
q=json.loads(QUE.read_text()); assert [x['id'] for x in q]==list(range(281,301)); m=json.loads(MAN.read_text()); assert len(m)==280 and m[-1]['id']==280
for x in q:
 i=x['id']; p=ART/f'{i:03d}.webp'; make(i).save(p,'WEBP',quality=86,method=6); raw=p.read_bytes(); m.append({'id':i,'name':x['name'],'file':p.name,'width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(raw).hexdigest()})
MAN.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':'))+'\n'); s=TRASH.read_text(); s=re.sub(r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)','GENERATED_IDS=new Set(['+','.join(map(str,range(1,301)))+'])',s); TRASH.write_text(s)
nextq=json.loads(Path('/tmp/next-card-art.json').read_text()); assert [x['id'] for x in nextq]==list(range(301,321))
for x in nextq: x.update(file=f"{x['id']:03d}.webp",status='generation-pending',reference=f"{x['name']} : illustration schématique fidèle à l’espèce, sujet entier isolé sans texte ni décor, fond transparent.")
(ART/'queue-301-320.json').write_text(json.dumps(nextq,ensure_ascii=False,indent=2)+'\n'); QUE.unlink(); print('generated 281-300; next queue 301-320')
