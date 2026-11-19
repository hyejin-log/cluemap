// [개발 > 기초개발] 대화 메모 → '만약 → 이렇게 처리' 규칙 추출기
//
// 외부 AI 호출 없이 브라우저 안에서 도는 간단한 문장 규칙 기반 추출기예요.
// 1) 메모를 문장 → 마디(“~고,”)로 자르고
// 2) “~면 / ~경우 / ~때” 같은 조건 표시를 찾아 앞은 조건, 뒤는 처리 기준으로 나눈 뒤
// 3) 말투(“~해요”, “~라고 해요”)를 규칙 문장(“~한다”, “~하도록 요청한다”)으로 바꿔요.
// 결과는 초안이에요. 사람이 [확정하기]를 눌러야 기준이 돼요.

export const MAX_MEMO_LENGTH = 2000;
export const ALWAYS = '조건 없이 늘 적용';

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const FINAL_N = 4; // 받침 'ㄴ'

const FILLERS = /^(?:아|음|어|참|자|그리고|근데|그런데|그러니까|또|또는|일단|보통|원래)(?:[,，]\s*|\s+)/;
const CONDITION = /^(.*?\S(?:면|경우에는|경우엔|경우|때는|때엔|때))\s+(.+)$/;

const isHangul = (ch) => {
  const code = ch?.charCodeAt(0) ?? 0;
  return code >= HANGUL_START && code <= HANGUL_END;
};
const hasFinal = (ch) => isHangul(ch) && (ch.charCodeAt(0) - HANGUL_START) % 28 !== 0;
const withFinalN = (ch) => (isHangul(ch) && !hasFinal(ch) ? String.fromCharCode(ch.charCodeAt(0) + FINAL_N) : ch);

/** 동사 어간을 '~한다/~는다/~ㄴ다' 꼴로 바꿔요. 예: 받 → 받는다, 넘어가 → 넘어간다 */
function plainFromStem(stem) {
  if (!stem) return stem;
  if (stem.endsWith('하')) return stem.slice(0, -1) + '한다';
  const last = stem.at(-1);
  if (!isHangul(last)) return stem;
  return hasFinal(last) ? stem + '는다' : stem.slice(0, -1) + withFinalN(last) + '다';
}

// 줄어든 말끝(봐요, 둬요, 넘겨요 …) → 규칙 문장 끝
const CONTRACTED = { 봐: '본', 둬: '둔', 줘: '준', 와: '온', 돼: '된', 겨: '긴', 려: '린', 져: '진', 쳐: '친', 혀: '힌', 써: '쓴', 꿔: '꾼' };

/** 말하듯 쓴 처리 문장을 규칙 문장으로 바꿔요. */
export function toRuleSentence(raw) {
  let text = stripFillers(raw).replace(/[.!?。…~]+$/u, '').trim();
  if (!text) return text;

  let match = text.match(/^(.+?)(?:으)?라고\s*(?:해요|하세요|합니다|했어요|하더라고요|하고요)$/);
  if (match) return match[1] + '도록 요청한다';

  match = text.match(/^(.+[아어여와워])야\s*(?:해요|하고요|합니다|돼요|됩니다|한다|하죠)$/);
  if (match) return match[1] + '야 한다';

  match = text.match(/^(.+?)(?:해요|하고요|합니다|하죠|하고)$/);
  if (match) return match[1] + '한다';

  match = text.match(/^(.+)고요?$/);
  if (match) return plainFromStem(match[1]);

  match = text.match(/^(.*)(.)요$/);
  if (match) {
    const [, head, last] = match;
    if (CONTRACTED[last]) return head + CONTRACTED[last] + '다';
    if ((last === '아' || last === '어') && hasFinal(head.at(-1))) return head + '는다';
    if (isHangul(last) && !hasFinal(last)) return head + withFinalN(last) + '다';
  }
  return text;
}

/** '신규 업체면' 같은 조건 표현을 '신규 업체인 경우'로 바꿔요. */
export function toConditionPhrase(raw) {
  const text = stripFillers(raw).trim();
  const rules = [
    [/^(.+)있으면$/, '$1있는 경우'],
    [/^(.+)없으면$/, '$1없는 경우'],
    [/^(.+[었았였])으면$/, '$1던 경우'],
    [/^(.+)으면$/, '$1는 경우'],
    [/^(.+)하면$/, '$1하는 경우'],
    [/^(.+[가오되나서보주두지])면$/, '$1는 경우'],
    // '금액이 크면'처럼 조사 뒤에 오는 말은 형용사·동사일 수 있어 말한 그대로 둬요.
    [/^(.*\S[이가은는을를도]\s+\S+면)$/, '$1'],
    [/^(.+?)(?:이)?면$/, '$1인 경우'],
    [/^(.+?)(?:에는|엔)$/, '$1'],
    [/^(.+?)(?:는)$/, '$1'],
  ];
  for (const [pattern, replacement] of rules) {
    if (pattern.test(text)) return text.replace(pattern, replacement);
  }
  return text;
}

function stripFillers(text) {
  let result = String(text ?? '').trim();
  let previous;
  do {
    previous = result;
    result = result.replace(FILLERS, '').trim();
  } while (result !== previous);
  return result;
}

/** 메모를 규칙 하나가 될 만한 마디로 나눠요. */
export function splitClauses(memo) {
  return String(memo ?? '')
    .split(/(?<=[.!?。])\s+|\n+/u)
    .flatMap((sentence) => sentence.split(/(?<=고)[,，]\s*/u))
    .map((clause) => stripFillers(clause).replace(/[.!?。]+$/u, '').trim())
    .filter((clause) => clause.length >= 4);
}

/**
 * 메모 → 규칙 목록
 * @param {string} memo 인터뷰 메모
 * @returns {{ rules: {id:string, when:string, then:string}[], error: string }}
 */
export function extractRules(memo) {
  const text = String(memo ?? '').trim();
  if (!text) return { rules: [], error: '메모가 비어 있어요. 현업 담당자가 한 말을 그대로 적어 주세요.' };
  if (text.length > MAX_MEMO_LENGTH) {
    return { rules: [], error: `메모는 ${MAX_MEMO_LENGTH.toLocaleString('ko-KR')}자까지 넣을 수 있어요. 미팅 주제별로 나눠 주세요.` };
  }

  const seen = new Set();
  const rules = [];
  for (const clause of splitClauses(text)) {
    const match = clause.match(CONDITION);
    const when = match ? toConditionPhrase(match[1]) : ALWAYS;
    const then = toRuleSentence(match ? match[2] : clause);
    if (!then) continue;
    const key = when + '→' + then;
    if (seen.has(key)) continue;
    seen.add(key);
    rules.push({ id: 'r' + rules.length + '-' + hash(key), when, then });
  }

  if (rules.length === 0) {
    return { rules, error: '규칙으로 바꿀 문장을 찾지 못했어요. “~면 ~한다”처럼 조건과 처리가 함께 들어간 문장을 적어 주세요.' };
  }
  return { rules, error: '' };
}

function hash(text) {
  let value = 0;
  for (const ch of text) value = (value * 31 + ch.charCodeAt(0)) >>> 0;
  return value.toString(36);
}
