// [개발 > 기초개발] 부서별 용어 → 단계 이름 나누기
//
// 부서마다 같은 단어('계약 확정')를 서로 다른 단계에 쓰는 경우,
// 하나만 고르지 않고 단계마다 다른 이름을 붙여 모든 부서의 뜻을 살려요.

export const MAX_STAGE_NAME = 20;

/** 앞말 받침에 맞춰 조사를 붙여요. 예: josa('견적 확정', '이', '가') → '견적 확정’이' 형태에 쓰는 '이' */
export function josa(word, withFinal, withoutFinal) {
  const last = String(word).trim().at(-1) ?? '';
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return withFinal; // 한글이 아니면 받침 있는 쪽을 써요
  return code % 28 === 0 ? withoutFinal : withFinal;
}

/** 추천 단계 이름으로 시작 값을 만들어요. { 팀: 단계 이름 } */
export function defaultStageNames(term) {
  return Object.fromEntries(term.meanings.map((item) => [item.team, item.stage ?? '']));
}

/**
 * 단계 이름이 쓸 만한지 확인해요.
 * @returns {string} 문제가 있으면 쉬운 안내 문장, 없으면 빈 문자열
 */
export function checkStageNames(term, names) {
  const trimmed = term.meanings.map((item) => String(names?.[item.team] ?? '').trim());

  const emptyIndex = trimmed.findIndex((name) => !name);
  if (emptyIndex !== -1) return `${term.meanings[emptyIndex].team} 단계에 이름을 적어 주세요.`;

  const tooLong = trimmed.findIndex((name) => name.length > MAX_STAGE_NAME);
  if (tooLong !== -1) return `단계 이름은 ${MAX_STAGE_NAME}자 안으로 적어 주세요.`;

  if (trimmed.some((name) => name === term.word)) {
    return `‘${term.word}’${josa(term.word, '을', '를')} 그대로 쓰면 다시 헷갈려요. 단계마다 다른 이름을 붙여 주세요.`;
  }

  const seen = new Set();
  for (const name of trimmed) {
    if (seen.has(name)) return `‘${name}’${josa(name, '이', '가')} 두 번 쓰였어요. 단계마다 다른 이름을 붙여 주세요.`;
    seen.add(name);
  }
  return '';
}

/** 확정한 결과: 순서대로 [{ team, meaning, stage }] */
export function toStages(term, names) {
  return term.meanings.map((item) => ({ ...item, stage: String(names[item.team]).trim() }));
}
