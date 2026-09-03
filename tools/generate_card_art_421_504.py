from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, json, math, re

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'app/src/main/assets/card-art'
MAN = ART / 'manifest.json'
QUEUE = ART / 'queue-421-460.json'
TRASH = ROOT / 'app/src/main/assets/trash-art.js'
SOURCE = Path('/tmp/missing-card-art.json')
OUT = (23, 30, 37, 255)


def clamp(v):
    return max(24, min(238, int(v)))


def palette(i):
    h = (i * 47 + 31) % 360
    import colorsys
    r, g, b = colorsys.hsv_to_rgb(h / 360.0, 0.52 + (i % 3) * 0.06, 0.72 + (i % 4) * 0.045)
    base = (clamp(r * 255), clamp(g * 255), clamp(b * 255), 255)
    dark = tuple(clamp(c * 0.68) for c in base[:3]) + (255,)
    light = tuple(clamp(c + (255 - c) * 0.38) for c in base[:3]) + (255,)
    accent = (clamp(base[2] + 35), clamp(base[0] + 28), clamp(base[1] + 18), 255)
    return base, dark, light, accent


def poly(d, points, fill, width=4):
    d.polygon(points, fill=fill)
    d.line(points + [points[0]], fill=OUT, width=width, joint='curve')


def eye(d, x, y):
    d.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(242, 205, 75, 255), outline=OUT, width=3)
    d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=OUT)


def fish(i, deep=False, longfin=False, stripes=False):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    box = (53, 55, 196, 198) if deep else (42, 79, 199, 175)
    d.ellipse(box, fill=base, outline=OUT, width=5)
    poly(d, [(189, 96), (234, 72), (224, 127), (234, 183), (189, 157)], dark)
    if deep:
        poly(d, [(91, 72), (119, 28 if longfin else 42), (162, 70)], dark)
        poly(d, [(103, 184), (135, 226 if longfin else 210), (175, 174)], dark)
    else:
        poly(d, [(86, 90), (112, 55), (151, 86)], dark)
        poly(d, [(108, 166), (137, 196), (169, 160)], dark)
    eye(d, 73 if not deep else 83, 104 if not deep else 94)
    d.arc((43, 104, 78, 144), 285, 65, fill=OUT, width=3)
    if stripes:
        for x in (102, 129, 156):
            d.line((x, 70 if deep else 84, x + 6, 185 if deep else 169), fill=light, width=8)
    else:
        for x, y in ((112, 112), (145, 91), (159, 139)):
            d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=accent)
    return im


def triggerfish(i):
    im = fish(i, deep=True, stripes=(i % 2 == 0)); d = ImageDraw.Draw(im)
    _, dark, light, accent = palette(i)
    poly(d, [(108, 59), (119, 23), (131, 60)], dark, 3)
    d.line((84, 126, 181, 127), fill=accent, width=5)
    if i % 3 == 0:
        for x, y in ((113, 96), (140, 113), (164, 91), (151, 151)):
            d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=light, outline=OUT, width=2)
    return im


def shark(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    body = [(31, 126), (65, 96), (126, 82), (188, 93), (215, 113), (232, 91), (226, 126), (234, 160), (211, 143), (181, 158), (112, 163), (60, 151)]
    poly(d, body, base, 5)
    poly(d, [(120, 87), (145, 47), (158, 94)], dark)
    poly(d, [(109, 159), (139, 190), (155, 157)], dark)
    poly(d, [(161, 150), (184, 179), (190, 144)], dark)
    eye(d, 67, 117)
    d.line((48, 136, 79, 139), fill=OUT, width=3)
    for x in (87, 94, 101):
        d.line((x, 129, x + 3, 143), fill=dark, width=2)
    if i % 3 == 1:
        for x in (104, 127, 150): d.line((x, 89, x + 17, 158), fill=light, width=4)
    elif i % 3 == 2:
        for x, y in ((113, 108), (139, 126), (165, 104), (179, 133)):
            d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=accent)
    return im


