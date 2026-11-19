// [유지보수] 규칙 추출기 단위 테스트 — `npm test` 로 실행해요.
import assert from 'node:assert/strict';
import test from 'node:test';
import { scenarios } from '../data/scenarios.js';
import { ALWAYS, extractRules, toConditionPhrase, toRuleSentence } from './extractRules.js';

test('예시 1 메모에서 규칙 4개를 뽑는다', () => {
  const { rules, error } = extractRules(scenarios[0].memo);
  assert.equal(error, '');
  assert.deepEqual(rules.map(({ when, then }) => [when, then]), [
    ['신규 업체인 경우', '선급금 30% 먼저 받는다'],
    ['기존 거래처라도 작년에 납기 한 번이라도 늦었던 경우', '보증보험 끊어오도록 요청한다'],
    ['팀장님 구두 승인 있는 경우', '예외로 넘어간다'],
    ['계약금액이 5천만 원 넘는 경우', '법무팀 검토를 꼭 거쳐야 한다'],
  ]);
});

test('예시 2 메모에서 규칙 4개를 뽑는다', () => {
  const { rules } = extractRules(scenarios[1].memo);
  assert.deepEqual(rules.map(({ when, then }) => [when, then]), [
    ['현장 소장이 납품 수령 사인하는 경우', '검수 끝난 걸로 본다'],
    ['작업비가 500만 원 넘는 경우', '본부장 결재를 한 번 더 받아야 한다'],
    ['하자가 나오는 경우', '잔금 10%는 3개월 동안 묶어 둔다'],
    ['세금계산서가 늦게 들어오는 경우', '다음 달 정산으로 넘긴다'],
  ]);
});

test('조건이 없는 문장은 늘 적용하는 규칙이 된다', () => {
  const { rules } = extractRules('계약서는 두 부 출력해요.');
  assert.deepEqual(rules.map(({ when, then }) => [when, then]), [[ALWAYS, '계약서는 두 부 출력한다']]);
});

test('빈 메모와 너무 긴 메모는 안내 문구를 돌려준다', () => {
  assert.match(extractRules('   ').error, /비어 있어요/);
  assert.match(extractRules('가'.repeat(2001)).error, /2,000자/);
});

test('말끝 바꾸기', () => {
  assert.equal(toRuleSentence('서류를 받아요'), '서류를 받는다');
  assert.equal(toRuleSentence('바로 넘겨요.'), '바로 넘긴다');
  assert.equal(toConditionPhrase('기존 거래처면'), '기존 거래처인 경우');
  assert.equal(toConditionPhrase('승인이 없으면'), '승인이 없는 경우');
  assert.equal(toConditionPhrase('금액이 크면'), '금액이 크면');
  assert.equal(toConditionPhrase('검수 서류가 빠지면'), '검수 서류가 빠지는 경우');
});
