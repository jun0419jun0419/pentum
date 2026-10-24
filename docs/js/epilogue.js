'use strict';

/* ================================================================
   에필로그 · 장조림
   ================================================================ */

const COOK_STEPS = [
  { t: '소고기를 찬물에 담가 핏물 빼기', memo: '핏물 빼야 냄새 안난다' },
  { t: '물 세 컵에 고기 넣고 삶기', memo: '거품은 걷어내라' },
  { t: '간장 반 컵, 설탕 두 숟갈', memo: '짜면 물 더 넣어라' },
  { t: '마늘 한 줌 넣기', memo: '마늘은 통으로' },
  { t: '메추리알 넣기', memo: '메추리알 꼭. {F} 메추리알만 골라먹음' },
  { t: '약불에 천천히 졸이기', memo: '급하게 하지 마라 천천히' },
];

// 엄마가 지우개로 지우고 다시 쓴 자리
const ERASED = { '물 세컵 간장 반컵': '물 네컵 간장 한컵', '설탕 두숟갈 마늘 한줌': '설탕 한숟갈' };

async function cooking() {
  const done = h('ol', { class: 'ck-done' });
  const hint = h('p', { class: 'ck-hint', 'aria-live': 'polite', text: '순서대로 눌러 보세요.' });
  const order = shuffle(COOK_STEPS.map((s, i) => i));
  const btns = order.map(i => [h('button', { class: 'ck-step', type: 'button', text: COOK_STEPS[i].t }), i]);
  const outro = h('p', { class: 'ck-outro' });
  const lastNote = h('p', { class: 'ck-last-note' });
  const lastInk = h('span', { class: 'ck-last-ink' });
  const last = h('div', { class: 'ck-last' }, lastNote,
    h('div', { class: 'ck-last-line' }, h('span', { class: 'ck-last-ghost', 'aria-hidden': 'true', text: '다음에 오면 엄마가 해줄께' }), lastInk));
  const v = h('section', { class: 'view cook', dataset: { tone: 'light', temp: '1' } },
    h('div', { class: 'ck-page' },
      h('div', { class: 'ck-top' },
        h('h2', { text: '장조림' }),
        h('p', { class: 'ck-sub', text: '엄마의 공책' })),
      h('ul', { class: 'ck-ingr' }, RECIPE_MEMO.slice(1).map(l => h('li', { class: ERASED[l] ? 'erased' : null },
        ERASED[l] ? h('span', { class: 'ck-ghost', 'aria-hidden': 'true', text: ERASED[l] }) : null,
        h('span', { text: P(l) })))),
      done, hint,
      h('div', { class: 'ck-btns' }, btns.map(b => b[0])),
      outro, last));
  await show(v, 1200);

  let next = 0;
  while (next < COOK_STEPS.length) {
    const live = btns.filter(([b]) => !b.disabled);
    const i = await pick(live);
    const btn = btns.find(b => b[1] === i)[0];
    if (i === next) {
      btn.disabled = true;
      btn.classList.add('ok');
      setTimeout(() => { btn.hidden = true; }, 450 * SPEED);
      done.append(h('li', {},
        h('span', { class: 'ck-t', text: COOK_STEPS[i].t }),
        h('span', { class: 'ck-memo', text: P(COOK_STEPS[i].memo) })));
      hint.textContent = '';
      next++;
      v.querySelector('.ck-page').scrollTo({ top: 99999, behavior: 'smooth' });
    } else {
      btn.classList.remove('no');
      void btn.offsetWidth;
      btn.classList.add('no');
      btn.addEventListener('animationend', () => btn.classList.remove('no'), { once: true });
      hint.textContent = `엄마 공책: ${P(COOK_STEPS[next].memo)}`;
    }
  }
  v.querySelector('.ck-btns').classList.add('gone');
  await wait(1400);
  await typeText(outro, '엄마 맛이 났다. 조금 짰다.', { cps: 10 });
  outro.scrollIntoView({ behavior: 'smooth', block: 'end' });
  await wait(3000);

  // 공책 맨 아래: 지우개 자국 위에 다시 쓴 한 줄
  await typeText(lastNote, '공책을 덮으려다, 맨 아래 줄에 지우개 자국을 봤다.', { cps: 11 });
  last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  await wait(1400);
  last.classList.add('show');
  await wait(3600);
  await typeJamo(lastInk, '이제 니가 해먹어라', { step: 150, jitter: 90 });
  last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  await wait(4200);
}

