// Run inside the Tauri debug build:
//   cd tauri/src-tauri && cargo build && PALETTE_SHELF_SELFTEST="$PWD/../../tests/tauri_selftest.js" target/debug/palette-shelf
// Prints SELFTEST {...} and exits. The IPC round trip itself is the report call, so a printed line proves IPC works under the page CSP.
(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),R={},q=s=>document.querySelector(s);
 try{
  R.tauri=!!(window.__TAURI__&&window.__TAURI__.core);R.ua=navigator.userAgent.slice(0,60);
  try{localStorage.setItem('selftest','1');R.localStorage=localStorage.getItem('selftest')==='1';localStorage.removeItem('selftest')}catch(e){R.localStorage='ERR '+e}
  R.palettes=state.palettes.length;
  q('[data-rm]').click();await W(50);const a=all(cur()).length;q('#undoBtn').click();await W(50);R.undo=[a,all(cur()).length];
  q('[data-view=analysis]').click();await W(300);R.analysisCanvases=[...document.querySelectorAll('canvas')].filter(c=>c.width>0).length;
  q('[data-view=swatches]').click();q('#exportBtn').click();await W(30);q('[data-step="exp.kind"] [data-v=image]').click();await W(80);
  const f=exportFiles(cur())[0];R.png=(await pngBytes(f)).length;q('#expClose').click();
  q('#openRandom').click();await W(200);R.random=lastRand.length;q('#rClose').click();
  // the save command exists and rejects bad arguments without opening a dialog
  try{await window.__TAURI__.core.invoke('save_file',{});R.saveCmd='no error?'}catch(e){R.saveCmd='reachable: '+String(e).slice(0,60)}
  R.errors=window.__errs||[];
 }catch(e){R.threw=String(e)}
 window.__TAURI__.core.invoke('selftest_report',{result:JSON.stringify(R)})})();