def ray(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    pts = [(27, 120), (76, 70), (128, 91), (180, 70), (229, 120), (179, 167), (132, 146), (79, 168)]
    poly(d, pts, base, 5)
    d.line((129, 143, 186, 218), fill=OUT, width=6)
    d.line((129, 143, 186, 218), fill=dark, width=3)
    eye(d, 105, 112); eye(d, 149, 112)
    d.arc((105, 120, 151, 146), 20, 160, fill=OUT, width=3)
    for x, y in ((72, 116), (91, 91), (165, 91), (185, 120)):
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=accent)
    return im


def octopus(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    d.ellipse((75, 46, 181, 157), fill=base, outline=OUT, width=5)
    eye(d, 108, 94); eye(d, 149, 94)
    for n in range(8):
        x = 82 + n * 13
        y2 = 214 - (n % 3) * 14
        d.line((x, 139, x - 10 + (n % 2) * 18, y2), fill=OUT, width=14)
        d.line((x, 139, x - 10 + (n % 2) * 18, y2), fill=base if n % 2 else dark, width=8)
    for x, y in ((99, 69), (134, 62), (160, 124)):
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=accent)
    return im


def squid(i, cuttle=False):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    if cuttle:
        d.ellipse((56, 62, 196, 168), fill=base, outline=OUT, width=5)
        eye(d, 82, 104)
        start = 89
    else:
        poly(d, [(70, 126), (127, 39), (187, 126), (165, 171), (91, 171)], base, 5)
        eye(d, 104, 118); eye(d, 146, 118)
        start = 95
    for n in range(7):
        x = start + n * 11
        d.line((x, 158, x - 15 + (n % 3) * 13, 218), fill=OUT, width=9)
        d.line((x, 158, x - 15 + (n % 3) * 13, 218), fill=dark, width=5)
    return im


