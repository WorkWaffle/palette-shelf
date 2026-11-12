// electron uishots.js <page.html> <outdir>
const { app, BrowserWindow } = require('electron');const fs=require('fs');const path=require('path');
const page=process.argv[process.argv.length-2],outdir=process.argv[process.argv.length-1];fs.mkdirSync(outdir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const html=fs.readFileSync(page,'utf8');
const seedJs='<script>(()=>{let s=1;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};const D=Date.now;let t=1790000000000;Date.now=()=>t++;const si=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(o){return si.call(this,o&&typeof o==\'object\'?{...o,behavior:\'auto\'}:o)}})()</script><style>#toast{display:none!important}*{transition:none!important;animation:none!important;caret-color:transparent!important}</style>';
const wrapped='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+seedJs+'<style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+html+'</body></html>';
const tmp=path.join(outdir,'_page.html');fs.writeFileSync(tmp,wrapped);
const STEPS=[
 ['swatches',""],
 ['sw-family',"document.querySelector('[data-step=\"sw.view\"] [data-v=family]').click()"],
 ['sw-select',"document.getElementById('swSelect').click();document.querySelectorAll('[data-pick]')[1].click()"],
 ['sw-all-small',"document.querySelector('[data-step=\"sw.view\"] [data-v=all]').click();document.querySelector('[data-step=\"sw.size\"] [data-v=s]').click()"],
 ['export',"document.getElementById('exportBtn').click()"],
 ['analysis',"document.getElementById('exportBtn').click();document.querySelector('[data-view=analysis]').click()"],
 ['gen-between',"document.querySelector('[data-view=generate]').click()"],
 ['gen-ramps',"const m=document.getElementById('gMode');m.value='ramps';m.dispatchEvent(new Event('change',{bubbles:true}))"],
 ['random',"document.getElementById('openRandom').click()"],
 ['random-triad',"document.querySelector('[data-step=spread] [data-v=triad]').click();document.querySelector('[data-step=baseHue] [data-v=\"235\"]').click()"],
 ['random-custom',"document.querySelector('[data-step=spread] [data-v=custom]').click();document.querySelector('[data-chue=\"75\"]').click()"],
 ['random-mono',"document.querySelector('[data-step=spread] [data-v=mono]').click()"],
 ['random-leg',"document.querySelector('[data-step=spread] [data-v=auto]').click();document.querySelector('[data-step=legible] [data-v=\"4.5\"]').click();document.querySelector('[data-step=legAim] [data-v=dark]').click()"],
 ['random-acc',"document.getElementById('rCvd').click();document.getElementById('rProj').click()"],
 ['random-gruv',"const p=document.getElementById('rPreset');p.value='gruvbox';p.dispatchEvent(new Event('input',{bubbles:true}))"],
 ['uss-gen',"document.getElementById('openUss').click()"],
 ['uss-gen-neutral',"document.querySelector('[data-step=\"ussg.pairing\"] [data-v=neutral]').click()"],
 ['uss-gen-pal',"document.getElementById('ussSrc').click()"],
 ['uss-arrange',"document.getElementById('ussGo').click()"],
 ['uss-editor',"document.querySelectorAll('.utile')[2].click()"],
 ['uss-analysis',"document.querySelector('[data-utab=analysis]').click()"],
 ['uss-export',"document.querySelector('[data-utab=export]').click()"],
 ['dark-swatches',"document.getElementById('ussClose').click();document.getElementById('themeBtn').click()"],
 ['dark-random',"document.getElementById('openRandom').click()"],
];
app.whenReady().then(async()=>{const log={};
 for(const [W,H] of [[1300,2600],[380,2600]]){const w=new BrowserWindow({width:W,height:H,show:true,webPreferences:{backgroundThrottling:false}});const js=c=>w.webContents.executeJavaScript(c);
  const errs=[];w.webContents.on('console-message',e=>{const m=String(e.message||e);if(!/Security/.test(m))errs.push(m)});
  await w.loadFile(tmp);await wait(300);await js("localStorage.clear();location.reload()");await wait(1000);
  for(const [name,code] of STEPS){console.log('STEP',W,name);try{if(code)await js(code)}catch(e){errs.push(name+': '+e.message)}await wait(250);await js("window.scrollTo(0,0)");await wait(80);
   fs.writeFileSync(path.join(outdir,W+'-'+name+'.png'),(await w.webContents.capturePage()).toPNG());
   log[W+'-'+name]=await js("document.documentElement.scrollWidth+'/'+document.documentElement.scrollHeight")}
  log['errors-'+W]=errs;w.close()}
 fs.writeFileSync(path.join(outdir,'log.json'),JSON.stringify(log,null,1));console.log('OUT',JSON.stringify(log).slice(0,300));app.quit()});
