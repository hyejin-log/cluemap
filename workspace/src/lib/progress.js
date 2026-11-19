// [개발 > 기초개발] 상단 요약 지표 계산
//
// 표준화 완료율 = 기준이 정해진 항목 ÷ 전체 항목
//   - 항목 = 서류 빈칸(자동 연결된 기본 빈칸 포함) + 부서별 용어
//   - 서류 빈칸은 출처가 있거나 질문으로 출처를 확인하면 '정해짐'
//   - 용어는 회사 표준 뜻을 확정하면 '정해짐'
// 업무 규칙은 '뽑아낸 개수 / 확정한 개수'로 따로 보여줘요.

/**
 * @param {object} scenario scenarios.js 의 한 항목
 * @param {{ rules: {id:string}[], confirmedRules: string[], answered: string[], standardized: Record<string,string> }} state
 */
export function summarize(scenario, state) {
  const missing = scenario.sources.filter((row) => !row.from);
  const openWarnings = missing.filter((row) => !state.answered.includes(row.id)).length;
  const openConflicts = scenario.terms.filter((term) => !state.standardized[term.id]).length;

  const totalItems = scenario.autoLinked.length + scenario.sources.length + scenario.terms.length;
  const doneItems = totalItems - openWarnings - openConflicts;
  const ruleIds = new Set(state.rules.map((rule) => rule.id));

  return {
    ruleCount: state.rules.length,
    confirmedRuleCount: state.confirmedRules.filter((id) => ruleIds.has(id)).length,
    openWarnings,
    totalWarnings: missing.length,
    openConflicts,
    totalConflicts: scenario.terms.length,
    doneItems,
    totalItems,
    completion: totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100),
  };
}

export function initialState(scenario) {
  return { memo: scenario.memo, rules: scenario.rules, confirmedRules: [], answered: [], standardized: {}, notice: '' };
}
