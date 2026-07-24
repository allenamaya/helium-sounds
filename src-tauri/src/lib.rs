use std::sync::Mutex;
use tauri::State;

// Simple placeholder state for our audio engine
pub struct AudioEngineState {
    pub is_playing: Mutex<bool>,
    pub tempo: Mutex<f64>,
}

#[tauri::command]
fn load_track(path: String) -> Result<String, String> {
    println!("Loading track from: {}", path);
    // TODO: Implement actual Symphonia decoding here in Phase 2
    Ok(format!("Track loaded: {}", path))
}

#[tauri::command]
fn toggle_playback(state: State<'_, AudioEngineState>) -> Result<bool, String> {
    let mut playing = state.is_playing.lock().map_err(|e| e.to_string())?;
    *playing = !*playing;
    println!("Playback state changed: playing = {}", *playing);
    Ok(*playing)
}

#[tauri::command]
fn set_tempo(tempo: f64, state: State<'_, AudioEngineState>) -> Result<f64, String> {
    let mut current_tempo = state.tempo.lock().map_err(|e| e.to_string())?;
    *current_tempo = tempo;
    println!("Tempo updated: {} BPM", *current_tempo);
    Ok(*current_tempo)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AudioEngineState {
            is_playing: Mutex::new(false),
            tempo: Mutex::new(120.0),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            load_track,
            toggle_playback,
            set_tempo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
