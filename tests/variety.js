// Usage: node tests/variety.js palette-shelf.html [N]  -> per-preset repetition metrics over N shuffles with default settings (see REVIEW.md, preset variety audit)
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');let js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));js=js.replace(/render\(\);paintThemeBtn\(\);[\s\S]*$/,'');
global.localStorage={getItem:()=>null,setItem(){}};global.document={addEventListener(){},getElementById:()=>null,documentElement:{dataset:{}},querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>({})};global.window={};global.navigator={};global.matchMedia=()=>({matches:false,addEventListener(){}});
eval(js+`;globalThis.API={oklch,oklab,genRandom,ui,PRESETS}`);
const {oklch:OKLCH,oklab:OKLAB,genRandom:GEN,ui:UI,PRESETS:PR}=API,N=+process.argv[3]||60;
const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const rows=[];
for(const k of Object.keys(PR)){
  const pals=[];for(let s=1;s<=N;s++){const r=GEN({...UI.rand,preset:k,seed:s*7919});pals.push(r.filter(g=>!g.neutral).flatMap(g=>g.colors))}
  const fam=[];for(let s=1;s<=N;s++){const r=GEN({...UI.rand,preset:k,seed:s*7919});fam.push([...new Set(r.famH.map(h=>Math.floor(((h%360)+360)%360/30)))].sort().join(','))}
  const labs=pals.map(p=>p.map(OKLAB));
  // palette distance: mean over colours of distance to nearest colour in the other palette (symmetric)
  const pd=(A,B)=>(A.reduce((s,a)=>s+Math.min(...B.map(b=>d(a,b))),0)/A.length+B.reduce((s,b)=>s+Math.min(...A.map(a=>d(a,b))),0)/B.length)/2;
  let tot=0,n=0,min=1;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const v=pd(labs[i],labs[j]);tot+=v;n++;if(v<min)min=v}
  const hb=new Set(),cs=[];pals.flat().forEach(c=>{const o=OKLCH(c);if(o.C>=.04)hb.add(Math.floor(o.H/15));cs.push(o.C)});
  const famSets=new Set(fam).size, top=Object.entries(fam.reduce((m,x)=>(m[x]=(m[x]||0)+1,m),{})).sort((a,b)=>b[1]-a[1])[0];
  rows.push({k,dist:+(tot/n).toFixed(3),minDist:+min.toFixed(3),hueBins:hb.size+'/24',famSets:famSets+'/'+N,topSet:Math.round(top[1]/N*100)+'%',meanC:+(cs.reduce((a,b)=>a+b,0)/cs.length).toFixed(3)});
}
console.table(rows);
