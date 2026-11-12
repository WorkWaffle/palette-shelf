// Palette Shelf desktop shell (Tauri v2). The whole app is the web page in ../www/index.html;
// this file only opens the window and gives the page a native "Save as" for exports and backups.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

/// Ask where to save `name`, starting in Downloads, then write `data` there.
/// Returns "saved", or "cancelled" if the user closed the dialog.
#[tauri::command]
async fn save_file(app: tauri::AppHandle, name: String, data: Vec<u8>) -> Result<String, String> {
    let mut dialog = app.dialog().file().set_title("Save palette").set_file_name(&name);
    if let Ok(dir) = app.path().download_dir() {
        dialog = dialog.set_directory(dir);
    }
    match dialog.blocking_save_file() {
        Some(path) => {
            let path = path.into_path().map_err(|e| e.to_string())?;
            std::fs::write(&path, data).map_err(|e| e.to_string())?;
            Ok("saved".into())
        }
        None => Ok("cancelled".into()),
    }
}

/// Debug builds only: the page reports a self-test result here (see tests/tauri_selftest.js), then the app exits.
#[cfg(debug_assertions)]
#[tauri::command]
fn selftest_report(app: tauri::AppHandle, result: String) {
    println!("SELFTEST {result}");
    app.exit(0);
}

fn main() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_dialog::init());
    #[cfg(debug_assertions)]
    let builder = builder
        .invoke_handler(tauri::generate_handler![save_file, selftest_report])
        .setup(|app| {
            // PALETTE_SHELF_SELFTEST=<path to a .js file> runs that script in the page once it has loaded
            if let Ok(path) = std::env::var("PALETTE_SHELF_SELFTEST") {
                let script = std::fs::read_to_string(path)?;
                let win = app.get_webview_window("main").expect("main window");
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(3));
                    let _ = win.eval(&script);
                });
            }
            Ok(())
        });
    #[cfg(not(debug_assertions))]
    let builder = builder.invoke_handler(tauri::generate_handler![save_file]);
    builder
        .run(tauri::generate_context!())
        .expect("error while running Palette Shelf");
}
