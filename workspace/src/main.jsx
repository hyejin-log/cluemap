import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const steps = ['다시 계산', '검증값 인용', '근거 확인', '사람 승인', '다시 판단'];
const tabs = { source: '원본 데이터', calculation: '계산식', history: '진행 이력', standards: '용어·기준' };
const appOrigin = import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';
const won = (value) => new Intl.NumberFormat('ko-KR').format(value) + '원';
const button = 'rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100';

function App() {
  const [rebate, selectRebate] = useState(new URLSearchParams(location.search).get('rebate') ?? '');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [active, setActive] = useState({ tab: 'source', row: '' });

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    fetch('/api/audit-workspace?' + new URLSearchParams({ rebate }), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('감사 브리핑을 불러올 수 없습니다.');
        return response.json();
      })
      .then(setData)
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [rebate, revision]);

  function show(tab, row = '') {
    setActive({ tab, row });
  }

  function cite(label, tab, row = '') {
    const selected = active.tab === tab && active.row === row;
    return (
      <button type="button" aria-pressed={selected} aria-controls="evidence-content"
        onClick={() => show(tab, row)}
        className={'mx-1 inline-block max-w-full break-all rounded px-2 py-0.5 align-baseline text-xs font-bold ' +
          (selected ? 'bg-amber-200 text-amber-950' : 'bg-blue-50 text-blue-800 hover:bg-blue-100')}>
        [{label}]
      </button>
    );
  }

  return (
    <>
      <header className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-10">
          <a href="/" className="text-xl font-bold tracking-tight">RebateView Pro</a>
          <ol aria-label="검증 절차" className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
            {steps.map((step, index) => (
              <li key={step} className={index === 2 ? 'font-bold text-amber-300' : ''}>{index + 1}. {step}</li>
            ))}
          </ol>
          <button onClick={() => setRevision(revision + 1)}
            className="rounded-md bg-amber-300 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-amber-200">
            현재 근거 새로고침
          </button>
        </div>
      </header>
      {error && <p role="alert" className="mx-auto max-w-screen-2xl p-5 text-red-800">{error}</p>}
      {!data && !error && <p role="status" className="p-5">감사 브리핑을 불러오는 중입니다.</p>}
      {data && <Workspace data={data} active={active} show={show} cite={cite} onSelect={(value) => {
        show('source');
        selectRebate(value);
      }} />}
    </>
  );
}

