// [개발 > 서비스/웹] ② 서류 빈칸 출처 연결 — 교차선 없이 한 줄씩 읽는 가로 짝꿍 행
import React, { useState } from 'react';
import { Badge, Button, Card, cx, StepHeader, TextButton } from './ui.jsx';

function Connector({ state }) {
  const line = state === 'warn' ? 'border-t-2 border-dashed border-coral/60' : 'border-t-2 border-sage/50';
  const arrow = state === 'warn' ? 'text-coral/70' : 'text-sage/70';
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className={cx('hidden w-5 sm:block', line)} />
      <Badge tone={state === 'warn' ? 'warn' : 'done'} className="px-2 sm:px-2.5">
        {state === 'warn' ? '⚠' : '✓'}
        {/* 좁은 화면에서는 기호만 보여 빈칸 이름이 잘리지 않게 해요 */}
        <span className="hidden sm:inline">{state === 'warn' ? '확인 필요' : state === 'answered' ? '확인됨' : '연결됨'}</span>
      </Badge>
      <span className={cx('w-2 sm:w-5', line)} />
      <span className={cx('-ms-1.5 text-xs', arrow)}>▶</span>
    </div>
  );
}

function Box({ children, tone }) {
  return (
    <div className={cx('min-w-0 rounded-lg border px-3 py-2.5 text-sm font-semibold leading-5',
      tone === 'warn' ? 'border-coral/30 bg-white text-coral' : 'border-line bg-memo text-ink')}>
      {children}
    </div>
  );
}

function Row({ row, answered, open, onToggle, onAnswer, onUndo }) {
  const missing = !row.from;
  const state = !missing ? 'linked' : answered ? 'answered' : 'warn';
  const panelId = `question-${row.id}`;
  const statusText = state === 'warn' ? '출처를 확인해야 해요' : '출처가 확인됐어요';

  const content = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
      <Box tone={state === 'warn' ? 'warn' : undefined}>{row.from ?? (answered ? row.answeredFrom : '출처 불명')}</Box>
      <Connector state={state} />
      <Box>{row.field}</Box>
    </div>
  );

  return (
    <li className={cx('rounded-xl border transition-colors duration-300 motion-reduce:transition-none',
      state === 'warn' ? 'border-coral/30 bg-blush' : 'border-line bg-white', state === 'answered' && 'border-sage/30 bg-mint')}>
      {missing ? (
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}
          aria-label={`${row.field} 빈칸 · ${statusText} · ${open ? '질문 닫기' : '질문 열기'}`}
          className="block w-full rounded-xl p-3 text-left sm:p-4">
          {content}
        </button>
      ) : (
        <div className="p-3 sm:p-4" aria-label={`${row.field} 빈칸 · ${row.from}에서 가져와요`} role="group">{content}</div>
      )}

      {missing && (
        <div id={panelId} className={cx('grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')} inert={!open}>
          <div className="overflow-hidden">
            <div className="mx-3 mb-3 rounded-lg border border-line bg-white p-5 sm:mx-4 sm:mb-4">
              {answered ? (
                <>
                  <p className="text-xs font-semibold text-sage">✓ 담당자에게 확인했어요</p>
                  <p className="mt-2 text-sm leading-6">‘{row.field}’ 값은 <strong>{row.answeredFrom}</strong>에서 가져와요.</p>
                  <TextButton className="mt-3" onClick={onUndo}>확인 전으로 되돌리기</TextButton>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-coral">현업 담당자에게 꼭 물어볼 질문</p>
                  <p className="mt-2 text-[15px] font-semibold leading-7">“{row.question}”</p>
                  <Button tone="done" className="mt-4 w-full sm:w-auto" onClick={onAnswer}>질문 확인 완료</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function SourceMap({ scenario, answered, onAnswer, onUndo }) {
  const [openId, setOpenId] = useState(null);
  return (
    <Card aria-labelledby="map-heading" className="flex flex-col gap-6 p-6 sm:p-7">
      <StepHeader step="2" id="map-heading" title="서류 빈칸 출처 잇기"
        description={`${scenario.documentName}의 빈칸마다 값을 어디서 가져오는지 한 줄씩 확인해요.`} />

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="선 모양 안내">
        <li className="flex items-center gap-2"><span aria-hidden="true" className="w-6 border-t-2 border-sage/50" />출처 확인됨</li>
        <li className="flex items-center gap-2"><span aria-hidden="true" className="w-6 border-t-2 border-dashed border-coral/60" />어디서 가져올지 모름 · 눌러서 질문 보기</li>
      </ul>

      <div>
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 px-3 text-xs font-semibold text-muted sm:px-4" aria-hidden="true">
          <span>원본 자료</span><span className="text-center">상태</span><span>{scenario.documentName} 빈칸</span>
        </div>
        <ul className="flex flex-col gap-3">
          {scenario.sources.map((row) => (
            <Row key={row.id} row={row} answered={answered.includes(row.id)} open={openId === row.id}
              onToggle={() => setOpenId(openId === row.id ? null : row.id)}
              onAnswer={() => { onAnswer(row.id); setOpenId(null); }}
              onUndo={() => onUndo(row.id)} />
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-memo p-5">
        <p className="text-sm font-semibold">그 밖의 기본 빈칸 {scenario.autoLinked.length}개 · <span className="text-sage">모두 출처 확인됨</span></p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="자동으로 연결된 기본 빈칸">
          {scenario.autoLinked.map((field) => (
            <li key={field} className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted">{field}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