def nautilus(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    d.ellipse((52, 48, 190, 187), fill=light, outline=OUT, width=5)
    d.ellipse((77, 72, 166, 162), fill=base, outline=OUT, width=4)
    d.arc((91, 86, 151, 147), 10, 350, fill=dark, width=7)
    d.arc((105, 100, 140, 135), 10, 340, fill=OUT, width=4)
    poly(d, [(157, 119), (202, 103), (210, 158), (165, 166)], dark, 4)
    eye(d, 177, 128)
    for n in range(6): d.line((183, 153, 177 + n * 6, 211 - n * 5), fill=OUT, width=4)
    return im


def crustacean(i, crab=False):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    if crab:
        d.ellipse((72, 78, 185, 166), fill=base, outline=OUT, width=5)
        for side in (-1, 1):
            sx = 86 if side < 0 else 171
            for n in range(4):
                y = 112 + n * 13
                ex = 29 if side < 0 else 228
                d.line((sx, y, ex, y + (n - 1) * 8), fill=OUT, width=7)
                d.line((sx, y, ex, y + (n - 1) * 8), fill=dark, width=4)
        poly(d, [(78, 105), (42, 75), (24, 99), (58, 126)], dark, 4)
        poly(d, [(181, 105), (216, 75), (234, 99), (198, 126)], dark, 4)
        eye(d, 108, 92); eye(d, 149, 92)
    else:
        d.ellipse((62, 87, 184, 154), fill=base, outline=OUT, width=5)
        poly(d, [(179, 104), (217, 91), (232, 123), (204, 145), (177, 136)], dark, 4)
        eye(d, 82, 105)
        for n in range(6):
            x = 82 + n * 16
            d.line((x, 145, x - 15, 186), fill=OUT, width=6)
            d.line((x, 145, x - 15, 186), fill=dark, width=3)
        d.line((72, 103, 27, 69), fill=OUT, width=3); d.line((72, 108, 24, 99), fill=OUT, width=3)
    return im


def shell(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    pts = [(43, 166), (62, 93), (91, 62), (128, 51), (166, 63), (196, 94), (215, 166), (128, 193)]
    poly(d, pts, base, 5)
    for x in (76, 101, 128, 155, 181): d.line((128, 187, x, 79), fill=light, width=5)
    d.line((47, 165, 211, 165), fill=OUT, width=5)
    return im


def urchin(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i); cx = cy = 128
    for a in range(0, 360, 15):
        r1, r2 = 53, 104
        x1 = cx + math.cos(math.radians(a)) * r1; y1 = cy + math.sin(math.radians(a)) * r1
        x2 = cx + math.cos(math.radians(a)) * r2; y2 = cy + math.sin(math.radians(a)) * r2
        d.line((x1, y1, x2, y2), fill=OUT, width=4)
        d.line((x1, y1, x2, y2), fill=dark, width=2)
    d.ellipse((72, 72, 184, 184), fill=base, outline=OUT, width=5)
    return im


def starfish(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i); cx = cy = 128; pts = []
    for n in range(10):
        a = math.radians(-90 + n * 36); r = 92 if n % 2 == 0 else 38
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    poly(d, pts, base, 5)
    for x, y in ((128, 92), (100, 130), (156, 130), (128, 157)):
        d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=accent)
    return im


def jelly(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    d.pieslice((55, 42, 201, 183), 180, 360, fill=base, outline=OUT, width=5)
    d.line((56, 113, 200, 113), fill=OUT, width=5)
    for n in range(7):
        x = 71 + n * 20
        endx = x + (-14 if n % 2 else 14)
        d.line((x, 112, endx, 220 - (n % 3) * 14), fill=OUT, width=6)
        d.line((x, 112, endx, 220 - (n % 3) * 14), fill=light, width=3)
    return im


def serpent(i):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    pts = [(27, 155), (65, 108), (107, 142), (148, 91), (198, 112), (228, 77)]
    d.line(pts, fill=OUT, width=31, joint='curve'); d.line(pts, fill=base, width=22, joint='curve')
    d.ellipse((201, 62, 242, 101), fill=base, outline=OUT, width=5); eye(d, 226, 76)
    for x, y in pts[1:-1]: d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=accent)
    return im


def reptile(i):
    im = shark(i); d = ImageDraw.Draw(im); base, dark, light, accent = palette(i)
    d.ellipse((33, 111, 70, 143), fill=base, outline=OUT, width=4)
    for x, y, s in ((109, 95, -1), (111, 151, 1), (160, 101, -1), (161, 150, 1)):
        poly(d, [(x, y), (x + 28, y + s * 25), (x + 33, y + s * 4)], dark, 3)
    return im


def leviathan(i):
    im = fish(i, deep=(i % 2 == 0), longfin=True, stripes=(i % 3 == 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    for x in range(91, 174, 20):
        poly(d, [(x, 72), (x + 9, 34 - (x % 13)), (x + 17, 76)], accent, 3)
    d.arc((64, 102, 105, 144), 280, 70, fill=OUT, width=5)
    return im


def trash(i, kind):
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base, dark, light, accent = palette(i)
    if kind == 'trash-bottle':
        poly(d, [(102, 35), (151, 35), (151, 72), (174, 96), (174, 211), (82, 211), (82, 96), (103, 72)], base, 6)
        d.rectangle((99, 35, 154, 58), fill=dark, outline=OUT, width=4)
        d.rectangle((92, 123, 164, 164), fill=light, outline=OUT, width=3)
    elif kind == 'trash-can':
        d.ellipse((73, 50, 183, 82), fill=dark, outline=OUT, width=5)
        poly(d, [(76, 66), (180, 66), (169, 211), (87, 211)], base, 6)
        for y in (103, 146, 185): d.line((88, y, 169, y), fill=light, width=5)
    elif kind in ('trash-tire', 'trash-boot'):
        d.ellipse((47, 47, 209, 209), fill=dark, outline=OUT, width=6)
        d.ellipse((88, 88, 168, 168), fill=(0, 0, 0, 0), outline=OUT, width=6)
        for a in range(0, 360, 45):
            x1 = 128 + math.cos(math.radians(a)) * 50; y1 = 128 + math.sin(math.radians(a)) * 50
            x2 = 128 + math.cos(math.radians(a)) * 74; y2 = 128 + math.sin(math.radians(a)) * 74
            d.line((x1, y1, x2, y2), fill=light, width=5)
    else:
        poly(d, [(75, 49), (166, 36), (197, 107), (173, 202), (71, 186), (51, 106)], light, 6)
        d.line((75, 49, 173, 202), fill=accent, width=4); d.line((166, 36, 71, 186), fill=accent, width=4)
    return im


def make(item):
    i = int(item['id']); name = item['name'].lower(); kind = item.get('assetKind') or ''
    if item.get('isTrash') or i >= 1001:
        return trash(i, kind)
    if 'requin' in name or 'mégalodon' in name:
        return shark(i)
    if 'raie' in name:
        return ray(i)
    if 'poulpe' in name or 'kraken' in name:
        return octopus(i)
    if 'nautile' in name:
        return nautilus(i)
    if 'calmar' in name or 'seiche' in name or 'architeuthis' in name:
        return squid(i, 'seiche' in name)
    if any(w in name for w in ('crevette', 'langoustine', 'homard')):
        return crustacean(i, False)
    if 'crabe' in name:
        return crustacean(i, True)
    if any(w in name for w in ('tridacne', 'coquille', 'palourde', 'moule', 'huître')):
        return shell(i)
    if 'oursin' in name:
        return urchin(i)
    if 'étoile de mer' in name:
        return starfish(i)
    if 'méduse' in name:
        return jelly(i)
    if 'serpent' in name or 'anguille' in name:
        return serpent(i)
    if any(w in name for w in ('mosasaure', 'plésiosaure', 'ichtyosaure', 'basilosaure')):
        return reptile(i)
    if any(w in name for w in ('baliste', 'cocher', 'idole des maures')):
        return triggerfish(i)
    if 'poisson-ange' in name:
        return fish(i, deep=True, longfin=True, stripes=(i % 2 == 0))
    if any(w in name for w in ('léviathan', 'abyss', 'thalass', 'foss', 'chronoc', 'maréo', 'ondrake', 'corallophage', 'noctiraie', 'pélagocitadelle')) or i >= 491:
        return leviathan(i)
    return fish(i, deep=(i % 5 == 0), stripes=(i % 4 == 0))


items = json.loads(SOURCE.read_text(encoding='utf-8'))
expected_ids = list(range(421, 501)) + [1001, 1002, 1003, 1004]
assert [int(x['id']) for x in items] == expected_ids
manifest = json.loads(MAN.read_text(encoding='utf-8'))
assert len(manifest) == 420 and manifest[-1]['id'] == 420
queued = json.loads(QUEUE.read_text(encoding='utf-8'))
assert [int(x['id']) for x in queued] == list(range(421, 461))

for item in items:
    i = int(item['id'])
    p = ART / f'{i:03d}.webp'
    make(item).save(p, 'WEBP', quality=88, method=6)
    raw = p.read_bytes()
    manifest.append({
        'id': i,
        'name': item['name'],
        'file': p.name,
        'width': 256,
        'height': 256,
        'transparent': True,
        'sha256': hashlib.sha256(raw).hexdigest(),
    })

MAN.write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
ids = list(range(1, 501)) + [1001, 1002, 1003, 1004]
s = TRASH.read_text(encoding='utf-8')
s, n = re.subn(
    r'GENERATED_IDS\s*=\s*new Set\(\[[^\]]*\]\)',
    'GENERATED_IDS=new Set([' + ','.join(map(str, ids)) + '])',
    s,
    count=1,
)
assert n == 1
TRASH.write_text(s, encoding='utf-8')
QUEUE.unlink()
print('generated 421-500 and trash 1001-1004; card-art manifest is complete at 504/504')