// 이번엔 내가 길게 쓴다. 지우기 버튼은 없다
function longReply() {
  return [
    '엄마',
    '공책 보고 장조림 했어',
    '메추리알 진짜 많이 넣었어',
    '조금 짰는데 엄마 맛 났어',
    '',
    '엄마가 보낸 밥먹었니 옷입어 도착햇니',
    '그게 다 무슨 말이었는지 이제 알아',
    '',
    S.kindness >= 10 ? '더 길게 답장할걸 그랬어' : 'ㅇㅇ만 보내서 미안해',
    '',
    '이제 내가 길게 쓸게',
    '1이 안 없어져도 계속 쓸게',
    '',
    '엄마 사랑해',
  ].join('\n');
}

async function epilogue() {
  await titleCard({ label: '에필로그', title: '장조림', quote: '메추리알 꼭 넣기' });
  setBattery(null);
  const room = R.mom;
  setClock(11, 5, '01:09');
  await show(room.el, 1400);
  await wait(2400);
  setClock(11, 29, '18:40');
  room.date(11, 29);
  await room.caption('냉동실에 엄마가 싸 준 장조림이 한 통 남아 있었다.');
  await room.caption('아까워서 아직 뚜껑을 못 열었다.');
  await room.caption('엄마의 공책을 펼쳤다.');
  await cooking();

  await show(room.el, 1200);
  await wait(1000);
  setClock(11, 29, '19:52');
  const opts = ['엄마 장조림 했어', '엄마 메추리알 많이 넣었어', '엄마, 나 밥 먹었어'];
  const i = await room.choose(opts.map(t => ({ t })));
  S.log.push({ id: 'epilogue', t: opts[i] });
  room.msg({ from: 'me', kind: 'photo', art: 'jang', unread: true });
  await wait(700);
  await room.send(opts[i]);
  await wait(3600);
  await room.caption('보내 놓고 보니 너무 짧았다.');
  await room.caption('이번엔 길게 쓰기로 했다.');
  setClock(11, 29, '20:07');
  await room.compose(longReply(), { step: 62, jitter: 40, tall: true });
  await room.button('보내기', 'send');
  room.sendComposed();
  await wait(7000);
  room.el.classList.add('slowread');
  const n = room.markRead({ slow: true });
  await wait(2400 + n * 900);
  await room.caption('1이 사라졌다.');
  await wait(2200);
  await room.caption('엄마는 다 안다고 했다.');
  await wait(3600);
  await ending();
}

async function ending() {
  const box = h('div', { class: 'end-box' });
  const v = h('section', { class: 'view ending', dataset: { tone: 'card', temp: '1' } }, box);
  await show(v, 1800);
  await wait(800);
  const say = async (lines, gap = 1400) => {
    const block = h('div', { class: 'end-block' });
    box.append(block);
    for (const l of lines) {
      const p = h('p');
      block.append(p);
      await typeText(p, l, { cps: 12 });
      await wait(700);
    }
    await wait(gap + 1400);
  };
  // 내가 고른 답장마다 남아 있던 엄마의 메모가 하나씩 지나간다
  const memoEl = h('p', { class: 'end-memo' });
  box.append(memoEl);
  for (const m of [...S.memos].sort((a, b) => a.at - b.at).slice(0, 10)) {
    memoEl.textContent = m.lines.map(P).join(' ');
    memoEl.classList.add('on');
    await wait(2400);
    memoEl.classList.remove('on');
    await wait(900);
  }
  memoEl.textContent = '밥먹었니 옷입어 도착햇니 / 그거 다 사랑한다는 말이다';
  memoEl.classList.add('on');
  await wait(4200);
  memoEl.classList.remove('on');
  await wait(1200);
  memoEl.remove();
  await say(['어떤 답장을 골랐어도', '엄마의 메모는 결국 같은 말이었어요.'], 1800);
  await say(['진짜 엔딩은 게임 밖에 있어요.'], 900);
  await say(['오늘, 1이 금방 사라질 사람에게', '조금 길게 답장해 보세요.'], 600);
  const again = h('button', { class: 'pill key end-again', type: 'button' }, icon('arrow-back-up'), h('span', { text: '다른 답장으로 다시 하기' }));
  box.append(again);
  await onceClick(again);
  location.reload();
}
