const { app, BrowserWindow } = require('electron');const fs=require('fs');
const html=fs.readFileSync(process.argv[process.argv.length-1],'utf8');fs.writeFileSync(require('os').tmpdir()+'/_motion.html','<!doctype html><html><head><meta charset="utf-8"></head><body>'+html+'</body></html>');
app.whenReady().then(async()=>{const w=new BrowserWindow({width:1300,height:1200,show:true});const js=c=>w.webContents.executeJavaScript(c);const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const errs=[];w.webContents.on('console-message',e=>{const m=String(e.message||'');if(!/Security|fonts/.test(m))errs.push(m)});
 await w.loadFile(require('os').tmpdir()+'/_motion.html');await wait(500);await js("localStorage.clear();location.reload()");await wait(800);
 const cs=(sel,props)=>js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return 'missing';const c=getComputedStyle(e);return ${JSON.stringify(props)}.map(p=>p+'='+c[p]).join(' ')})()`);
 // 1 toast
 console.log('T idle',await cs('#toast',['opacity','visibility','transform']));
 await js("toast('Copied #123456')");await wait(40);console.log('T mid ',await cs('#toast',['opacity','visibility','transform']));await wait(260);console.log('T open',await cs('#toast',['opacity','visibility','transform']));
 await wait(1300);console.log('T gone',await cs('#toast',['opacity','visibility']));
 // 2 press
 await js("document.getElementById('addPal')&&0");
 console.log('P chip',await js("(()=>{const b=document.querySelector('.sw .chip');b.classList.add('x');return getComputedStyle(b).transitionDuration})()"));
 // 3 details
 await js("document.querySelector('details summary').click()");await wait(60);const mid=await js("getComputedStyle(document.querySelector('details'),'::details-content').opacity");await wait(300);const end=await js("getComputedStyle(document.querySelector('details'),'::details-content').opacity");console.log('D opacity mid/end',mid,end);
 // 6 export + 5 confirm + save entrance
 await js("document.getElementById('exportBtn').click()");await wait(40);console.log('E enter',await js("(()=>{const e=document.querySelector('.exp');return e.className+' '+getComputedStyle(e).animationName+' '+ui.expEnter})()"));
 await js("document.querySelector('[data-fmt]')&&0");
 await js("document.getElementById('exportBtn').click()");
 await js("document.getElementById('rename').click()");await wait(40);console.log('C confirm',await js("getComputedStyle(document.querySelector('#confirm>*')).animationName"));
 await js("document.getElementById('noRen')&&document.getElementById('noRen').click()");
 await js("document.getElementById('openRandom').click()");await js("document.getElementById('rSave').click()");await wait(40);
 console.log('S fresh',await js("JSON.stringify({n:document.querySelectorAll('.sw.enter').length,anim:getComputedStyle(document.querySelector('.sw.enter')).animationName,delay:getComputedStyle(document.querySelectorAll('.sw.enter')[3]).animationDelay,flag:ui.fresh})"));
 await wait(400);await js("renderMain()");console.log('S rerender no replay',await js("document.querySelectorAll('.sw.enter').length"));
 // 4 landed
 await js("document.getElementById('openUss').click()");await js("document.getElementById('ussGo').click()");await wait(200);
 console.log('U landed',await js("(()=>{const b=ussCur(),g=b.groups.find(x=>x.swatches.length>1);const sid=g.swatches[0].id;ussMoveTo(b,sid,g.id,g.swatches.length);ussCommit(b);const t=document.querySelector('.utile.landed');return t?(t.dataset.usw===sid)+' '+getComputedStyle(t).animationName+' flag '+ui.landed:'none'})()"));
 await wait(300);await js("renderMain()");console.log('U rerender',await js("document.querySelectorAll('.utile.landed').length"));
 console.log('ERRS',JSON.stringify(errs));app.quit()});
