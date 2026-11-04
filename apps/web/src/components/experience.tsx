"use client";

import { useEffect, useRef, useState } from "react";
import { createFallbackEngine, loadEngine, type Action, type Engine, type Snapshot } from "@/lib/simulator";

type ScenarioId = "multitask" | "repair" | "display";
type Scenario = { id: ScenarioId; title: string; category: string; description: string; button: string; outcome: string };
const scenarios: Scenario[] = [
  {
    id: "multitask", title: "멀티태스킹 실험", category: "인터랙티브 데모",
    description: "가상의 메모와 브라우저를 동시에 띄워보세요. 좁은 화면과 넓은 화면의 차이를 비교합니다.",
    button: "분할 화면 실행",
    outcome: "분할 화면이 켜졌습니다. 기기를 접고 펼치며 화면 구성을 비교하세요.",
  },
  {
    id: "repair", title: "수리 상담 시뮬레이션", category: "창작 풍자",
    description: "예상치 못한 수리 상담을 가상으로 경험합니다. 견적과 보증 정책은 실제 사실이 아닙니다.",
    button: "가상 상담 시작",
    outcome: "상담사: 먼저 기기를 재부팅해 보셨나요? 이 대화는 코미디를 위한 창작입니다.",
  },
  {
    id: "display", title: "디스플레이 테스트", category: "가상 사고 실험",
    description: "선택적으로 화면에 시각 효과를 적용합니다. 고장 빈도나 실제 기기 내구성을 뜻하지 않습니다.",
    button: "가상 화면 이상 재현",
    outcome: "시각 효과가 적용됐습니다. 실제 제품의 고장 가능성을 보여주는 것이 아닙니다.",
  },
];
const appNames = { home: "홈", messages: "메시지", browser: "브라우저", camera: "카메라" } as const;

