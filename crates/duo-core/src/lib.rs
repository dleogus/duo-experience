use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FoldState { Closed, Open }

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum App { Home, Messages, Browser, Camera }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Event { Fold, Unfold, Launch(App), Reset }

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Device {
    pub fold: FoldState,
    pub app: App,
    pub unfold_count: u32,
    pub actions: u32,
}

impl Default for Device {
    fn default() -> Self {
        Self { fold: FoldState::Closed, app: App::Home, unfold_count: 0, actions: 0 }
    }
}

impl Device {
    pub fn dispatch(&mut self, event: Event) {
        if event == Event::Reset { *self = Self::default(); return; }
        self.actions = self.actions.saturating_add(1);
        match event {
            Event::Fold => self.fold = FoldState::Closed,
            Event::Unfold => {
                if self.fold == FoldState::Closed {
                    self.unfold_count = self.unfold_count.saturating_add(1);
                }
                self.fold = FoldState::Open;
            }
            Event::Launch(app) => self.app = app,
            Event::Reset => unreachable!(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn initial_state() {
        let device = Device::default();
        assert_eq!(device.fold, FoldState::Closed);
        assert_eq!(device.actions, 0);
    }
    #[test] fn repeated_unfold_only_counts_transitions() {
        let mut device = Device::default();
        device.dispatch(Event::Unfold);
        device.dispatch(Event::Unfold);
        assert_eq!(device.unfold_count, 1);
        device.dispatch(Event::Fold);
        device.dispatch(Event::Unfold);
        assert_eq!(device.unfold_count, 2);
    }
    #[test] fn reset_restores_initial_snapshot() {
        let mut device = Device::default();
        device.dispatch(Event::Launch(App::Camera));
        device.dispatch(Event::Unfold);
        device.dispatch(Event::Reset);
        assert_eq!(device, Device::default());
    }
}
