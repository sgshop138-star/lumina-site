import re,sys
V=sys.argv[1] if len(sys.argv)>1 else '16'
css=open('style.css').read()
css=re.sub(r'/\*.*?\*/','',css,flags=re.S);css=re.sub(r'\s*\n\s*','',css).replace('?v=16','?v='+V)
h=open('index.src.html').read().replace('{{CSS}}',css).replace('{{V}}',V)
open('index.html','w').write(h)
a=open('app.js').read();a=re.sub(r"\?v=\d+","?v="+V,a);open('app.js','w').write(a)
print('built v'+V,len(h))