export default function Experience() {
  const engine = useRef<Engine>(createFallbackEngine());
  const [snapshot, setSnapshot] = useState<Snapshot>(engine.current.snapshot());
  const [wasm, setWasm] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<ScenarioId>("multitask");
  const [active, setActive] = useState<ScenarioId | null>(null);
  const [completed, setCompleted] = useState<ScenarioId[]>([]);
  const [report, setReport] = useState(false);

  useEffect(() => {
    let alive = true;
    loadEngine().then(({ engine: next, wasm: wasmLoaded }) => {
      if (!alive) return;
      engine.current = next;
      setSnapshot(next.snapshot());
      setWasm(wasmLoaded);
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  const dispatch = (action: Action) => {
    if (!ready) return;
    setSnapshot(engine.current.dispatch(action));
    if (action === "reset") {
      setSelected("multitask");
      setCompleted([]);
      setActive(null);
      setReport(false);
    }
  };
  const runScenario = () => {
    setActive(selected);
    setReport(false);
    if (!completed.includes(selected)) setCompleted(items => [...items, selected]);
    if (selected === "multitask" && snapshot.fold === "closed") dispatch("unfold");
  };
  const chosen = scenarios.find(item => item.id === selected)!;
  const activeScenario = scenarios.find(item => item.id === active);
  const isOpen = snapshot.fold === "open";

  return (
    <main className="layout">
      <header className="header">
        <a className="logo" href="/" aria-label="Duo Experience 홈">duo<span>experience</span><span className="logo-dot">.</span></a>
        <span className="tag">INDEPENDENT · SATIRE PROJECT</span>
      </header>
      <section className="intro">
        <span className="eyebrow"><span className="eyebrow-dot" /> THE INTERACTIVE CONCEPT LAB</span>
        <h1>기대했던 미래,<br /><em>직접 만져보세요.</em></h1>
        <p>가상의 폴더블폰을 펼치고, 앱을 실행하고, 어쩌면 조금 당황스러운 상황도 경험해 보세요.</p>
      </section>
      <div className="workspace">
        <section className="demo" aria-label="가상 스마트폰 체험">
          <div className="demo-head"><span className="live-dot" /> LIVE DEVICE PREVIEW <span className="demo-state">{isOpen ? "UNFOLDED" : "FOLDED"}</span></div>
          <div className="stage">
            <div className={isOpen ? "phone open" : "phone closed"} aria-label={isOpen ? "펼쳐진 가상 기기" : "접힌 가상 기기"}>
              <div className="phone-screen">
                <div className="status"><span>9:41</span><span>● ▰ ▰</span></div>
                {active === "multitask" ? (
                  <div className="split-pane">
                    <div><strong>메모</strong><p>오늘 할 일</p><span>□ 경험하기</span><span>□ 비교하기</span><span>□ 공유하기</span></div>
                    <div><strong>브라우저</strong><p>DUO LAB</p><span>새로운 화면을 탐색 중입니다.</span></div>
                  </div>
                ) : (
                  <>
                    {snapshot.app === "home" ? (
                      <div className="home-screen">
                        <div className="device-date">WEDNESDAY, NOV 4</div>
                        <div className="greeting">Hello,<br />tomorrow.</div>
                        <div className="apps">
                          {(["messages", "browser", "camera"] as const).map(app => (
                            <button key={app} className="app-icon" onClick={() => { setActive(null); dispatch(app); }} aria-label={appNames[app] + " 앱 실행"}>
                              <span aria-hidden="true">{app === "messages" ? "✉" : app === "browser" ? "◎" : "◉"}</span>
                              <small>{appNames[app]}</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="active-app">
                        <button className="back" onClick={() => dispatch("home")}>‹ 홈으로</button>
                        <h2>{appNames[snapshot.app]}</h2>
                        <p>{snapshot.app === "messages" ? "새로운 메시지가 없습니다." : snapshot.app === "browser" ? "새로운 웹 경험을 탐색해 보세요." : "실제 카메라를 사용하지 않는 가상 화면입니다."}</p>
                      </div>
                    )}
                  </>
                )}
                {active === "display" && <div className="display-effect" aria-label="가상 디스플레이 이상 효과"><span /></div>}
                {active === "repair" && <div className="repair-overlay"><span>SUPPORT CHAT · PARODY</span><p>먼저 기기를 재부팅해 보셨나요?</p><small>실제 상담 또는 수리 안내가 아닙니다.</small></div>}
                <div className="fold-line" aria-hidden="true" />
                <div className="home-indicator" />
              </div>
            </div>
          </div>
          <div className="controls" aria-label="기기 조작">
            <button disabled={!ready} onClick={() => dispatch(isOpen ? "fold" : "unfold")}>{isOpen ? "→ 접기" : "↔ 펼치기"}</button>
            <button disabled={!ready} onClick={() => { setActive(null); dispatch("home"); }} className="secondary">홈 화면</button>
            <button disabled={!ready} onClick={() => dispatch("reset")} className="secondary">초기화</button>
          </div>
          <div className="metrics" role="status" aria-live="polite">
            <span><i className={wasm ? "engine-dot on" : "engine-dot"} /> {!ready ? "엔진 로딩 중" : wasm ? "Rust / WASM 엔진" : "TypeScript 폴백"}</span>
            <span>펼치기 <strong>{snapshot.unfold_count}회</strong></span>
            <span>조작 <strong>{snapshot.actions}회</strong></span>
          </div>
        </section>
        <aside className="sidebar">
          <div className="side-title"><span>01 / EXPERIENCE LAB</span><h2>어떤 상황을<br />체험할까요?</h2><p>모든 시나리오는 비공식 가상 체험입니다.</p></div>
          <div className="scenario-list">
            {scenarios.map((item, index) => (
              <button key={item.id} aria-pressed={selected === item.id} className={"scenario " + (selected === item.id ? "selected" : "")} onClick={() => setSelected(item.id)}>
                <span className="scenario-index">0{index + 1}</span>
                <span className="scenario-info"><strong>{item.title}{completed.includes(item.id) ? " ✓" : ""}</strong><small>{item.category}</small></span>
                <span aria-hidden="true" className="scenario-arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="scenario-detail" aria-live="polite">
            <strong>{chosen.title}</strong>
            <p>{chosen.description}</p>
            <button disabled={!ready} onClick={runScenario}>{chosen.button} <span aria-hidden="true">↗</span></button>
          </div>
          {activeScenario && <p className="outcome" role="status">{activeScenario.outcome} <button onClick={() => setActive(null)}>효과 닫기</button></p>}
          <button className="report-btn" onClick={() => setReport(value => !value)}>{report ? "체험 보고서 닫기" : "내 체험 보고서 확인"} <span aria-hidden="true">↗</span></button>
          {report && <div className="report" role="region" aria-label="체험 보고서"><h3>MY EXPERIENCE</h3><p>완료한 시나리오 <strong>{completed.length} / {scenarios.length}</strong></p><p>기기 조작 {snapshot.actions}회 · 펼치기 {snapshot.unfold_count}회</p><p>이 결과는 실제 제품 성능을 나타내지 않는 가상 체험 기록입니다.</p></div>}
        </aside>
      </div>
      <footer><span>DUO EXPERIENCE © 2026</span><span>비공식 풍자·교육용 프로젝트입니다. Apple 또는 Samsung과 제휴하지 않았으며, 실제 기기·결함·가격·보증 정책을 재현하지 않습니다.</span></footer>
    </main>
  );
}
