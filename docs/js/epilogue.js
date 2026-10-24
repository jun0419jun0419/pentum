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

async function cooking() {
  const done = h('ol', { class: 'ck-done' });
  const hint = h('p', { class: 'ck-hint', 'aria-live': 'polite', text: '순서대로 눌러 보세요.' });
  const order = shuffle(COOK_STEPS.map((s, i) => i));
  const btns = order.map(i => [h('button', { class: 'ck-step', type: 'button', text: COOK_STEPS[i].t }), i]);
  const outro = h('p', { class: 'ck-outro' });
  const v = h('section', { class: 'view cook', dataset: { tone: 'light', temp: '1' } },
    h('div', { class: 'ck-page' },
      h('div', { class: 'ck-top' },
        h('h2', { text: '장조림' }),
        h('p', { class: 'ck-sub', text: '엄마의 공책' })),
      h('ul', { class: 'ck-ingr' }, RECIPE_MEMO.slice(1).map(l => h('li', { text: P(l) }))),
      done, hint,
      h('div', { class: 'ck-btns' }, btns.map(b => b[0])),
      outro));
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
  await wait(3200);
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
  await wait(6000);
  room.el.classList.add('slowread');
  const n = room.markRead({ slow: true });
  await wait(2400 + n * 900);
  await room.caption('1이 사라졌다.');
  await wait(3200);
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
  await say(['어떤 답장을 골랐어도', '엄마의 메모는 결국 같은 말이었어요.'], 1800);
  await say(['진짜 엔딩은 게임 밖에 있어요.'], 900);
  await say(['오늘, 1이 금방 사라질 사람에게', '조금 길게 답장해 보세요.'], 600);
  const again = h('button', { class: 'pill key end-again', type: 'button' }, icon('arrow-back-up'), h('span', { text: '다른 답장으로 다시 하기' }));
  box.append(again);
  await onceClick(again);
  location.reload();
}
