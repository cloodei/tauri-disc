use std::sync::Arc;
use tauri::async_runtime::Mutex;

mod websocket;
use websocket::WebSocketServer;

#[derive(Clone)]
struct AppState {
    ws_server: Arc<Mutex<Option<WebSocketServer>>>,
    _server_handle: Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>,
}

#[tauri::command]
async fn send_message(state: tauri::State<'_, AppState>, message: String) -> Result<(), String> {
    let binding = state.ws_server.clone();
    let server = binding.lock().await;
    if let Some(server) = server.as_ref() {
        server.broadcast(&message);
        Ok(())
    } else {
        Err("WebSocket server not running".to_string())
    }
}

#[tokio::main]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let ws_server = Arc::new(Mutex::new(None));
    let _server_handle = Arc::new(Mutex::new(None));
    
    let server = WebSocketServer::new(9001);
    let sh = server.run().await.expect("Failed to start WebSocket server");
    
    *ws_server.lock().await = Some(server);
    *_server_handle.lock().await = Some(sh);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { 
            ws_server,
            _server_handle,
        })
        .invoke_handler(tauri::generate_handler![send_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
