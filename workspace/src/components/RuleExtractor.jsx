// [개발 > 서비스/웹] ① 현업 대화 → 업무 규칙 추출
import React from 'react';
import { MAX_MEMO_LENGTH } from '../lib/extractRules.js';
import { Badge, Button, Card, cx, StepHeader, TextButton } from './ui.jsx';

export default function RuleExtractor({ memo, sampleMemo, rules, confirmed, notice, onMemoChange, onExtract, onConfirm, onUndo, onRestoreMemo }) {
  const edited = memo.trim() !== sampleMemo.trim();
  return (
    <Card aria-labelledby="rules-heading" className="flex flex-col gap-6 p-6 sm:p-7">
      <StepHeader step="1" id="rules-heading" title="현업 대화 → 업무 규칙 뽑기"
        description="담당자가 한 말을 그대로 적으면 ‘만약 ~라면 → 이렇게 처리’ 규칙으로 정리해요." />

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="memo" className="text-sm font-semibold">인터뷰 메모</label>
          {edited && <TextButton onClick={onRestoreMemo}>예시 메모로 되돌리기</TextButton>}
        </div>
        <textarea id="memo" value={memo} maxLength={MAX_MEMO_LENGTH} rows={6}
          onChange={(event) => onMemoChange(event.target.value)}
          className="block w-full resize-y rounded-xl border border-line bg-memo px-4 py-3.5 text-[15px] leading-7 text-ink placeholder:text-muted/70 focus:border-ink/40 focus:outline-none"
          placeholder="예: 신규 업체면 선급금 30% 먼저 받아요." />
        <p className="mt-2 text-right text-xs tabular-nums text-muted">{memo.length.toLocaleString('ko-KR')} / {MAX_MEMO_LENGTH.toLocaleString('ko-KR')}자</p>
      </div>

      <Button onClick={onExtract} className="w-full">규칙 자동 추출하기</Button>
      <p aria-live="polite" className={cx('-mt-3 text-sm leading-6', notice.tone === 'warn' ? 'text-coral' : 'text-muted')}>
        {notice.text}
      </p>

      {rules.length > 0 && (
        <ol aria-label="뽑아낸 규칙" className="flex flex-col gap-4">
          {rules.map((rule, index) => {
            const done = confirmed.includes(rule.id);
            return (
              <li key={rule.id}
                className={cx('flex items-start gap-4 rounded-xl border p-5 transition-colors duration-300 motion-reduce:transition-none',
                  done ? 'border-sage/30 bg-mint' : 'border-line bg-white')}>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted">규칙 {index + 1} · 만약</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{rule.when}</p>
                  <p className="mt-3 text-xs font-semibold text-muted"><span aria-hidden="true">➔ </span>이렇게 처리</p>
                  <p className="mt-1 font-bold leading-7">{rule.then}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {done ? (
                    <>
                      <Badge tone="done">✓ 확정됨</Badge>
                      <TextButton onClick={() => onUndo(rule.id)} aria-label={`규칙 ${index + 1} 확정 되돌리기`}>되돌리기</TextButton>
                    </>
                  ) : (
                    <Button tone="quiet" onClick={() => onConfirm(rule.id)} aria-label={`규칙 ${index + 1} 확정하기`}>확정하기</Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
