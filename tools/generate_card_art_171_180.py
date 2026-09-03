from PIL import Image,ImageDraw,ImageEnhance
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; REN=ROOT/'app/src/main/assets/trash-art.js'
N={171:'Tambaqui',172:'Poisson-tigre goliath',173:'Poisson-tigre africain',174:'Perche du Nil',175:'Tilapia du Nil',176:'Tilapia bleu',177:'Poisson-éléphant',178:'Polyptère du Sénégal',179:'Polyptère orné',180:'Poisson-couteau clown'}
NEXT=[
(181,'Poisson-couteau noir','Poisson-couteau réel noir à brun sombre, corps très comprimé en lame, longue nageoire anale ondulante et petite tête, sujet entier isolé sans texte ni décor, style schématique existant.'),
(182,'Gourami géant','Grand gourami réel au corps haut gris-olive, lèvres épaisses et longues nageoires pelviennes filiformes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(183,'Gourami perlé','Gourami réel argenté couvert de petits points nacrés, bande sombre latérale et longues nageoires pelviennes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(184,'Gourami bleu','Gourami réel bleu argenté au corps comprimé, deux taches sombres et nageoires pelviennes filiformes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(185,'Combattant du Siam','Betta réel coloré au corps compact, très longues nageoires ondulantes rouges et bleues, sujet entier isolé sans texte ni décor, style schématique existant.'),
(186,'Poisson paradis','Macropode réel aux bandes rouges et bleues, nageoires longues et caudale fourchue, sujet entier isolé sans texte ni décor, style schématique existant.'),
(187,'Barbus cerise','Petit barbus réel rouge cerise à brun, corps fusiforme et ligne sombre latérale, sujet entier isolé sans texte ni décor, style schématique existant.'),
(188,'Barbus tigre','Petit barbus réel doré-orangé avec quatre bandes verticales noires et nageoires rouges, sujet entier isolé sans texte ni décor, style schématique existant.'),
(189,'Danio rerio','Petit danio réel argenté aux bandes horizontales bleu sombre, corps élancé et nageoires courtes, sujet entier isolé sans texte ni décor, style schématique existant.'),
(190,'Rasbora arlequin','Petite rasbora réelle cuivrée, corps comprimé et grande tache triangulaire noire sur l’arrière du flanc, sujet entier isolé sans texte ni décor, style schématique existant.')]
def load(i): return Image.open(ART/f'{i:03d}.webp').convert('RGBA')
def save(i,im): im.save(ART/f'{i:03d}.webp','WEBP',quality=82,method=6)
def tint(im,c,a=.22):
 over=Image.new('RGBA',im.size,c+(0,)); over.putalpha(im.getchannel('A').point(lambda x:int(x*a))); return Image.alpha_composite(im,over)
def fit(im,sx=1,sy=1):
 bb=im.getchannel('A').getbbox(); z=im.crop(bb).resize((max(1,int((bb[2]-bb[0])*sx)),max(1,int((bb[3]-bb[1])*sy))),Image.Resampling.LANCZOS); k=min(232/z.width,232/z.height,1); z=z.resize((int(z.width*k),int(z.height*k)),Image.Resampling.LANCZOS); o=Image.new('RGBA',(256,256),(0,0,0,0)); o.alpha_composite(z,((256-z.width)//2,(256-z.height)//2)); return o
def tiger(big=False):
 im=Image.new('RGBA',(256,256),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA'); cy=128; col=(151,168,168,255); d.ellipse((31,96,208,160),fill=col,outline=(25,28,30,255),width=3); d.polygon([(200,106),(240,84),(225,128),(241,164),(201,150)],fill=col,outline=(25,28,30,255)); d.polygon([(118,99),(143,70),(169,99)],fill=(130,145,145,240),outline=(25,28,30,255)); d.polygon([(105,157),(132,185),(155,157)],fill=(183,77,48,235),outline=(25,28,30,255)); d.ellipse((50,112,60,122),fill=(244,202,62,255),outline=(10,10,10,255),width=2); d.arc((33,120,80,151),0,110,fill=(28,20,20,255),width=3)
 for k in range(5 if big else 4): d.polygon([(39+k*7,139),(43+k*7,148),(47+k*7,139)],fill=(250,248,226,255))
 for x in range(92,185,28): d.line((x,105,x-10,151),fill=(45,54,54,90),width=5)
 return im
def elephant():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA'); col=(83,72,57,255); d.ellipse((52,79,201,177),fill=col,outline=(29,25,22,255),width=3); d.polygon([(191,100),(235,80),(216,130),(238,172),(192,154)],fill=col,outline=(29,25,22,255)); d.polygon([(126,83),(151,48),(175,84)],fill=col,outline=(29,25,22,255)); d.polygon([(70,133),(35,176),(60,129)],fill=col,outline=(29,25,22,255)); d.ellipse((71,105,80,114),fill=(240,194,60,255),outline=(10,10,10,255),width=2); d.line((62,145,45,186),fill=col,width=7); return im
def bichir(orn=False):
 im=Image.new('RGBA',(256,256),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA'); col=(64,72,59,255) if not orn else (42,45,38,255); d.rounded_rectangle((28,108,213,153),radius=22,fill=col,outline=(25,28,25,255),width=3); d.polygon([(204,114),(240,96),(225,131),(241,157),(205,147)],fill=col,outline=(25,28,25,255)); d.ellipse((45,119,53,127),fill=(243,199,62,255),outline=(10,10,10,255),width=2)
 for x in range(78,190,16): d.polygon([(x,109),(x+7,89),(x+14,109)],fill=col,outline=(25,28,25,255))
 d.polygon([(75,147),(96,176),(113,147)],fill=col,outline=(25,28,25,255)); d.polygon([(48,148),(33,169),(68,149)],fill=col,outline=(25,28,25,255))
 if orn:
  for x in range(66,196,20):
   for y in (119,137): d.ellipse((x,y,x+8,y+5),outline=(213,181,88,210),width=2)
 return im
def knife():
 im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA'); col=(166,177,181,255); d.ellipse((31,64,213,185),fill=col,outline=(26,29,31,255),width=3); d.polygon([(201,87),(236,104),(215,137),(235,164),(200,164)],fill=col,outline=(26,29,31,255)); d.polygon([(59,170),(190,201),(205,157),(67,155)],fill=(125,136,142,240),outline=(26,29,31,255)); d.ellipse((56,103,65,112),fill=(242,200,62,255),outline=(10,10,10,255),width=2)
 for x in (116,139,162,185): d.ellipse((x,125,x+15,141),fill=(35,38,40,240),outline=(238,238,225,230),width=2)
 return im
# 171 based on pacu
save(171,fit(tint(load(165),(92,90,72),.18),1.05,1.02)); save(172,tiger(True)); save(173,tiger(False)); save(174,fit(tint(load(132),(124,139,111),.20),1.07,1.03)); save(175,fit(tint(load(135),(117,123,89),.24),1,1.05)); save(176,fit(tint(load(136),(83,139,165),.28),1,1.05)); save(177,elephant()); save(178,bichir(False)); save(179,bichir(True)); save(180,knife())
manifest=json.loads(MAN.read_text('utf-8')); manifest=[e for e in manifest if not 171<=int(e['id'])<=180]
for i in range(171,181):
 p=ART/f'{i:03d}.webp';b=p.read_bytes();im=Image.open(p);assert im.size==(256,256);manifest.append({'id':i,'name':N[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:int(e['id']));MAN.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n','utf-8');r=REN.read_text('utf-8');r=re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f"GENERATED_IDS=new Set([{','.join(str(i) for i in range(1,181))}])",r);REN.write_text(r,'utf-8');(ART/'queue-171-180.json').unlink(missing_ok=True);(ART/'queue-181-190.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':ref} for i,n,ref in NEXT],ensure_ascii=False,indent=2)+'\n','utf-8');print('generated/finalized 171-180')
