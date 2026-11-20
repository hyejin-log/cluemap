// [유지보수] 단계 이름 나누기 단위 테스트 — `npm test` 로 실행해요.
import assert from 'node:assert/strict';
import test from 'node:test';
import { scenarios } from '../data/scenarios.js';
import { checkStageNames, defaultStageNames, josa, toStages } from './terms.js';

const term = scenarios[0].terms[0]; // '계약 확정'

test('모든 예시 용어는 부서마다 서로 다른 추천 단계 이름을 가진다', () => {
  for (const scenario of scenarios) {
    for (const item of scenario.terms) {
      assert.equal(checkStageNames(item, defaultStageNames(item)), '', item.word);
    }
  }
});

test('빈 이름, 겹치는 이름, 원래 단어 그대로는 막는다', () => {
  const names = defaultStageNames(term);
  assert.match(checkStageNames(term, { ...names, 법무팀: '  ' }), /법무팀 단계에 이름/);
  assert.match(checkStageNames(term, { ...names, 재무팀: '견적 확정' }), /‘견적 확정’이 두 번/);
  assert.match(checkStageNames(term, { ...names, 영업팀: '계약 확정' }), /‘계약 확정’을 그대로/);
  assert.match(checkStageNames(term, { ...names, 영업팀: '가'.repeat(21) }), /20자/);
});

test('받침에 맞춰 조사를 고른다', () => {
  assert.equal(josa('견적 확정', '이', '가'), '이');
  assert.equal(josa('서류 검수', '이', '가'), '가');
  assert.equal(josa('검수 완료', '을', '를'), '를');
});

test('확정 결과는 일의 순서를 지키고 앞뒤 공백을 지운다', () => {
  const stages = toStages(term, { ...defaultStageNames(term), 영업팀: '  견적 합의  ' });
  assert.deepEqual(stages.map((s) => [s.team, s.stage]), [
    ['영업팀', '견적 합의'],
    ['법무팀', '서명 확정'],
    ['재무팀', '입금 확정'],
  ]);
});
