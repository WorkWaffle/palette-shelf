// Usage: node baseline.js <page.html> <cutMarkerRegex> <out.json>
const fs=require('fs');const [,,page,cut,outp]=process.argv;
const html=fs.readFileSync(page,'utf8');let js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
js=js.replace(new RegExp(cut+'[\\s\\S]*$'),'');
// deterministic Math.random
let seed=1;Math.random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
global.localStorage={getItem:()=>null,setItem(){}};global.document={addEventListener(){},getElementById:()=>null,documentElement:{dataset:{}},querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>({})};
global.window={};global.navigator={};global.matchMedia=()=>({matches:false,addEventListener(){}});global.Blob=require('buffer').Blob;
const R={};
eval(js+`
const up='/root/.claude/uploads/ea685d34-b130-5f53-be8b-5c4c4a1d9a70/';
const base={...ui.rand};
const presets=Object.keys(PRESETS);
const gens=[];
for(const preset of presets)for(const spread of ['auto','mono','analogous','comp','split','triad','tetrad','custom'])for(const s of [3,77]){
  const o={...base,preset,spread,seed:s,baseHue:s===77?'235':'auto',customHues:['25','145','265']};gens.push([preset,spread,s,genRandom(o).map(g=>[g.name,g.colors])]);}
for(const legible of ['3','4.5','7'])for(const legAim of ['dark','balanced','light','none'])for(const legHues of [false,true])for(const neutral of [true,false]){
  const o={...base,preset:'none',seed:11,legible,legAim,legHues,neutral};gens.push(['leg',legible,legAim,legHues,neutral,genRandom(o).map(g=>[g.name,g.colors])]);}
for(const sat of ['auto','muted','balanced','vivid'])for(const mood of ['auto','dark','full','light'])for(const temp of ['any','warm','cool']){
  const o={...base,preset:'sixties',seed:5,sat,mood,temp};gens.push(['look',sat,mood,temp,genRandom(o).map(g=>[g.name,g.colors])]);}
for(const ramps of [true,false])for(const sortL of [true,false])for(const nTint of ['auto','0','1'])for(const nStrength of ['auto','none','subtle','tinted','strong']){
  const o={...base,preset:'earthy',seed:9,ramps,sortL,nTint,nStrength,count:20,shift:25};gens.push(['struct',ramps,sortL,nTint,nStrength,genRandom(o).map(g=>[g.name,g.colors])]);}
for(const cvd of [false,true])for(const proj of [false,true])for(const count of [8,16]){const o={...base,preset:'computing90',seed:21,cvd,proj,count};gens.push(['acc',cvd,proj,count,genRandom(o).map(g=>[g.name,g.colors])]);}
for(const mh of ['auto','72','custom'])for(const em of [true,false]){const o={...base,preset:'monoscreen',seed:2,monoHue:mh,monoDeg:300,emissive:em};gens.push(['mono',mh,em,genRandom(o).map(g=>[g.name,g.colors])]);}
gens.push(['seeds',genRandom({...base,seed:4,seeds:'#c4551f #1f6f78 #333333'}).map(g=>[g.name,g.colors])]);
R.gens=gens;
// saved palettes as styles
const ennis={id:'E',name:'Ennis',updated:1,groups:[{id:'g1',name:'Main',colors:['#e2e9bb','#f4d8b9','#ddd3bc','#ecbfb4','#c6c0cb','#babda1','#c8aca6','#b7a095','#9f98a8','#898dad','#858585','#827d61','#737289','#646575','#5d586b','#504e68','#474858','#3e4349','#413e3c','#433931','#393839','#2c333c','#2f2831','#2e1b23','#23171f','#18141c']}]};
state.palettes.push(ennis);
R.palStyle=['analogous','auto','triad'].map(sp=>genRandom({...base,preset:'pal:E',spread:sp,seed:8}).map(g=>[g.name,g.colors]));
R.palTemplate=JSON.stringify(palTemplate(ennis));
// Generate tab
const p0=state.palettes[0];R.genTab=[];
for(const mode of ['between','extend','ramps','restyle'])for(const sc of ['all',p0.groups[0].id]){ui.gen.mode=mode;ui.scope=sc;R.genTab.push([mode,sc===  'all',generate(p0)])}
ui.scope='all';
// Satisfactory builder
const U=[];
const opts=[];for(const source of ['gen','pal'])for(const pairing of ['tonal','complement','analogous','neutral','same'])for(const count of ['1','28','150'])opts.push({source,pairing,count});
for(const contrast of ['off','3','4.5','7'])for(const snap of ['on','off'])for(const dir of ['dark','auto','light'])opts.push({source:'gen',pairing:'tonal',count:'40',contrast,snap,dir});
for(const balance of ['on','off'])for(const ntint of ['grey','subtle','tinted','style'])for(const nval of ['fixed','gap'])for(const band of ['mid','dark','light','full'])opts.push({source:'gen',pairing:'neutral',count:'36',balance,ntint,nval,band,ndark:15,nlight:90});
for(const grouping of ['groups','one'])for(const naming of ['colours','primary','group'])opts.push({source:'pal',pal:'E',pairing:'tonal',count:'30',grouping,naming});
ui.rand={...base,preset:'computing90',spread:'full',seed:12345};
for(const g of opts){const b=ussNew();Object.assign(b.gen,g);if(g.source==='pal'&&!g.pal)b.gen.pal=p0.id;ussGenerate(b);U.push([JSON.stringify(g),b.groups.map(x=>[x.name,x.swatches.map(s=>[s.name,s.p,s.s,s.m])])])}
R.uss=U;
const raw=fs.readFileSync(up+'e8f33082-USS_Default.json','utf8');const ub=parseUSS(raw);R.ussImport=ub.map(b=>[b.name,b.file,b.active,b.groups.map(g=>[g.name,g.swatches.map(s=>[s.name,s.p,s.s,s.m])])]);
R.ussJSON=ussJSON(ub[0]);
// import / export formats
R.parse=['157c0881-cosmo-zoids.txt','bc0280da-cosmo-zoids.hex','e5465c06-cosmo-zoids.gpl','8b94539a-ennis-blade-extended-cut.gpl','95f78f1b-Gruvbox.gpl'].map(f=>{const p=parsePalette(fs.readFileSync(up+f,'utf8'),f);return p&&[p.name,p.groups.map(g=>[g.name,g.colors])]});
const multi={name:'Test',groups:[{id:'a',name:'Warm',colors:['#ff0000','#ffaa00']},{id:'b',name:'Cool',colors:['#0000ff']}]};
R.exports=[];for(const fmt of ['gpl','txt','hex','all'])for(const scope of ['whole','each','one']){ui.exp.fmt=fmt;ui.exp.scope=scope;ui.exp.group='b';R.exports.push([fmt,scope,exportFiles(multi).map(f=>[f.name,f.text])])}
// colour names and maths
const cs=[];for(let i=0;i<600;i++){cs.push('#'+[0,0,0].map(()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(''))}
R.names=cs.map(colorName);R.lch=cs.slice(0,100).map(c=>{const o=oklch(c);return [o.L.toFixed(6),o.C.toFixed(6),o.H.toFixed(4)]});
R.contrast=cs.slice(0,100).map((c,i)=>ratio(c,cs[i+100]).toFixed(5));
R.sims=cs.slice(0,60).map(c=>[sim(c,CB.p),sim(c,CB.d),sim(c,CB.t),gray(c),projSim(c)]);
// accessibility
const slide=[{name:'S',colors:['#d62728','#2ca02c','#ff7f0e','#1f77b4','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']}];
R.accIssues=accIssues(slide[0].colors,['p','d','t','proj']).map(x=>[x.a,x.b,x.k,x.d.toFixed(5)]);
const g2=JSON.parse(JSON.stringify(slide));accBoost(g2,.16,.9);R.accRepair=[accRepair(g2,['p','d','t','proj'],{lo:.16,hi:.9}),g2[0].colors];
// families / misc
R.families=families(cs.slice(0,80)).map(f=>[f.name,f.cs,f.rep]);
R.hueNames=[0,30,60,90,120,150,180,210,240,270,300,330].map(hueName);
`);
fs.writeFileSync(outp,JSON.stringify(R));console.log('wrote',outp,Object.keys(R).map(k=>k+':'+(Array.isArray(R[k])?R[k].length:typeof R[k])).join(' '));
