"use client";

import { useEffect, useRef, useState } from "react";
import { createFallbackEngine, loadEngine, type Action, type AppId, type Engine, type Snapshot } from "@/lib/simulator";

type Scenario = "normal" | "bad-layout" | "crack";
const icons: { id: AppId; glyph: string; title: string; style: string }[] = [
  { id: "messages", glyph: "●●", title: "메시지", style: "mint" },
  { id: "browser", glyph: "◎", title: "Safari", style: "sky" },
  { id: "gallery", glyph: "✿", title: "사진", style: "white" },
  { id: "camera", glyph: "◉", title: "카메라", style: "slate" },
  { id: "notes", glyph: "▤", title: "메모", style: "yellow" },
];
const damageLabels = ["정상", "접힘 자국", "미세 균열", "패널 손상", "심한 화면 손상"];
const crackPaths = [
  "M 500 10 L 501 96 494 142 505 179 499 238 503 301 496 367 500 425 493 490 500 560 494 628 502 700 497 790 502 900",
  "M 503 201 L 469 224 458 259 425 286 411 324 M 499 305 L 537 330 548 363 589 382 M 498 426 L 463 449 448 492 418 503 402 532",
  "M 498 547 L 535 564 558 598 600 616 621 645 M 500 671 L 465 699 455 735 425 747 M 497 143 L 526 124 553 120",
  "M 501 324 L 482 347 471 383 439 402 M 500 579 L 471 590 447 616 429 651 M 500 738 L 533 767 544 800 575 825",
];

function DamageOverlay({level}: {level:number}) {
  return <div className={`damage-overlay damage-level-${level}`} aria-hidden="true">
    <div className="crease-shadow" />
    <div className="oled-glow" />
    <div className="oled-bleed" />
    <div className="dead-strip" />
    <svg className="crack-svg" viewBox="0 0 1000 900" preserveAspectRatio="none" aria-hidden="true">
      <defs><filter id="crack-halo"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g className="crack-glow" filter="url(#crack-halo)">{crackPaths.map((d,i)=><path key={i} d={d}/>)}</g>
      <g className="crack-lines">{crackPaths.map((d,i)=><path key={i} className={`crack-path crack-path-${i}`} d={d}/>)}</g>
    </svg>
    <div className="scanlines" />
  </div>;
}

function AppContent({app, broken, onHome}: {app:AppId;broken:boolean;onHome:()=>void}) {
  if (app === "home") return null;
  return <div className={`opened-app ${broken?"unoptimized":""}`}>
    <div className="app-toolbar"><button onClick={onHome} aria-label="홈으로 돌아가기">‹ 홈</button><strong>{icons.find(i=>i.id===app)?.title}</strong><span>•••</span></div>
    {app === "messages" ? <div className="message-list"><h2>메시지</h2><p className="message-item">🟢 친구 <span>오후 9:41</span><small>화면 가운데가… 괜찮아?</small></p><p className="message-item">🔵 DUO LAB <span>어제</span><small>새로운 폼팩터를 체험해 보세요.</small></p></div>
    : app === "browser" ? <div className="browser-app"><div className="fake-address">🔒 duolab.example</div><h2>큰 화면을 위한 작은 웹</h2><p>화면을 펼쳤는데, 웹사이트는 아직 작은 화면을 기억하고 있습니다.</p><div className="browser-skeleton"/><div className="browser-skeleton second"/></div>
    : app === "gallery" ? <div className="gallery-app"><h2>최근 항목</h2><div className="photos"><span>🌇</span><span>🌊</span><span>🌸</span><span>🌃</span></div></div>
    : app === "camera" ? <div className="camera-app"><div className="viewfinder"><span>가상 카메라 화면</span></div><div className="shutter" /></div>
    : <div className="notes-app"><h2>오늘의 메모</h2><p>✓ 폴더블폰 펼치기</p><p>✓ 큰 화면에서 앱 실행하기</p><p>□ 크랙은 가상의 연출임을 기억하기</p></div>}
    {broken && <div className="layout-warning">이 화면은 넓은 디스플레이에 최적화되지 않은 앱을 풍자적으로 연출한 것입니다.</div>}
  </div>;
}

