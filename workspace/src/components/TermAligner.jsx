// [개발 > 서비스/웹] ③ 부서별 용어 차이 맞추기
import React, { useState } from 'react';
import { Badge, Button, Card, cx, StepHeader, TextButton } from './ui.jsx';

function TermCard({ term, chosen, onConfirm, onUndo }) {
  const [picked, setPicked] = useState(chosen ?? '');
  const done = Boolean(chosen);
  const selected = term.meanings.find((item) => item.team === (done ? chosen : picked));
  const groupName = `term-${term.id}`;

  return (
    <li className={cx('rounded-xl border p-6 transition-colors duration-300 motion-reduce:transition-none',
      done ? 'border-sage/30 bg-mint' : 'border-line bg-white')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-7">‘{term.word}’</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            {done ? '회사 표준 뜻으로 맞췄어요' : `부서 ${term.meanings.length}곳이 서로 다른 뜻으로 써요`}
          </p>
        </div>
        <Badge tone={done ? 'done' : 'warn'}>{done ? '✓ 통일됨' : '충돌'}</Badge>
      </div>

      <fieldset className="mt-5" disabled={done}>
        <legend className="mb-3 text-xs font-semibold text-muted">대표 뜻을 하나 골라 주세요</legend>
        <div className="flex flex-col gap-2.5">
          {term.meanings.map((item) => {
            const active = (done ? chosen : picked) === item.team;
            return (
              <label key={item.team}
                className={cx('flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors motion-reduce:transition-none',
                  active ? 'border-ink/40 bg-white' : 'border-line bg-white',
                  done ? (active ? '' : 'opacity-50') : 'cursor-pointer hover:bg-memo')}>
                <input type="radio" name={groupName} value={item.team} checked={active}
                  onChange={() => setPicked(item.team)} className="size-4 shrink-0 accent-ink" />
                <span className="w-14 shrink-0 font-semibold">{item.team}</span>
                <span className="min-w-0 text-muted">{item.meaning}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {done ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6">표준 뜻: <strong>{selected?.meaning}</strong> <span className="text-muted">({chosen} 기준)</span></p>
          <TextButton onClick={() => { setPicked(chosen); onUndo(term.id); }}>다시 고르기</TextButton>
        </div>
      ) : (
        <>
          <Button className="mt-5 w-full" disabled={!picked} onClick={() => onConfirm(term.id, picked)}>
            선택한 뜻으로 표준 확정
          </Button>
          {!picked && <p className="mt-2 text-center text-xs text-muted">먼저 위에서 대표 뜻을 골라 주세요</p>}
        </>
      )}
    </li>
  );
}

export default function TermAligner({ terms, standardized, onConfirm, onUndo }) {
  return (
    <Card aria-labelledby="terms-heading" className="flex flex-col gap-6 p-6 sm:p-7">
      <StepHeader step="3" id="terms-heading" title="부서별 용어 차이 맞추기"
        description="같은 단어를 부서마다 다르게 써요. 회사가 쓸 대표 뜻 하나로 맞춰요." />
      <ul className="flex flex-col gap-6">
        {terms.map((term) => (
          <TermCard key={term.id} term={term} chosen={standardized[term.id]} onConfirm={onConfirm} onUndo={onUndo} />
        ))}
      </ul>
    </Card>
  );
}
