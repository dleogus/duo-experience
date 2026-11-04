"use client";

import { useEffect, useRef, useState } from "react";
import { createFallbackEngine, loadEngine, type Action, type Engine, type Snapshot } from "@/lib/simulator";

const scenarios = [
  { id: "multitask", title: "멀티태스킹 체험", category: "가상 기능", description: "두 앱을 동시에 사용한다고 상상해 보세요. 작은 공간에서 UI 배치가 얼마나 중요한지 확인합니다." },
  { id: "repair", title: "수리 상담 체험", category: "창작 풍자", description: "가상의 상담사가 예상하지 못한 수리 절차를 안내합니다. 실제 보증 조건이나 가격을 나타내지 않습니다." },
  { id: "display", title: "디스플레이 이슈 체험", category: "창작 풍자", description: "화면 결함 상황을 선택적으로 시뮬레이션합니다. 실제 제품 고장 확률과 관계가 없습니다." },
] as const;

type ScenarioId = typeof scenarios[number]["id"];

export default function Experience() {
  const engine = useRef<Engine>(createFallbackEngine());
  const [snapshot, setSnapshot] = useState<Snapshot>(engine.current.snapshot());
  const [wasm, setWasm] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<ScenarioId | null>(null);
  const [completed, setCompleted] = useState<ScenarioId[]>([]);
  const [report, setReport] = useState(false);

  useEffect(() => {
    let active = true;
    loadEngine().then(({ engine: next, wasm: isWasm }) => {
      if (!active) return;
      engine.current = next;
      setSnapshot(next.snapshot());
      setWasm(isWasm);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const dispatch = (action: Action) => {
    setSnapshot(engine.current.dispatch(action));
    if (action === "reset") { setSelected(null); setCompleted([]); setReport(false); }
  };

  const finish = () => {
    if (selected && !completed.includes(selected)) setCompleted(items => [...items, selected]);
    setSelected(null);
  };

  return (
    <main className="layout">
      <header className="header">
        <a className="logo" href="/" aria-label="Duo Experience 홈">DUO<span>EXPERIENCE</span></a>
        <span className="tag">UNOFFICIAL · SATIRE</span>
      </header>
      <section className="intro">
        <span className="eyebrow">INTERACTIVE DEVICE CONCEPT</span>
        <h1>상상 속 폴더블폰을<br /><em>직접 사용해 보세요.</em></h1>
        <p>화면을 접고, 가상의 앱을 실행하고, 불편함을 체험하는 실험적인 웹 시뮬레이터입니다.</p>
      </section>
      <div className="workspace">
        <section className="demo" aria-label="가상 스마트폰">
          <div className={snapshot.fold === "open" ? "phone open" : "phone closed"}>
            <div className="phone-screen">
              <div className="status"><span>9:41</span><span>◉ ▰</span></div>
              {snapshot.app === "home" ? (
                <div className="home-screen">
                  <div className="greeting">Good morning.</div>
                  <div className="apps">
                    {(["messages", "browser", "camera"] as const).map(app => (
                      <button key={app} onClick={() => dispatch(app)} className="app-icon">
                        <span aria-hidden="true">{app === "messages" ? "✉" : app === "browser" ? "◎" : "◉"}</span>
                        <small>{app === "messages" ? "메시지" : app === "browser" ? "브라우저" : "카메라"}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="active-app">
                  <button className="back" onClick={() => dispatch("home")}>‹ 홈으로</button>
                  <h2>{snapshot.app === "messages" ? "메시지" : snapshot.app === "browser" ? "브라우저" : "카메라"}</h2>
                  <p>{snapshot.app === "messages" ? "새로운 메시지가 없습니다." : snapshot.app === "browser" ? "새로운 웹 경험을 탐색해 보세요." : "이것은 가상 카메라입니다."}</p>
                </div>
              )}
              <div className="fold-line" aria-hidden="true" />
              <div className="home-indicator" />
            </div>
          </div>
          <div className="controls">
            <button onClick={() => dispatch(snapshot.fold === "closed" ? "unfold" : "fold")}>
              {snapshot.fold === "closed" ? "↔ 펼치기" : "→ 접기"}
            </button>
            <button onClick={() => dispatch("home")} className="secondary">홈 화면</button>
            <button onClick={() => dispatch("reset")} className="secondary">초기화</button>
          </div>
          <div className="metrics" role="status">
            <span>엔진: <strong>{!ready ? "불러오는 중" : wasm ? "Rust / WASM" : "TypeScript 폴백"}</strong></span>
            <span>펼친 횟수: <strong>{snapshot.unfold_count}</strong></span>
            <span>조작: <strong>{snapshot.actions}</strong></span>
          </div>
        </section>
        <aside className="sidebar">
          <div className="side-title"><span>01 / EXPERIMENTS</span><h2>체험 시나리오</h2><p>실제 기기 검증 결과가 아닌 가상 인터랙션입니다.</p></div>
          <div className="scenario-list">
            {scenarios.map(item => (
              <button key={item.id} className={"scenario " + (selected === item.id ? "selected" : "")} onClick={() => setSelected(item.id)}>
                <span className="scenario-name">{item.title}{completed.includes(item.id) ? " ✓" : ""}</span>
                <small>{item.category}</small>
              </button>
            ))}
          </div>
          {selected ? <div className="scenario-detail">
            <strong>{scenarios.find(item => item.id === selected)?.title}</strong>
            <p>{scenarios.find(item => item.id === selected)?.description}</p>
            <button onClick={finish}>체험 완료</button>
          </div> : <p className="hint">시나리오를 선택해 체험 내용을 살펴보세요.</p>}
          <button className="report-btn" onClick={() => setReport(value => !value)}>{report ? "보고서 닫기" : "내 체험 보고서 보기"}</button>
          {report && <div className="report" role="region" aria-label="체험 보고서"><h3>MY EXPERIENCE</h3><p>완료 시나리오 {completed.length}/{scenarios.length}</p><p>기기 조작 {snapshot.actions}회 · 펼치기 {snapshot.unfold_count}회</p><p>이 보고서는 창작된 가상 체험 결과입니다.</p></div>}
        </aside>
      </div>
      <footer>비공식 풍자/교육용 시뮬레이터입니다. Apple·Samsung과 제휴하지 않았으며 실제 제품의 결함·가격·보증을 설명하는 공식 자료가 아닙니다.</footer>
    </main>
  );
}
