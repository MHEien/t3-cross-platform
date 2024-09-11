// Declare the tray module
#[cfg(desktop)]
mod tray;

use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let url = &argv[1];
            if url.contains("login") {
                app.emit("session-token", url).unwrap();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        // Correctly handle window events
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap(); // Hide the window instead of closing it
                api.prevent_close(); // Prevent the close event
            }
        })
        .setup(|app| {
            #[cfg(all(desktop))]
            {
                let handle = app.handle();
                tray::create_tray(&handle)?;  // Initialize tray icon setup
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}