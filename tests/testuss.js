const { app, BrowserWindow } = require('electron');const fs=require('fs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async () => {
  const w = new BrowserWindow({ width: 1300, height: 900, show: true });
  const errs=[];w.webContents.on('console-message',(e)=>errs.push(String(e.message||e)));
  await w.loadFile(require('path').join(__dirname,'..','app','index.html'));await wait(800);
  const js=c=>w.webContents.executeJavaScript(c);const shot=async n=>fs.writeFileSync(require('os').tmpdir()+'/'+n+'.png',(await w.webContents.capturePage()).toPNG());
  await js("localStorage.clear();location.reload()");await wait(1200);await js("document.getElementById('openUss').click()");await wait(300);await shot('u1');
  await js("const n=document.getElementById('ussCountN');n.value=40;n.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('ussGo').click()");await wait(400);await shot('u2');
  // drag swatch 1 to after swatch 3 in same group
  const res=await js(`(()=>{const tiles=[...document.querySelectorAll('.utile')];const a=tiles[0],c=tiles[2];const id=a.dataset.usw;const dt=new DataTransfer();
    a.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));const r=c.getBoundingClientRect();
    c.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.right-2,clientY:r.top+5}));
    c.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.right-2,clientY:r.top+5}));
    const after=[...document.querySelectorAll('.utile')].map(t=>t.dataset.usw);return after.indexOf(id)})()`);
  // drag group 2 above group 1
  const res2=await js(`(()=>{const gs=[...document.querySelectorAll('.ugroup')];const names=()=>[...document.querySelectorAll('.gname')].map(i=>i.value).join(',');const before=names();const h=gs[1].querySelector('.handle');const dt=new DataTransfer();
    h.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));const r=gs[0].getBoundingClientRect();
    gs[0].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+20,clientY:r.top+3}));return before+' -> '+names()})()`);
  // move a swatch into another group via drop on the empty grid area
  const res3=await js(`(()=>{const t=document.querySelector('.utile');const id=t.dataset.usw;const g2=document.querySelectorAll('.ugroup')[1];const dt=new DataTransfer();t.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));
    g2.querySelector('.ughead').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt,clientX:5,clientY:5}));return document.querySelectorAll('.ugroup')[1].querySelector('[data-usw="'+id+'"]')?'moved':'not moved'})()`);
  await js("document.querySelectorAll('.utile')[4].click()");await wait(200);await shot('u3');
  await js("document.querySelector('[data-utab=analysis]').click()");await wait(400);await shot('u4');
  await js("document.querySelector('[data-utab=export]').click()");await wait(300);await shot('u5');
  const ok=await js("JSON.parse(document.getElementById('ussText').value)[0].Groups.reduce((s,g)=>s+g.Swatches.length,0)");
  await js("document.querySelector('[data-utab=gen]').click()");await wait(300);
  await js("document.getElementById('ussSrc').click()");await wait(300);await shot('u6');
  console.log('swatch moved to index',res,'| groups',res2,'|',res3,'| export swatches',ok,'| console',JSON.stringify(errs));app.quit();
});
