use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FoldState { Closed, Open }

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum App { Home, Messages, Browser, Camera, Notes, Gallery }

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Event { Fold, Unfold, Stress, Launch(App), Reset }

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Device {
    pub fold: FoldState,
    pub app: App,
    pub unfold_count: u32,
    pub actions: u32,
    pub damage: u8,
}

impl Default for Device {
    fn default() -> Self {
        Self { fold: FoldState::Open, app: App::Home, unfold_count: 0, actions: 0, damage: 0 }
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
                    self.damage = self.damage.saturating_add(1).min(4);
                }
                self.fold = FoldState::Open;
            }
            Event::Stress => self.damage = self.damage.saturating_add(1).min(4),
            Event::Launch(app) => self.app = app,
            Event::Reset => unreachable!(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn initial_state_is_unfolded_and_pristine() {
        let d = Device::default();
        assert_eq!(d.fold, FoldState::Open);
        assert_eq!(d.damage, 0);
    }
    #[test] fn damage_increases_only_after_reopening() {
        let mut d = Device::default();
        d.dispatch(Event::Unfold);
        assert_eq!(d.damage, 0);
        d.dispatch(Event::Fold);
        d.dispatch(Event::Unfold);
        assert_eq!(d.damage, 1);
        d.dispatch(Event::Unfold);
        assert_eq!(d.damage, 1);
    }
    #[test] fn stress_is_bounded_and_reset_restores() {
        let mut d = Device::default();
        for _ in 0..10 { d.dispatch(Event::Stress); }
        assert_eq!(d.damage, 4);
        d.dispatch(Event::Reset);
        assert_eq!(d, Device::default());
    }
    #[test] fn app_launch_survives_fold() {
        let mut d = Device::default();
        d.dispatch(Event::Launch(App::Gallery));
        d.dispatch(Event::Fold);
        assert_eq!(d.app, App::Gallery);
    }
}
