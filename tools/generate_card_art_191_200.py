from PIL import Image,ImageDraw
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'app/src/main/assets/card-art'; MAN=ART/'manifest.json'; REN=ROOT/'app/src/main/assets/trash-art.js'
N={191:'Néon bleu',192:'Cardinalis',193:'Tétra empereur',194:'Tétra citron',195:'Tétra fantôme noir',196:'Tétra du Congo',197:'Discus',198:'Scalaire',199:'Oscar',200:'Cichlidé jaguar'}
NEXT=[
(201,'Cichlidé paon','Cichlidé africain réel vivement coloré bleu et jaune, corps haut et nageoire dorsale longue, sujet entier isolé sans texte ni décor, style schématique existant.'),
(202,'Cichlidé zébré','Cichlidé réel bleu clair parcouru de bandes verticales noires nettes, corps trapu et nageoire dorsale épineuse, sujet entier isolé sans texte ni décor, style schématique existant.'),
(203,'Cichlidé perroquet rouge','Cichlidé hybride réel orange à rouge vif, corps arrondi et bouche courte en bec, sujet entier isolé sans texte ni décor, style schématique existant.'),
(204,'Frontosa','Grand cichlidé réel bleu-gris à bandes verticales noires, front bombé et longues nageoires, sujet entier isolé sans texte ni décor, style schématique existant.'),
(205,'Labidochromis jaune','Petit cichlidé africain jaune vif, corps allongé et liserés noirs sur les nageoires, sujet entier isolé sans texte ni décor, style schématique existant.'),
(206,'Mbuna bleu','Petit cichlidé africain bleu électrique avec bandes sombres, corps robuste et nageoire dorsale longue, sujet entier isolé sans texte ni décor, style schématique existant.'),
(207,'Poisson arc-en-ciel de Boeseman','Poisson arc-en-ciel réel bicolore bleu à l’avant et jaune-orangé à l’arrière, corps haut et nageoires colorées, sujet entier isolé sans texte ni décor, style schématique existant.'),
(208,'Poisson arc-en-ciel rouge','Poisson arc-en-ciel réel rouge-orangé vif, corps haut argenté-rouge et nageoires rouges, sujet entier isolé sans texte ni décor, style schématique existant.'),
(209,'Killie clown','Petit killie réel crème à bandes verticales noires, nageoires rouges et bleues très colorées, sujet entier isolé sans texte ni décor, style schématique existant.'),
(210,'Killie de Gardner','Petit killie réel bleu-vert couvert de points rouges et jaunes, nageoires colorées, sujet entier isolé sans texte ni décor, style schématique existant.')]
def C(): return Image.new('RGBA',(256,256),(0,0,0,0))
def save(i,im): im.save(ART/f'{i:03d}.webp','WEBP',quality=82,method=6)
def tetra(body=(175,184,187),stripe=None,red=None,tall=False):
 im=C(); d=ImageDraw.Draw(im,'RGBA'); y0,y1=(89,169) if tall else (105,153); d.ellipse((48,y0,194,y1),fill=body+(255,),outline=(25,28,30,255),width=3); d.polygon([(187,112),(232,92),(214,130),(233,162),(188,146)],fill=body+(255,),outline=(25,28,30,255)); d.polygon([(111,y0+3),(135,y0-24),(159,y0+3)],fill=body+(235,),outline=(25,28,30,255)); d.ellipse((64,115,73,124),fill=(242,198,61,255),outline=(10,10,10,255),width=2)
 if stripe:d.line((72,130,185,130),fill=stripe+(230,),width=6)
 if red:d.polygon([(115,133),(186,136),(179,150),(111,148)],fill=red+(180,))
 return im
def discus():
 im=C();d=ImageDraw.Draw(im,'RGBA');d.ellipse((56,45,194,207),fill=(186,96,70,255),outline=(30,25,25,255),width=4);d.polygon([(185,85),(229,128),(188,170)],fill=(176,83,64,240),outline=(30,25,25,255));d.ellipse((81,102,91,112),fill=(246,205,64,255),outline=(10,10,10,255),width=2)
 for x in (87,112,138,165):d.line((x,67,x-8,185),fill=(69,60,55,120),width=5)
 return im
def angel():
 im=C();d=ImageDraw.Draw(im,'RGBA');col=(180,185,184,255);d.polygon([(67,95),(128,43),(188,95),(199,134),(168,162),(126,218),(91,160),(58,132)],fill=col,outline=(28,30,30,255));d.polygon([(118,58),(126,11),(137,67)],fill=col,outline=(28,30,30,255));d.polygon([(114,171),(124,239),(138,168)],fill=col,outline=(28,30,30,255));d.ellipse((78,107,88,117),fill=(243,199,62,255),outline=(10,10,10,255),width=2)
 for x in (91,123,155):d.line((x,77,x-5,170),fill=(43,45,46,185),width=6)
 return im
def cichlid(body,pattern='oscar'):
 im=C();d=ImageDraw.Draw(im,'RGBA');d.ellipse((40,79,202,178),fill=body+(255,),outline=(27,28,29,255),width=3);d.polygon([(192,100),(236,77),(219,131),(238,181),(191,156)],fill=body+(255,),outline=(27,28,29,255));d.polygon([(93,84),(122,50),(174,83)],fill=body+(240,),outline=(27,28,29,255));d.ellipse((63,107,74,118),fill=(244,199,61,255),outline=(10,10,10,255),width=2)
 if pattern=='oscar':
  for x,y in ((91,105),(123,137),(149,103),(176,142),(111,158)):d.ellipse((x-8,y-6,x+10,y+7),fill=(199,78,42,190))
 else:
  for x,y in ((88,106),(105,139),(130,99),(147,144),(171,118),(185,151)):d.ellipse((x-5,y-4,x+7,y+5),fill=(24,26,27,200))
 return im
save(191,tetra((152,174,181),(42,124,205),(190,51,57),False));save(192,tetra((148,166,176),(45,123,205),(208,45,55),False));save(193,tetra((138,126,156),(38,39,48),None,False));save(194,tetra((220,203,83),(184,170,49),None,False));save(195,tetra((156,161,165),(49,50,52),None,True));save(196,tetra((110,139,170),(205,111,62),None,True));save(197,discus());save(198,angel());save(199,cichlid((77,66,58),'oscar'));save(200,cichlid((153,137,104),'jaguar'))
manifest=json.loads(MAN.read_text('utf-8'));manifest=[e for e in manifest if not 191<=int(e['id'])<=200]
for i in range(191,201):
 p=ART/f'{i:03d}.webp';b=p.read_bytes();im=Image.open(p);assert im.size==(256,256);manifest.append({'id':i,'name':N[i],'file':f'{i:03d}.webp','width':256,'height':256,'transparent':True,'sha256':hashlib.sha256(b).hexdigest()})
manifest.sort(key=lambda e:int(e['id']));MAN.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n','utf-8');r=REN.read_text('utf-8');r=re.sub(r'GENERATED_IDS=new Set\(\[[^\]]*\]\)',f"GENERATED_IDS=new Set([{','.join(str(i) for i in range(1,201))}])",r);REN.write_text(r,'utf-8');(ART/'queue-191-200.json').unlink(missing_ok=True);(ART/'queue-201-210.json').write_text(json.dumps([{'id':i,'name':n,'file':f'{i:03d}.webp','status':'generation-pending','reference':ref} for i,n,ref in NEXT],ensure_ascii=False,indent=2)+'\n','utf-8');print('generated/finalized 191-200')
