export type AppId = "home" | "messages" | "browser" | "camera" | "notes" | "gallery";
export type Action = "fold" | "unfold" | "stress" | AppId | "reset";
export type Snapshot = {
  fold: "closed" | "open";
  app: AppId;
  unfold_count: number;
  actions: number;
  damage: number;
};
export interface Engine { snapshot(): Snapshot; dispatch(action: Action): Snapshot; }
const initial: Snapshot = { fold: "open", app: "home", unfold_count: 0, actions: 0, damage: 0 };

export function createFallbackEngine(): Engine {
  let state: Snapshot = { ...initial };
  return {
    snapshot: () => ({ ...state }),
    dispatch(action) {
      if (action === "reset") { state = { ...initial }; return { ...state }; }
      state.actions += 1;
      if (action === "fold") state.fold = "closed";
      else if (action === "unfold") {
        if (state.fold === "closed") {
          state.unfold_count += 1;
          state.damage = Math.min(4, state.damage + 1);
        }
        state.fold = "open";
      } else if (action === "stress") state.damage = Math.min(4, state.damage + 1);
      else state.app = action;
      return { ...state };
    },
  };
}

export async function loadEngine(): Promise<{ engine: Engine; wasm: boolean }> {
  try {
    // wasm-pack's --target web output is an ES module served from /public/wasm.
    const glue = await import(/* webpackIgnore: true */ "/wasm/duo_wasm.js");
    await glue.default("/wasm/duo_wasm_bg.wasm");
    const simulator = new glue.Simulator();
    return {
      wasm: true,
      engine: {
        snapshot: () => simulator.snapshot() as Snapshot,
        dispatch: action => simulator.dispatch(action) as Snapshot,
      },
    };
  } catch {
    // UI remains usable in previews where wasm-pack has not run.
    return { engine: createFallbackEngine(), wasm: false };
  }
}
