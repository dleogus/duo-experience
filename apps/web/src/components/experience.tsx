"use client";

import { useEffect, useRef, useState } from "react";
import { createFallbackEngine, loadEngine, type Action, type Engine, type Snapshot } from "@/lib/simulator";

type Mode = "normal" | "letterbox" | "split" | "collision" | "crack";
type App = "home" | "messages" | "browser" | "camera";
const modes: { id: Mode; label: string; sub: string; description: string }[] = [
  { id: "normal", label: "정상 최적화", sub: "Adaptive layout", description: "펼친 화면에 앱이 자연스럽게 적응하는 기준 화면입니다." },
  { id: "letterbox", label: "화면 비율 미지원", sub: "Letterbox", description: "일반 스마트폰 화면 비율만 유지해 양옆이 비는 가상의 앱 호환성 문제입니다." },
  { id: "split", label: "반쪽 화면만 사용", sub: "Split mismatch", description: "왼쪽에는 내용이 있지만 오른쪽 패널이 비어 있는 경우를 시각화합니다." },
  { id: "collision", label: "접힘선 UI 충돌", sub: "Crease collision", description: "버튼과 중요 정보를 가운데 힌지 위에 배치한 잘못된 UI 사례입니다." },
  { id: "crack", label: "가운데 크랙 발생", sub: "Fictional display damage", description: "중앙 크랙, 녹색 줄, 검은 번짐을 연출합니다. 실제 기기 고장이나 발생 확률을 뜻하지 않습니다." },
];
const appNames: Record<App,string> = { home: "홈", messages: "메시지", browser: "브라우저", camera: "카메라" };

function AppContent({ app }: { app: App }) {
  return <div className="preview-app">
    <div className="preview-app-heading">
      <span className="app-emblem">{app === "messages" ? "✉" : app === "camera" ? "◎" : app === "browser" ? "◉" : "◈"}</span>
      <div><small>DUO OS / PREVIEW</small><strong>{appNames[app]}</strong></div>
      <span className="app-menu">•••</span>
    </div>
    <div className="preview-banner">
      <small>DISCOVER MORE</small>
      <strong>{app === "messages" ? "대화, 더 넓게." : app === "camera" ? "순간을 더 크게." : app === "browser" ? "더 넓은 세상." : "Hello, future."}</strong>
      <span>앱의 화면 적응을 체험하세요.</span>
    </div>
    <div className="preview-cards">
      <div className="preview-card"><span>01</span><strong>Today</strong><i /></div>
      <div className="preview-card"><span>02</span><strong>Explore</strong><i /></div>
    </div>
    <div className="preview-list"><span /><span /><span /></div>
  </div>;
}
function DeviceScreen({ mode, app }: { mode: Mode; app: App }) {
  if (mode === "letterbox") return <div className="letterbox-layout"><div className="letterbox-app"><AppContent app={app}/></div><span className="unused-area left">UNUSED SPACE</span><span className="unused-area right">UNUSED SPACE</span></div>;
  if (mode === "split") return <div className="split-layout"><div className="split-filled"><AppContent app={app}/></div><div className="split-empty"><span>⚠</span><strong>NO SECOND PANE</strong><small>확장된 화면을 활용하지 못했습니다.</small></div></div>;
  if (mode === "collision") return <div className="collision-layout"><div className="collision-title">WELCOME BACK</div><div className="collision-panels"><div /><div /><div /><div /></div><button className="collision-button" tabIndex={-1}>중앙에 걸친 확인 버튼</button><p>접힘선이 버튼과 텍스트를 가립니다.</p></div>;
  return <AppContent app={app}/>;
}

