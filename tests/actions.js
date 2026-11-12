// electron actions.js <page.html> <out.json> : scripted actions, records saved state after each
const { app, BrowserWindow } = require('electron');const fs=require('fs');const path=require('path');
const page=process.argv[process.argv.length-2],outp=process.argv[process.argv.length-1];
const wait=ms=>new Promise(r=>setTimeout(r,ms));const html=fs.readFileSync(page,'utf8');
const seedJs='<script>(()=>{let s=1;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};let t=1790000000000;Date.now=()=>t++;Object.defineProperty(navigator,"clipboard",{value:{writeText:x=>{window.__clip=x;return Promise.resolve()}}})})()</script>';
const tmp=path.join(path.dirname(outp),'_act_'+path.basename(page));fs.writeFileSync(tmp,'<!doctype html><html><head><meta charset="utf-8">'+seedJs+'</head><body>'+html+'</body></html>');
const click=sel=>`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('missing '+${JSON.stringify(sel)});e.click()})()`;
const setv=(sel,v,ev='input')=>`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw new Error('missing '+${JSON.stringify(sel)});e.value=${JSON.stringify(v)};e.dispatchEvent(new Event('${ev}',{bubbles:true}))})()`;
const key=(sel,k,o={})=>`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.focus();e.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)},bubbles:true,...${JSON.stringify(o)}}))})()`;
const A=[
 ['rename',click('#rename')],['rename-type',setv('#renIn','Renamed Walk')],['rename-ok',click('#okRen')],
 ['add-hex',setv('[id^=hex-]','#123456 #abcdef, #f00')],['add-hex-go',click('[data-add]')],
 ['rm-colour',click('.sw [data-rm]')],
 ['sort-light',click('[data-step="sw.sort"] [data-v=light]')],['keep-order',click('[data-apply]')],
 ['new-group',setv('#newGroup','Extra')],['new-group-go',click('#addGroup')],
 ['rename-group',click('[data-rg]')],['rename-group-type',setv('#renIn','Leafy')],['rename-group-ok',click('#okRen')],
 ['select-mode',click('#swSelect')],['pick1',click('[data-pick]')],['pick2',"document.querySelectorAll('[data-pick]')[3].click()"],
 ['selname',setv('#selName','Picked')],['sel-copy',click('[data-selnew=copy]')],
 ['pick3',"document.querySelectorAll('[data-pick]')[0].click()"],['sel-move-to',click('#selMoveTo')],
 ['family-view',click('[data-step="sw.view"] [data-v=family]')],['famnew',click('[data-famnew]')],
 ['select-off',click('#swSelect')],['groups-view',click('[data-step="sw.view"] [data-v=groups]')],
 ['del-group',click('[data-dg]')],
 ['gen-tab',click('[data-view=generate]')],['gen-steps',setv('#gSteps','3')],['gen-new',click('#genNew')],
 ['gen-tab2',click('[data-view=generate]')],['gen-mode',setv('#gMode','ramps','change')],['gen-add',click('#genAdd')],
 ['analysis',click('[data-view=analysis]')],['acc-fix',click('#accFixProj')],['acc-fix2',click('#accFixCvd')],
 ['to-rand',click('[data-view=generate]')],['gen-to-rand',click('#genToRand')],['rand-shuffle',click('#rShuffle')],['rand-addsrc',click('#rAddSrc')],
 ['open-rand',click('#openRandom')],['rand-name',setv('#rName','My random')],['rand-count',setv('#rCount','10')],['rand-ramps-off',click('#rRamps')],
 ['rand-cvd',click('#rCvd')],['rand-leg',click('[data-step=legible] [data-v="3"]')],['rand-aim',click('[data-step=legAim] [data-v=light]')],
 ['rand-tetrad',click('[data-step=spread] [data-v=tetrad]')],['rand-base',click('[data-step=baseHue] [data-v="145"]')],['rand-save',click('#rSave')],
 ['backup',"document.querySelector('details summary').click()"],['backup-copy',click('#exp')],['backup-restore',click('#imp')],['backup-restore-add',click('[data-rest=add]')],
 ['del-pal',click('#delPal')],['del-pal-no',click('#noDel')],['del-pal2',click('#delPal')],['del-pal-yes',click('#yesDel')],
 ['search',setv('#search','sea')],['search-clear',setv('#search','')],['sort-name',setv('#sortPal','name','change')],
 ['uss',click('#openUss')],['uss-count',setv('#ussCountN','20')],['uss-neutral',click('[data-step="ussg.pairing"] [data-v=neutral]')],['uss-dark',setv('#ussNDark','12')],
 ['uss-go',click('#ussGo')],['uss-tile',"document.querySelectorAll('.utile')[1].click()"],['uss-swap',click('[data-uswap]')],['uss-dup',click('[data-udup]')],
 ['uss-name',setv('[data-sf=name]','Custom pair')],['uss-hex',setv('[data-sf=ph]','#336699','change')],['uss-move',"(()=>{const s=document.querySelector('[data-umove]');s.selectedIndex=s.options.length-1;s.dispatchEvent(new Event('change',{bubbles:true}))})()"],
 ['uss-alt',key('.utile.on','ArrowLeft',{altKey:true})],['uss-del',click('[data-udel]')],
 ['uss-sort',click('[data-usort]')],['uss-addsw',click('[data-uaddsw]')],['uss-renameall',click('#ussRenameAll')],['uss-addgroup',click('#ussAddGroup')],
 ['uss-delg',"document.querySelectorAll('[data-udelg]')[0].click()"],['uss-delg-yes',click('[data-udelgy]')],
 ['uss-analysis',click('[data-utab=analysis]')],['uss-sortc',click('[data-step="ussa.sort"] [data-v=contrast]')],['uss-topal',click('#ussToPal')],
 ['uss2',click('#openUss')],['uss-export',click('[data-utab=export]')],['uss-file',setv('#ussFile','My_File')],['uss-file-c',setv('#ussFile','My_File','change')],['uss-active',click('#ussActive')],
 ['uss-mat',setv('#ussMatAll','Metal')],['uss-mat-go',click('#ussMatApply')],['uss-copy',click('#ussCopy')],
 ['uss-new',click('#ussNewSet')],['uss-setname',setv('#ussName','Second set')],['uss-del',click('#ussDelSet')],['uss-del-yes',click('#ussDelYes')],
 ['theme',click('#themeBtn')],['close',click('#ussClose')],['add-pal',click('#addPal')],['add-pal-name',setv('#renIn','Fresh')],['add-pal-enter',key('#renIn','Enter')],
];
app.whenReady().then(async()=>{const w=new BrowserWindow({width:1300,height:1600,show:true});const js=c=>w.webContents.executeJavaScript(c);
 const errs=[];w.webContents.on('console-message',e=>{const m=String(e.message||e);if(!/Security/.test(m))errs.push(m)});
 await w.loadFile(tmp);await wait(300);await js("localStorage.clear();location.reload()");await wait(900);
 const rec=[];
 for(const [name,code] of A){let err=null;try{await js(code.replace('"value=null"',''))}catch(e){err=e.message.split('\n')[0]}await wait(120);
  const snap=await js("JSON.stringify({s:localStorage.getItem('palette-shelf-v1'),th:localStorage.getItem('palette-shelf-theme'),view:ui.view,main:document.getElementById('main').innerText.length,clip:(window.__clip||'').length})");
  rec.push([name,err,snap])}
 fs.writeFileSync(outp,JSON.stringify({rec,errs},null,0));console.log('OUT steps',rec.length,'step errors',rec.filter(r=>r[1]).map(r=>r[0]+': '+r[1]).join(' | '),'console',JSON.stringify(errs));app.quit()});
