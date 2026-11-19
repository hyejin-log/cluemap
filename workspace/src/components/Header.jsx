// [개발 > 서비스/웹] 상단 헤더 — 제목, 부제, 예시 미팅 전환(알약 버튼)
import React from 'react';
import { cx, TextButton } from './ui.jsx';

export default function Header({ scenarios, activeId, onSelect, onReset, meeting }) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        <p className="text-xs font-semibold tracking-wide text-muted">Lattice FDE · 현장 설계 보드</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">ClueMap</h1>
        <p className="mt-3 text-lg font-semibold leading-8">현업 인터뷰 기준 추출 &amp; 서류 빈칸 연결 보드</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          고객사 인터뷰 속 숨은 업무 기준을 규칙으로 뽑고, 서류 빈칸의 출처 누락과 부서별 용어 차이를 한눈에 맞춰요.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:items-end">
        <div role="group" aria-label="예시 미팅 고르기"
          className="flex w-full flex-col gap-1 rounded-2xl border border-line bg-white p-1 shadow-sm sm:w-auto sm:flex-row sm:rounded-full">
          {scenarios.map((scenario) => {
            const active = scenario.id === activeId;
            return (
              <button key={scenario.id} type="button" aria-pressed={active} onClick={() => onSelect(scenario.id)}
                className={cx('rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none sm:rounded-full',
                  active ? 'bg-ink text-white' : 'text-muted hover:bg-memo hover:text-ink')}>
                {scenario.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted">
          <span>지금 보는 미팅 · {meeting}</span>
          <TextButton onClick={onReset}>처음 상태로 되돌리기</TextButton>
        </div>
      </div>
    </header>
  );
}
