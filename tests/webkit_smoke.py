#!/usr/bin/env python3
# WebKitGTK smoke test: runs the built page in the engine Tauri and Wails use on Linux.
# Usage: python3 build.py && python3 tests/webkit_smoke.py "$PWD/app/index.html" /tmp/webkit.png
# Needs gir1.2-webkit2-4.1 (Mint/Ubuntu). Prints RESULT {...}; "errors" should be [].
import gi,sys,json
gi.require_version('Gtk','3.0');gi.require_version('WebKit2','4.1')
from gi.repository import Gtk,WebKit2,GLib
page=sys.argv[1]
ucm=WebKit2.UserContentManager()
ucm.add_script(WebKit2.UserScript("window.__errs=[];addEventListener('error',e=>__errs.push(String(e.message)));",WebKit2.UserContentInjectedFrames.TOP_FRAME,WebKit2.UserScriptInjectionTime.START,None,None))
wv=WebKit2.WebView.new_with_user_content_manager(ucm)
st=wv.get_settings();st.set_enable_write_console_messages_to_stdout(True)
w=Gtk.Window();w.set_default_size(1300,900);w.add(wv);w.show_all()
CHECK=r"""
(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),R={};const q=s=>document.querySelector(s);
R.ua=navigator.userAgent;R.eyedropper='EyeDropper' in window;R.detailsContent=CSS.supports('selector(::details-content)');R.structuredClone=typeof structuredClone;
R.clipboard=!!(navigator.clipboard&&navigator.clipboard.writeText);R.dataTransfer=typeof DataTransfer;
try{localStorage.setItem('x','1');R.localStorage=localStorage.getItem('x')==='1'}catch(e){R.localStorage='ERR '+e}
R.palettes=state.palettes.length;
q('[data-rm]').click();await W(50);const a=all(cur()).length;q('#undoBtn').click();await W(50);R.undo=[a,all(cur()).length];
q('[data-edit]').click();await W(50);const L=q('#cedL');L.value=40;L.dispatchEvent(new Event('input',{bubbles:true}));R.edit=ui.edit.v;q('#cedSave').click();await W(50);
q('[data-view=analysis]').click();await W(300);R.analysisCanvases=[...document.querySelectorAll('canvas')].filter(c=>c.width>0).length;R.jump=document.querySelectorAll('.jump a').length;
q('[data-view=swatches]').click();q('#exportBtn').click();await W(30);q('[data-step="exp.kind"] [data-v=image]').click();await W(30);q('[data-step="exp.fmt"] [data-v=sheet]').click();await W(100);
const f=exportFiles(cur())[0];const b=await pngBytes(f);R.pngBytes=b.length;R.zip=(await makeZip([{name:'a.txt',text:'x'},{name:'b.png',bytes:b}]).arrayBuffer()).byteLength;
q('#openRandom').click();await W(200);R.random=lastRand.length;q('#rClose').click();
q('#openUss').click();await W(100);q('#ussGo')?.click();await W(400);R.uss=ussAll(ussCur()).length;q('#ussClose')?.click();
R.errors=window.__errs;window.__R=JSON.stringify(R)})().catch(e=>window.__R="THROW "+e+" "+e.stack);1"""
def done(wv_,res):
    GLib.timeout_add(5000,lambda:(wv.evaluate_javascript('String(window.__R)',-1,None,None,None,fin),False)[1])
def fin(wv_,res):
    try: print('RESULT',wv.evaluate_javascript_finish(res).to_string())
    except Exception as e: print('ERR',e)
    shot()
def shot():
    wv.get_snapshot(WebKit2.SnapshotRegion.VISIBLE,WebKit2.SnapshotOptions.NONE,None,lambda o,r:(wv.get_snapshot_finish(r).write_to_png(sys.argv[2]),Gtk.main_quit()))
def loaded(wv_,ev):
    if ev==WebKit2.LoadEvent.FINISHED:
        GLib.timeout_add(800,lambda:(wv.evaluate_javascript(CHECK,-1,None,None,None,done),False)[1])
wv.connect('load-changed',loaded)
wv.load_uri('file://'+page)
GLib.timeout_add_seconds(40,lambda:(print('TIMEOUT'),Gtk.main_quit()))
Gtk.main()
