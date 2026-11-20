// [개발 > 서비스/웹] ③ 부서별 용어 차이 맞추기 — 하나만 고르지 않고 단계 이름으로 나눠요
//
// 부서마다 같은 단어를 서로 다른 '단계'에 쓰는 경우가 많아요.
// (예: '계약 확정' = 영업팀 견적 합의 → 법무팀 서명 → 재무팀 입금)
// 그래서 대표 뜻 하나를 고르는 대신, 일의 순서대로 단계마다 이름을 붙여 모든 부서의 뜻을 살려요.
import React, { useState } from 'react';
import { checkStageNames, defaultStageNames, MAX_STAGE_NAME, toStages } from '../lib/terms.js';
import { Badge, Button, Card, cx, StepHeader, TextButton } from './ui.jsx';

function StageFlow({ stages }) {
  return (
    <ol aria-label="정한 단계 이름 (일의 순서대로)" className="mt-5 flex flex-wrap items-start gap-x-2 gap-y-3">
      {stages.map((item, index) => (
        <li key={item.team} className="flex items-start gap-2">
          {index > 0 && <span aria-hidden="true" className="mt-2 text-sm text-sage/70">→</span>}
          <span className="flex flex-col rounded-lg border border-sage/30 bg-white px-3 py-2">
            <span className="text-sm font-bold leading-5">{item.stage}</span>
            <span className="mt-0.5 text-xs leading-4 text-muted">{item.team}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function TermCard({ term, stages, onConfirm, onUndo }) {
  const [names, setNames] = useState(() => (stages ? Object.fromEntries(stages.map((s) => [s.team, s.stage])) : defaultStageNames(term)));
  const [touched, setTouched] = useState(false);
  const done = Boolean(stages);
  const problem = checkStageNames(term, names);
  const hintId = `term-hint-${term.id}`;

  function confirm() {
    setTouched(true);
    if (!problem) onConfirm(term.id, toStages(term, names));
  }

  return (
    <li className={cx('rounded-xl border p-6 transition-colors duration-300 motion-reduce:transition-none',
      done ? 'border-sage/30 bg-mint' : 'border-line bg-white')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-7">‘{term.word}’</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {done
              ? `이제 ‘${term.word}’ 대신 아래 단계 이름으로 불러요`
              : `부서 ${term.meanings.length}곳이 서로 다른 단계를 같은 말로 불러요`}
          </p>
        </div>
        <Badge tone={done ? 'done' : 'warn'}>{done ? '✓ 통일됨' : '충돌'}</Badge>
      </div>

      {done ? (
        <>
          <StageFlow stages={stages} />
          <div className="mt-5 flex justify-end">
            <TextButton onClick={() => { setTouched(false); onUndo(term.id); }}>다시 고치기</TextButton>
          </div>
        </>
      ) : (
        <>
          <p className="mt-5 text-xs font-semibold text-muted">일의 순서대로 단계마다 이름을 붙여 주세요</p>
          <ol className="mt-3 flex flex-col">
            {term.meanings.map((item, index) => {
              const inputId = `stage-${term.id}-${index}`;
              return (
                <li key={item.team}>
                  {index > 0 && <div aria-hidden="true" className="ms-4 h-4 border-s-2 border-dashed border-line" />}
                  <div className="flex gap-3 rounded-lg border border-line bg-white p-4">
                    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-memo text-xs font-bold text-muted">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6">
                        <span className="font-semibold">{item.team}</span>
                        <span className="text-muted"> · {item.meaning}</span>
                      </p>
                      <label htmlFor={inputId} className="mt-2 block text-xs font-medium text-muted">이 단계의 이름</label>
                      <input id={inputId} type="text" value={names[item.team] ?? ''} maxLength={MAX_STAGE_NAME}
                        aria-describedby={hintId}
                        onChange={(event) => setNames({ ...names, [item.team]: event.target.value })}
                        onBlur={() => setTouched(true)}
                        className="mt-1 block w-full rounded-lg border border-line bg-memo px-3 py-2 text-sm font-semibold text-ink focus:border-ink/40 focus:bg-white focus:outline-none" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <Button className="mt-5 w-full" onClick={confirm} aria-describedby={hintId}>단계 이름으로 나눠 확정</Button>
          <p id={hintId} aria-live="polite" className={cx('mt-2 text-center text-xs leading-5', touched && problem ? 'text-coral' : 'text-muted')}>
            {touched && problem ? problem : '추천 이름을 그대로 쓰거나, 현업에서 부르는 말로 고쳐도 돼요'}
          </p>
        </>
      )}
    </li>
  );
}

export default function TermAligner({ terms, standardized, onConfirm, onUndo }) {
  return (
    <Card aria-labelledby="terms-heading" className="flex flex-col gap-6 p-6 sm:p-7">
      <StepHeader step="3" id="terms-heading" title="부서별 용어 차이 맞추기"
        description="같은 단어를 부서마다 다른 단계에 써요. 하나만 고르지 않고, 단계마다 이름을 나눠 모든 부서의 뜻을 살려요." />
      <ul className="flex flex-col gap-6">
        {terms.map((term) => (
          <TermCard key={term.id} term={term} stages={standardized[term.id]} onConfirm={onConfirm} onUndo={onUndo} />
        ))}
      </ul>
    </Card>
  );
}
