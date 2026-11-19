// [개발 > 서비스/웹] ClueMap 진입점 — 헤더 · 요약 바 · 3단 워크스페이스
// Rebate Lens 작업 화면(audit-workspace)의 React + Vite + Tailwind 구조를 그대로 이어받았어요.
import React, { Component, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './components/Header.jsx';
import RuleExtractor from './components/RuleExtractor.jsx';
import SourceMap from './components/SourceMap.jsx';
import SummaryBar from './components/SummaryBar.jsx';
import TermAligner from './components/TermAligner.jsx';
import { scenarios } from './data/scenarios.js';
import { extractRules } from './lib/extractRules.js';
import { initialState, summarize } from './lib/progress.js';
import './style.css';

const freshStates = () => Object.fromEntries(scenarios.map((scenario) => [scenario.id, initialState(scenario)]));
const ruleKey = (rule) => rule.when + '→' + rule.then;

function App() {
  const [activeId, setActiveId] = useState(scenarios[0].id);
  const [states, setStates] = useState(freshStates);
  const [notice, setNotice] = useState({ text: '', tone: '' });

  const scenario = scenarios.find((item) => item.id === activeId) ?? scenarios[0];
  const state = states[scenario.id];
  const summary = useMemo(() => summarize(scenario, state), [scenario, state]);

  const update = (patch) => setStates((all) => {
    const current = all[scenario.id];
    return { ...all, [scenario.id]: { ...current, ...(typeof patch === 'function' ? patch(current) : patch) } };
  });

  function selectScenario(id) {
    setActiveId(id);
    setNotice({ text: '', tone: '' });
  }

  function handleExtract() {
    // 예시 메모를 그대로 두면 미리 다듬어 둔 규칙을, 고쳤으면 추출기 결과를 보여줘요.
    const unchanged = state.memo.trim() === scenario.memo.trim();
    const result = unchanged ? { rules: scenario.rules, error: '' } : extractRules(state.memo);
    if (result.error) {
      setNotice({ text: result.error, tone: 'warn' });
      return;
    }
    update((current) => {
      // 같은 문장의 규칙은 확정 상태를 그대로 이어가요.
      const confirmedKeys = new Set(current.rules.filter((rule) => current.confirmedRules.includes(rule.id)).map(ruleKey));
      return {
        rules: result.rules,
        confirmedRules: result.rules.filter((rule) => confirmedKeys.has(ruleKey(rule))).map((rule) => rule.id),
      };
    });
    setNotice({ text: `규칙 ${result.rules.length}개를 뽑았어요. 내용이 맞으면 [확정하기]를 눌러 주세요.`, tone: '' });
  }

  function resetAll() {
    setStates(freshStates());
    setNotice({ text: '처음 상태로 되돌렸어요.', tone: '' });
  }

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <Header scenarios={scenarios} activeId={scenario.id} onSelect={selectScenario} onReset={resetAll} meeting={scenario.meeting} />
      <SummaryBar summary={summary} />

      <main key={scenario.id}
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] xl:gap-8">
        <RuleExtractor memo={state.memo} sampleMemo={scenario.memo} rules={state.rules} confirmed={state.confirmedRules}
          notice={notice}
          onMemoChange={(memo) => update({ memo })}
          onRestoreMemo={() => update({ memo: scenario.memo })}
          onExtract={handleExtract}
          onConfirm={(id) => update((current) => ({ confirmedRules: [...current.confirmedRules, id] }))}
          onUndo={(id) => update((current) => ({ confirmedRules: current.confirmedRules.filter((item) => item !== id) }))} />
        <SourceMap scenario={scenario} answered={state.answered}
          onAnswer={(id) => update((current) => ({ answered: [...new Set([...current.answered, id])] }))}
          onUndo={(id) => update((current) => ({ answered: current.answered.filter((item) => item !== id) }))} />
        <TermAligner terms={scenario.terms} standardized={state.standardized}
          onConfirm={(id, team) => update((current) => ({ standardized: { ...current.standardized, [id]: team } }))}
          onUndo={(id) => update((current) => {
            const { [id]: _removed, ...rest } = current.standardized;
            return { standardized: rest };
          })} />
      </main>

      <footer className="pb-4 text-center text-xs leading-6 text-muted">
        화면의 회사·인물·금액은 모두 시연용 가상 예시예요. 입력한 메모는 이 브라우저 안에서만 처리되고 어디에도 보내지 않아요.
      </footer>
    </div>
  );
}

// [유지보수 > 장애 대응] 화면 일부가 깨져도 빈 화면 대신 안내를 보여줘요.
class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[ClueMap] 화면 오류', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-lg font-bold">화면을 그리다가 문제가 생겼어요.</p>
        <p className="mt-2 text-sm text-muted">새로고침하면 처음 상태로 다시 열려요.</p>
        <button type="button" onClick={() => location.reload()}
          className="mt-6 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">새로고침</button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