function Workspace({ data, active, show, cite, onSelect }) {
  const { selected, members, limit, total, matched, source, sources, reasons, history, change } = data;
  const exceeded = total > limit;
  const calculation = selected.group_id ? selected.group_id + '_합산계산' : '개별한도계산';
  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-6 lg:px-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm font-semibold">
          검토 거래
          <select value={selected.rebate_id} onChange={(event) => onSelect(event.target.value)}
            className="max-w-64 rounded-md border border-slate-300 bg-white px-3 py-2">
            {data.cases.map((item) => (
              <option key={item.rebate_id} value={item.rebate_id}>{item.agency_id} · {item.agency_name}</option>
            ))}
          </select>
        </label>
        <a className="text-sm font-semibold text-blue-800 underline underline-offset-4"
          href={appOrigin + '/workbench?' + new URLSearchParams({ rebate: selected.rebate_id })}>
          기존 검토·승인 화면 열기
        </a>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <article className="rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm lg:px-10">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-slate-600">감사 브리핑 · {selected.period} · {selected.rebate_id}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{selected.agency_id} · {selected.agency_name}</h1>
            <p className="mt-3 text-slate-700">
              {selected.group_id || '개별 검토'} · {exceeded ? '전결 한도 초과' : '전결 한도 이내'} · {selected.status}
            </p>
          </header>
          <section className="border-b border-slate-200 py-6">
            <h2 className="mb-3 text-xl font-bold">① 권고 및 결론</h2>
            <p className="leading-8">
              {exceeded ? '합산액이 전결 한도를 초과해 영업임원 승인 대상입니다.' : '검토 금액이 전결 한도 이내입니다.'}
              {cite(calculation, 'calculation')}
              현재 상태는 <strong>{selected.status}</strong>입니다. {cite('처리 기록', 'history')}
            </p>
          </section>
          <section className="border-b border-slate-200 py-6">
            <h2 className="mb-3 text-xl font-bold">② 왜 지금 확인해야 하는가</h2>
            {reasons.map((reason) => <p key={reason} className="mb-2 leading-8">{reason}</p>)}
            {cite('처리 기록', 'history')}
            {change && <p className="mt-3 leading-8">계좌 변경 신고 적용 후 자금팀 지급 목록이
              {' '}{change.before_count}건에서 {change.after_count}건으로 줄었습니다.
              {cite('계좌 변경 신고 · 모의', 'history', change.event_id)}
            </p>}
          </section>
          <section className="pt-6">
            <h2 className="mb-3 text-xl font-bold">③ 계산 및 한도 검증 내역</h2>
            <p className="leading-8">거래 금액 <strong>{won(selected.amount)}</strong>
              {cite(source, 'source', selected.rebate_id)}
            </p>
            <p className="leading-8">월 합계 <strong>{won(total)}</strong> · 전결 한도 {won(limit)}
              {cite(calculation, 'calculation')}
            </p>
          </section>
        </article>
        <aside aria-labelledby="evidence-heading"
          className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-5">
            <h2 id="evidence-heading" className="text-lg font-bold">증거 패키지</h2>
            <span className={'rounded-full px-2 py-1 text-xs font-bold ' +
              (matched ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900')}>
              원본·합계 대조 {matched ? 'PASS' : 'FAIL'}
            </span>
            <button className={button} onClick={() => show('source')}>초기화</button>
          </div>
          <nav aria-label="근거 보기" className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3">
            {Object.entries(tabs).map(([key, label]) => (
              <button key={key} aria-pressed={active.tab === key} aria-controls="evidence-content"
                onClick={() => show(key)}
                className={'rounded-md px-2 py-1 text-sm font-semibold ' +
                  (active.tab === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                {label}
              </button>
            ))}
          </nav>
          <div id="evidence-content" aria-live="polite" className="max-h-[65vh] overflow-auto p-5 text-sm leading-7">
            {active.tab === 'source' && <>
              <h3 className="mb-2 break-all font-bold">{source}</h3>
              <p className="mb-3 text-slate-600">원본 · {selected.period} · 원 단위, 부가세 제외</p>
              <table className="w-full text-left">
                <thead className="border-b border-slate-300 text-slate-600">
                  <tr><th>거래</th><th>대리점</th><th className="text-right">장려금</th></tr>
                </thead>
                <tbody>{sources.map((row) => (
                  <tr key={row.rebate_id} className={active.row === row.rebate_id ? 'bg-amber-100 font-bold' : 'border-b border-slate-100'}>
                    <th scope="row">{row.rebate_id}</th><td>{row.agency_id}</td>
                    <td className="text-right tabular-nums">{won(row.amount)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </>}
            {active.tab === 'calculation' && <>
              <h3 className="mb-2 font-bold">{selected.group_id || selected.agency_id} 월 지급액</h3>
              <p className="tabular-nums">{members.map((member) => won(member.amount)).join(' + ')} = <strong>{won(total)}</strong></p>
              <p>{won(total)} {exceeded ? '>' : '≤'} {won(limit)} · {exceeded ? '영업임원 승인 대상' : '영업지원팀 전결 한도 이내'}</p>
            </>}
            {active.tab === 'history' && <>
              {active.row && change && <p className="mb-3 rounded-md bg-amber-100 p-3">
                [모의 사건] {change.event_id} · {change.reported_date} · {won(change.before_amount)} → {won(change.after_amount)}
              </p>}
              {history.length === 0 && <p>기록된 처리 이력이 없습니다.</p>}
              <ol className="space-y-3">{history.map((entry, index) => (
                <li key={index} className="border-s-2 border-slate-200 ps-3">
                  <p className="font-bold">{entry.at} · {entry.what}</p>
                  <p>{entry.who} · {entry.basis}</p>
                </li>
              ))}</ol>
            </>}
            {active.tab === 'standards' && <dl className="space-y-3">
              <div><dt className="font-bold">관련 거래처</dt><dd>대표자·주소·정산계좌 중 2개 이상이 일치하는 거래처입니다.</dd></div>
              <div><dt className="font-bold">전결 한도</dt><dd>관련 거래처는 월 지급액을 합산합니다. {won(limit)} 초과 시 영업임원 승인 대상입니다.</dd></div>
              <div><dt className="font-bold">원본·합계 대조</dt><dd>거래 ID, 대리점 ID, 금액을 원본 장부와 비교하고 원본 합계가 판정 엔진의 금액과 일치하는지 확인합니다.</dd></div>
            </dl>}
          </div>
        </aside>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