export default function Experience() {
  const engine = useRef<Engine>(createFallbackEngine());
  const [state,setState] = useState<Snapshot>(engine.current.snapshot());
  const [wasm,setWasm] = useState(false);
  const [ready,setReady] = useState(false);
  const [scenario,setScenario] = useState<Scenario>("normal");
  const [showControls,setShowControls] = useState(true);
  const [showInfo,setShowInfo] = useState(false);
  const [fullscreen,setFullscreen] = useState(false);
  useEffect(() => {
    let live = true;
    loadEngine().then(({engine:next,wasm:loaded}) => {
      if(!live)return;
      engine.current = next;setState(next.snapshot());setWasm(loaded);setReady(true);
    });
    return () => {live=false;};
  },[]);
  useEffect(()=>{
    const onChange=()=>setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange",onChange);
    return ()=>document.removeEventListener("fullscreenchange",onChange);
  },[]);
  const send=(action:Action)=>{
    if(!ready)return;
    setState(engine.current.dispatch(action));
    if(action==="reset")setScenario("normal");
  };
  const nextDamage=()=>{
    setScenario("crack");
    send("stress");
  };
  const chooseScenario=(value:Scenario)=>{
    setScenario(value);
    if(value==="normal")send("reset");
    if(value==="crack")send("stress");
    if(value==="bad-layout" && state.app==="home")send("browser");
  };
  const toggleFullscreen=async()=>{
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }catch{/* Fullscreen API may be unavailable on mobile Safari. */}
  };
  const onHome=()=>send("home");
  const opened=state.fold==="open";
  const damage=scenario==="crack"?Math.max(1,state.damage):state.damage;
  const broken=scenario==="bad-layout";

  return <main className={`immersive ${opened?"device-open":"device-closed"} ${showControls?"ui-visible":"ui-hidden"}`}>
    <section className="virtual-display" aria-label="비공식 가상 폴더블폰 화면">
      <div className="wallpaper" aria-hidden="true"><div className="wallpaper-light"/><div className="wallpaper-orb"/></div>
      <div className="system-status"><span>9:41</span><span className="island" aria-hidden="true"/><span>●●● ▰</span></div>
      <div className="display-content">
        {state.app==="home" ? <>
          <div className="top-widgets">
            <div className="date-widget"><small>THURSDAY</small><strong>05</strong><span>NOVEMBER · 2026</span></div>
            <div className="weather-widget"><span>☀</span><strong>21°</strong><small>오늘은 펼치기 좋은 날</small></div>
          </div>
          <div className="hero-copy"><small>DUO / EXPERIENCE</small><h1>Think<br/>outside<br/><i>the fold.</i></h1><p>터치하고, 펼치고, 균열을 실험해 보세요.</p></div>
          <div className="app-grid">{icons.map(icon=><button key={icon.id} className="app-tile" onClick={()=>send(icon.id)}><span className={`app-symbol ${icon.style}`}>{icon.glyph}</span><small>{icon.title}</small></button>)}</div>
        </> : <AppContent app={state.app} broken={broken} onHome={onHome}/>}
      </div>
      <div className="dock"><button onClick={onHome} aria-label="홈 화면">⌂</button><button onClick={()=>send("messages")} aria-label="메시지 열기">●●</button><button onClick={()=>send("browser")} aria-label="브라우저 열기">◎</button><button onClick={()=>send("camera")} aria-label="카메라 열기">◉</button></div>
      <button className="crease-touch" onClick={nextDamage} aria-label="중앙 접힘 부위를 눌러 가상 균열 효과 증가" title="접힘 부위를 탭해보세요"/>
      <DamageOverlay level={damage}/>
      {!opened&&<div className="fold-cover"><span>DUO</span><strong>9:41</strong><small>화면이 접혔습니다</small><button onClick={()=>send("unfold")}>↗ 펼치기</button></div>}
      <div className="home-bar"/>
    </section>
    <div className="control-top">
      <span className="identity">DUO<span>EXPERIENCE</span><b>CONCEPT / NOT A REAL DEVICE</b></span>
      <div className="top-actions">
        <button onClick={()=>setShowInfo(true)} aria-label="체험 안내">ⓘ</button>
        <button onClick={toggleFullscreen} aria-label={fullscreen?"전체 화면 종료":"전체 화면 시작"}>{fullscreen?"↙":"⛶"}</button>
        <button onClick={()=>setShowControls(value=>!value)} aria-label="조작 패널 표시 전환">{showControls?"✕":"☰"}</button>
      </div>
    </div>
    {showControls?<div className="control-panel" aria-label="시뮬레이션 조작 패널">
      <div className="control-header"><div><span className="lab-label">DISPLAY EXPERIENCE</span><strong>당신의 화면이, 가상 듀오가 됩니다.</strong></div><button onClick={()=>setShowControls(false)} aria-label="조작 패널 숨기기">−</button></div>
      <div className="scenario-tabs" role="group" aria-label="체험 종류">
        <button className={scenario==="normal"?"picked":""} onClick={()=>chooseScenario("normal")} disabled={!ready}>기본 화면</button>
        <button className={scenario==="bad-layout"?"picked":""} onClick={()=>chooseScenario("bad-layout")} disabled={!ready}>앱 최적화 오류</button>
        <button className={scenario==="crack"?"picked":""} onClick={()=>chooseScenario("crack")} disabled={!ready}>화면 크랙</button>
      </div>
      <div className="quick-actions">
        <button className="action-main" onClick={()=>send(opened?"fold":"unfold")} disabled={!ready}>{opened?"⇤ 접기":"⇥ 펼치기"}</button>
        <button onClick={nextDamage} disabled={!ready}>⌁ 균열 강화</button>
        <button onClick={()=>{send("reset");setScenario("normal");}} disabled={!ready}>↺ 초기화</button>
      </div>
      <div className="simulation-state"><span>DISPLAY <b>{damageLabels[damage] ?? "손상"}</b></span><span>FOLD <b>{state.unfold_count}</b></span><span>ENGINE <b>{!ready?"LOADING":wasm?"RUST / WASM":"TS FALLBACK"}</b></span></div>
      <p className="disclaimer">비공식·가상 풍자 체험입니다. 화면 균열, 앱 오류, 손상 진행은 창작된 시각 효과이며 특정 실제 제품의 결함이나 내구성에 관한 주장이 아닙니다.</p>
    </div>:<button className="reopen-panel" onClick={()=>setShowControls(true)}>☰ 체험 설정</button>}
    {showInfo&&<div className="modal-backdrop" role="presentation" onClick={()=>setShowInfo(false)}><section className="info-dialog" role="dialog" aria-modal="true" aria-label="체험 안내" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowInfo(false)}>✕</button><span>WELCOME TO DUO EXPERIENCE</span><h2>내 화면을 가상 폴더블폰으로.</h2><p>앱 아이콘을 눌러 실행하고 화면 중앙을 탭하면 크랙이 증가합니다. 아래 패널에서 접고 펼치거나 앱 최적화 오류를 연출할 수 있습니다.</p><p>이 프로젝트는 특정 제조사와 관계없는 독립적 풍자 체험입니다. 모든 파손과 결함은 가상 연출입니다.</p><button className="got-it" onClick={()=>setShowInfo(false)}>체험 시작하기 ↗</button></section></div>}
  </main>;
}
