// [개발 > 서비스/웹] 상단 핵심 요약 바 — Rebate Lens 4단 지표 카드 뼈대를 그대로 살렸어요
import React from 'react';
import { Card, cx } from './ui.jsx';

function Metric({ label, value, unit, hint, tone, children }) {
  return (
    <Card as="div" className="p-6">
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-3">
        <span className={cx('text-4xl font-bold tabular-nums tracking-tight',
          tone === 'warn' && 'text-coral', tone === 'done' && 'text-sage')}>{value}</span>
        <span className="ms-1 text-base font-semibold text-muted">{unit}</span>
      </dd>
      <dd className="mt-2 text-xs leading-5 text-muted">{hint}</dd>
      {children}
    </Card>
  );
}

export default function SummaryBar({ summary }) {
  const s = summary;
  return (
    <dl aria-label="한눈에 보는 진행 상황" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="뽑아낸 업무 규칙" value={s.ruleCount} unit="건"
        hint={s.ruleCount === 0 ? '메모에서 규칙을 뽑아 주세요' : `확정 ${s.confirmedRuleCount}건 · 남은 ${s.ruleCount - s.confirmedRuleCount}건`} />
      <Metric label="출처 없는 빈칸 경고" value={s.openWarnings} unit="건" tone={s.openWarnings ? 'warn' : 'done'}
        hint={s.openWarnings ? `빈칸 ${s.totalWarnings}개 중 ${s.openWarnings}개가 어디서 오는지 몰라요` : '모든 빈칸의 출처를 확인했어요'} />
      <Metric label="부서별 용어 차이" value={s.openConflicts} unit="건" tone={s.openConflicts ? 'warn' : 'done'}
        hint={s.openConflicts ? '부서마다 뜻이 달라 맞춰야 해요' : '모든 용어를 회사 표준으로 맞췄어요'} />
      <Metric label="표준화 완료율" value={s.completion} unit="%" tone={s.completion === 100 ? 'done' : undefined}
        hint={`빈칸·용어 ${s.totalItems}개 중 ${s.doneItems}개 기준 확정`}>
        <div role="progressbar" aria-label="표준화 완료율" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.completion}
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-memo">
          <div className="h-full rounded-full bg-sage transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: s.completion + '%' }} />
        </div>
      </Metric>
    </dl>
  );
}
