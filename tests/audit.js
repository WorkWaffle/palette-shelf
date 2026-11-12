const { app, BrowserWindow } = require('electron');const fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const AUDIT=`(()=>{const out=[];const vw=innerWidth;
 if(document.documentElement.scrollWidth>vw+1)out.push('PAGE-OVERFLOW '+document.documentElement.scrollWidth);
 const desc=el=>(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\\s+/).slice(0,2).join('.'):'')+'<'+el.tagName.toLowerCase()+'>';
 document.querySelectorAll('#main *, aside *').forEach(el=>{const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const r=el.getBoundingClientRect();if(!r.width)return;
  // skinny text: element with own text, narrow, many lines
  const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
  if(own.length>18){const lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.3;const lines=r.height/lh;const cpl=own.length/Math.max(1,lines);if(lines>=3&&cpl<14)out.push('SKINNY '+desc(el)+' w'+Math.round(r.width)+' lines'+Math.round(lines)+' "'+own.slice(0,40)+'"')}
  // overflow beyond viewport
  if(r.right>vw+1&&!el.closest('.scroll')&&!el.closest('textarea'))out.push('OUT-RIGHT '+desc(el)+' right'+Math.round(r.right));
  // inputs too narrow
  if((el.tagName==='INPUT'&&!['checkbox','range','color','file'].includes(el.type)||el.tagName==='SELECT')&&r.width<60)out.push('NARROW-INPUT '+desc(el)+' w'+Math.round(r.width));
  // horizontal clipping inside element (text overflow) for buttons/labels
  if(['BUTTON','LABEL','SPAN','P','H2','H3','H4'].includes(el.tagName)&&el.scrollWidth>el.clientWidth+2&&cs.overflow!=='visible'&&cs.textOverflow!=='ellipsis')out.push('CLIPPED '+desc(el)+' '+el.scrollWidth+'>'+el.clientWidth);
 });
 return [...new Set(out)];})()`;
app.whenReady().then(async()=>{const res={};
 for(const W of [380,820,1300]){const w=new BrowserWindow({width:W,height:900,show:true});const js=c=>w.webContents.executeJavaScript(c);
  await w.loadFile(process.argv[process.argv.length-1]);await wait(400);await js("localStorage.clear();location.reload()");await wait(900);
  const steps=[
   ['swatches-groups',""],
   ['swatches-family',"document.querySelector('[data-step=\"sw.view\"] [data-v=family]').click()"],
   ['swatches-select',"document.getElementById('swSelect').click()"],
   ['swatches-all-small',"document.querySelector('[data-step=\"sw.view\"] [data-v=all]').click();document.querySelector('[data-step=\"sw.size\"] [data-v=s]').click()"],
   ['export-panel',"document.getElementById('exportBtn').click()"],
   ['rename',"document.getElementById('exportBtn').click();document.getElementById('rename').click()"],
   ['analysis',"document.querySelector('[data-view=analysis]').click()"],
   ['generate-tab',"document.querySelector('[data-view=generate]').click()"],
   ['random',"document.getElementById('openRandom').click()"],
   ['random-mono-leg',"document.querySelector('[data-step=spread] [data-v=mono]').click();document.querySelector('[data-step=legible] [data-v=\"4.5\"]').click()"],
   ['uss-gen',"document.getElementById('openUss').click()"],
   ['uss-gen-pal',"document.getElementById('ussSrc').click();document.querySelector('[data-step=\"ussg.pairing\"] [data-v=neutral]').click()"],
   ['uss-arrange',"document.getElementById('ussGo').click()"],
   ['uss-editor',"document.querySelectorAll('.utile')[2].click()"],
   ['uss-analysis',"document.querySelector('[data-utab=analysis]').click()"],
   ['uss-export',"document.querySelector('[data-utab=export]').click()"],
   ['backup-open',"document.querySelector('details summary').click()"],
  ];
  for(const [name,code] of steps){try{if(code)await js(code);}catch(e){res[W+' '+name]=['STEP-ERROR '+e.message];continue}await wait(350);
   const r=await js(AUDIT);if(r.length)res[W+' '+name]=r.slice(0,25);
   if(W!==1300)fs.writeFileSync(require('os').tmpdir()+'/a'+W+'-'+name+'.png',(await w.webContents.capturePage()).toPNG());}
  w.close()}
 fs.writeFileSync(require('os').tmpdir()+'/audit.json',JSON.stringify(res,null,1));console.log('OUT done',Object.keys(res).length);app.quit()});
