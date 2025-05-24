use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use futures_util::{SinkExt, StreamExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

type Tx = mpsc::UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<Uuid, Tx>>>;

#[derive(Debug)]
pub struct WebSocketServer {
    port: u16,
    peer_map: PeerMap,
}

impl WebSocketServer {
    pub fn new(port: u16) -> Self {
        WebSocketServer {
            port,
            peer_map: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn run(&self) -> Result<tokio::task::JoinHandle<()>, Box<dyn std::error::Error>> {
        let addr = format!("0.0.0.0:{}", self.port);
        let listener = TcpListener::bind(&addr).await?;
        let peer_map = self.peer_map.clone();

        let handle = tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                let peer_map = peer_map.clone();
                tokio::spawn(handle_connection(peer_map, stream));
            }
        });

        Ok(handle)
    }

    /// Broadcast a message to all connected clients
    pub fn broadcast(&self, message: &str) {
        let binding = self.peer_map.clone();
        let pm = binding.lock().unwrap();
        
        for (_, tx) in pm.iter() {
            if let Err(e) = tx.send(Message::Text(message.into())) {
                eprintln!("Failed to send message: {}", e);
            }
        }
    }
}

async fn handle_connection(peer_map: PeerMap, stream: TcpStream) {
    let ws_stream = match tokio_tungstenite::accept_async(stream).await {
        Ok(ws_stream) => ws_stream,
        Err(e) => {
            eprintln!("Error during WebSocket handshake: {}", e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut rx) = mpsc::unbounded_channel();
    let peer_id = Uuid::new_v4();

    peer_map.lock().unwrap().insert(peer_id, tx);

    let peer_map_clone = peer_map.clone();
    tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_receiver.next().await {
            match msg {
                Message::Text(text) => {
                    let peer_map = peer_map_clone.lock().unwrap();

                    for (_, tx) in peer_map.iter() {
                        if let Err(e) = tx.send(Message::Text(text.clone())) {
                            eprintln!("Failed to send message: {}", e);
                        }
                    }
                }
                Message::Close(_) => {
                    break;
                }
                _ => {}
            }
        }

        peer_map_clone.lock().unwrap().remove(&peer_id);
    });

    // Forward messages from the channel to the WebSocket
    while let Some(msg) = rx.recv().await {
        if let Err(e) = ws_sender.send(msg).await {
            eprintln!("Failed to send message: {}", e);
            break;
        }
    }
}
