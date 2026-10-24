'use strict';

/* ================================================================
   시작 화면 → 인트로 → 1부 → 2부 → 3부 → 에필로그
   ================================================================ */

function startScreen() {
  return new Promise(resolve => {
    let kind = null;
    const segBtns = [
      h('button', { class: 'st-seg-btn', type: 'button', 'aria-pressed': 'false', dataset: { k: 'daughter' }, text: '딸' }),
      h('button', { class: 'st-seg-btn', type: 'button', 'aria-pressed': 'false', dataset: { k: 'son' }, text: '아들' }),
    ];
    const input = h('input', { class: 'st-input', type: 'text', maxlength: '6', placeholder: '이름 (최대 6자)', autocomplete: 'off', 'aria-label': '이름' });
    const preview = h('p', { class: 'st-preview' });
    const err = h('p', { class: 'st-err', role: 'alert' });
    const go = h('button', { class: 'st-go', type: 'button' }, h('span', { text: '시작하기' }));
    const nameOf = () => Array.from(input.value.trim()).slice(0, 6).join('');

    const refresh = () => {
      segBtns.forEach(b => {
        const on = b.dataset.k === kind;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const name = nameOf();
      if (kind) setCaller(kind);
      else if (name) setCaller('name', name);
      preview.textContent = kind || name ? `엄마는 나를 “${S.C}”라고 불렀다.` : '';
      if (kind || name) err.textContent = '';
    };

    segBtns.forEach(b => b.addEventListener('click', () => {
      kind = b.dataset.k;
      input.value = '';
      refresh();
    }));
    input.addEventListener('input', () => {
      if (input.value) kind = null;
      refresh();
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });

    const v = h('section', { class: 'view start', dataset: { tone: 'card' } },
      h('div', { class: 'st-in' },
        h('div', { class: 'st-mark' }, icon('file-pencil')),
        h('h1', { class: 'st-title', text: '엄마의 임시저장함' }),
        h('p', { class: 'st-meta', text: '3부 · 약 1시간' }),
        h('div', { class: 'st-box' },
          h('div', { class: 'st-label', text: '엄마가 나를 부르는 말' }),
          h('div', { class: 'st-seg' }, segBtns),
          h('div', { class: 'st-or' }, h('span', { text: '또는 이름' })),
          input, preview, err),
        go,
        h('p', { class: 'st-note', text: '소리 없이 진행돼요.' })));

    go.addEventListener('click', () => {
      const name = nameOf();
      if (!kind && !name) {
        err.textContent = '엄마가 나를 부르는 말을 골라 주세요.';
        v.querySelector('.st-box').classList.remove('shake');
        void v.offsetWidth;
        v.querySelector('.st-box').classList.add('shake');
        return;
      }
      if (!kind && !/^[가-힣a-zA-Z]+$/.test(name)) {
        err.textContent = '이름은 한글이나 영문으로 6자까지 적어 주세요.';
        return;
      }
      if (kind) setCaller(kind);
      else setCaller('name', name);
      go.disabled = true;
      input.blur();
      resolve();
    });

    setClock(12, 3, '18:40');
    show(v, 10);
  });
}

async function intro() {
  await narration(['엄마는 예순둘에 처음 스마트폰을 샀다.', '글자 하나 치는 데 한참 걸려서', '엄마 문자는 늘 짧았다.'], { theme: 'white', gap: 900, end: 2600, show: 1500 });
}

async function run() {
  await startScreen();
  createRooms();
  await intro();
  await part1();
  await part2();
  await part3();
  await epilogue();
}

run().catch(err => {
  console.error(err);
  const box = h('section', { class: 'view narr black on', style: 'z-index:9999' },
    h('div', { class: 'narr-box' }, h('p', { text: '이야기를 이어 가지 못했어요. 새로고침해서 다시 시작해 주세요.' })));
  screenEl.append(box);
});
