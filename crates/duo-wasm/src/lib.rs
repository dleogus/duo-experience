use duo_core::{App, Device, Event};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Simulator { device: Device }

#[wasm_bindgen]
impl Simulator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self { Self { device: Device::default() } }

    pub fn dispatch(&mut self, action: &str) -> Result<JsValue, JsValue> {
        let event = match action {
            "fold" => Event::Fold,
            "unfold" => Event::Unfold,
            "home" => Event::Launch(App::Home),
            "messages" => Event::Launch(App::Messages),
            "browser" => Event::Launch(App::Browser),
            "camera" => Event::Launch(App::Camera),
            "reset" => Event::Reset,
            _ => return Err(JsValue::from_str("Unknown action")),
        };
        self.device.dispatch(event);
        self.snapshot()
    }

    pub fn snapshot(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.device)
            .map_err(|error| JsValue::from_str(&error.to_string()))
    }
}