export default function Experience() {
  const engine = useRef<Engine>(createFallbackEngine());
  const [snapshot,setSnapshot] = useState<Snapshot>(engine.current.snapshot());
  const [ready,setReady] = useState(false);
  const [wasm,setWasm] = useState(false);
  const [mode,setMode] = useState<Mode>("normal");
  const [showDamage,setShowDamage] = useState(true);
  useEffect(() => {
    let active = true;
    loadEngine().then(({engine: next,wasm: enabled}) => {
      if(!active) return;
      engine.current = next;
      setSnapshot(next.snapshot());
      setWasm(enabled);
      setReady(true);
    });
    return () => { active = false; };
  },[]);
  const act = (action: Action) => {
    if(!ready) return;
    setSnapshot(engine.current.dispatch(action));
    if(action === "reset") { setMode("normal"); setShowDamage(true); }
  };
  const open = snapshot.fold === "open";
  const current = modes.find(item => item.id === mode)!;
  return <main className="page">
    <header className="topbar"><a href="/" className="brand"><span className="brand-symbol">D/</span> duo experience</a><span className="top-label">INDEPENDENT CONCEPT DEMO <i/></span></header>
    <div className="intro"><div className="eyebrow">INTERACTIVE DISPLAY LAB <span> / </span> UNOFFICIAL</div><h1>펼치는 순간,<br/><em>문제가 보인다.</em></h1><p>가운데 크랙과 앱 최적화 실패 화면을 직접 비교해 보는 가상 폴더블폰 시뮬레이터.</p></div>
    <div className="studio">
      <section className="preview-section" aria-label="듀오 기기 시뮬레이션">
        <div className="section-top"><span><b>01</b> DEVICE VISUALIZER</span><span className="live"><i/> {open?"UNFOLDED":"FOLDED"}</span></div>
        <div className="device-stage">
          <div className="stage-glow" />
          <div data-testid="device" aria-label={open?"펼쳐진 가상 기기":"접힌 가상 기기"} className={`duo-device ${open?"unfolded":"folded"}`}>
            <div className="glass"><div className="screen-status"><span>9:41</span><span>◢ 5G ▰</span></div>
              <div className="screen-inner">{open?<DeviceScreen mode={mode} app={snapshot.app}/>:<div className="cover-screen"><span>DUO</span><strong>9:41</strong><small>화면을 펼쳐보세요</small></div>}</div>
              {open && <><div className="crease" aria-hidden="true"/>{mode === "crack" && showDamage && <div data-testid="crack-effect" className="damage" aria-label="중앙 크랙 시각 효과"><svg viewBox="0 0 160 450" preserveAspectRatio="none"><path d="M77 0 L83 49 L72 78 L87 110 L75 148 L86 183 L69 213 L82 240 L73 271 L89 302 L71 326 L80 364 L74 399 L81 450" stroke="#e6faff" strokeWidth="2.8" fill="none"/><path d="M72 78 L30 58 L19 36 M87 110 L122 91 L138 64 M69 213 L23 232 L0 222 M89 302 L141 276 L160 286 M74 399 L24 420" stroke="#efffff" strokeWidth="1.8" fill="none"/><path d="M81 450 L73 355 L84 291 L74 222 L82 146 L78 0" stroke="#51ff91" strokeWidth="3" fill="none" opacity=".95"/></svg><div className="bleed"/></div>}</>}
              <div className="home-line"/>
            </div>
          </div>
          <div className="stage-bottom"><span>● {ready ? wasm?"RUST / WEBASSEMBLY":"TS FALLBACK":"ENGINE LOADING"}</span><span>FOLD EVENTS {snapshot.unfold_count.toString().padStart(2,"0")}</span></div>
        </div>
        <div className="device-actions"><button disabled={!ready} onClick={()=>act(open?"fold":"unfold")} className="action-primary">{open?"⇥ 접기":"⇤ 펼치기"}</button><button disabled={!ready} onClick={()=>act("home")}>홈 화면</button><button disabled={!ready} onClick={()=>act("reset")}>↻ 초기화</button></div>
        <div className="app-tabs" role="group" aria-label="앱 변경">{(["home","messages","browser","camera"] as App[]).map(app=><button disabled={!ready} aria-pressed={snapshot.app===app} className={snapshot.app===app?"active":""} onClick={()=>act(app)} key={app}>{appNames[app]}</button>)}</div>
        {mode==="crack" && <label className="damage-toggle"><input type="checkbox" checked={showDamage} onChange={e=>setShowDamage(e.target.checked)}/> 크랙 효과 표시</label>}
      </section>
      <aside className="side-panel"><div className="section-top"><span><b>02</b> ISSUE REPRODUCTION</span><span className="issue-count">05 PRESETS</span></div><div className="panel-intro"><small>CHOOSE A VISUAL MODE</small><h2>어떤 문제가<br/>보이나요?</h2><p>버튼을 선택하면 기기 화면이 해당 상태로 즉시 바뀝니다.</p></div>
        <div className="modes">{modes.map((m,i)=><button key={m.id} onClick={()=>{setMode(m.id);if(!open&&ready)act("unfold");}} className={mode===m.id?"mode active":"mode"} aria-pressed={mode===m.id}><span className="mode-num">0{i+1}</span><span className="mode-name"><strong>{m.label}</strong><small>{m.sub}</small></span><span className="mode-chevron">↗</span></button>)}</div>
        <div className="mode-detail" aria-live="polite"><small>CURRENT SCENE / {current.sub.toUpperCase()}</small><h3>{current.label}</h3><p>{current.description}</p></div><div className="safety-note"><strong>CREATIVE SIMULATION</strong><p>이 데모는 특정 제품의 확인된 결함을 주장하지 않습니다. 크랙, 녹색 줄, 앱 호환성 문제는 이해를 돕기 위한 창작 시각 효과입니다.</p></div>
      </aside>
    </div>
    <footer>DUO EXPERIENCE · INDEPENDENT VISUAL EXPERIMENT <span>Apple 또는 Samsung과 제휴하지 않은 비공식 시뮬레이터입니다.</span></footer>
  </main>;
}
