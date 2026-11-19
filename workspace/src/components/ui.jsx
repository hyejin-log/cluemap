// [개발 > 서비스/웹] 공용 UI 조각 — 카드, 배지, 버튼, 단계 머리글
import React from 'react';

export const cx = (...names) => names.filter(Boolean).join(' ');

export function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={cx('min-w-0 rounded-2xl border border-line bg-white shadow-sm', className)} {...props}>
      {children}
    </Tag>
  );
}

const BADGE_TONES = {
  done: 'bg-mint text-sage ring-sage/25',
  warn: 'bg-blush text-coral ring-coral/25',
  quiet: 'bg-memo text-muted ring-line',
};

export function Badge({ tone = 'quiet', className = '', children }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', BADGE_TONES[tone], className)}>
      {children}
    </span>
  );
}

const BUTTON_TONES = {
  primary: 'bg-ink text-white hover:bg-ink/90 disabled:bg-line disabled:text-muted',
  quiet: 'border border-line bg-white text-ink hover:bg-memo disabled:text-muted',
  done: 'bg-sage text-white hover:bg-sage/90',
};

export function Button({ tone = 'primary', className = '', type = 'button', children, ...props }) {
  return (
    <button type={type}
      className={cx('inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors motion-reduce:transition-none', BUTTON_TONES[tone], className)}
      {...props}>
      {children}
    </button>
  );
}

export function TextButton({ className = '', children, ...props }) {
  return (
    <button type="button" className={cx('text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline', className)} {...props}>
      {children}
    </button>
  );
}

/** 각 컬럼 맨 위의 ①②③ 머리글 */
export function StepHeader({ step, title, description, id, aside }) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line pb-5">
      <div className="flex min-w-0 items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{step}</span>
        <div className="min-w-0">
          <h2 id={id} className="text-lg font-bold leading-7 tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      {aside}
    </header>
  );
}
