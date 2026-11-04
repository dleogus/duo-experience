export type AppId = "home" | "messages" | "browser" | "camera";
export type Action = "fold" | "unfold" | AppId | "reset";
export type Snapshot = { fold: "closed" | "open"; app: AppId; unfold_count: number; actions: number };
export interface Engine { snapshot(): Snapshot; dispatch(action: Action): Snapshot; }
const initial: Snapshot = { fold: "closed", app: "home", unfold_count: 0, actions: 0 };

export function createFallbackEngine(): Engine {
  let state = { ...initial };
  return {
    snapshot: () => ({ ...state }),
    dispatch(action) {
      if (action === "reset") { state = { ...initial }; return { ...state }; }
      state.actions += 1;
      if (action === "fold") state.fold = "closed";
      else if (action === "unfold") {
        if (state.fold === "closed") state.unfold_count += 1;
        state.fold = "open";
      } else state.app = action;
      return { ...state };
    },
  };
}

export async function loadEngine(): Promise<{ engine: Engine; wasm: boolean }> {
  try {
    const moduleUrl = "/wasm/duo_wasm.js";
    const glue = await import(/* webpackIgnore: true */ moduleUrl);
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
    return { engine: createFallbackEngine(), wasm: false };
  }
}
