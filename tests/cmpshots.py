import sys,os
from PIL import Image,ImageChops
a,b=sys.argv[1],sys.argv[2];bad=[]
for f in sorted(os.listdir(a)):
    if not f.endswith('.png'):continue
    A=Image.open(os.path.join(a,f)).convert('RGB');B=Image.open(os.path.join(b,f)).convert('RGB')
    if A.size!=B.size:bad.append((f,'size',A.size,B.size));continue
    d=ImageChops.difference(A,B);bb=d.getbbox()
    if bb:
        px=sum(1 for p in list(d.getdata()) if p!=(0,0,0));bad.append((f,px,bb))
print('compared',len([f for f in os.listdir(a) if f.endswith('.png')]),'differ',len(bad))
for x in bad:print(' ',x)
