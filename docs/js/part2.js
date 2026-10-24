'use strict';

/* ================================================================
   2부 · 엄마의 휴대폰 (배터리 3%)
   ================================================================ */

// 어버이날에 '사랑해'를 보냈다면 그 캡처가, 아니면 벚꽃 사진이 배경화면이다
const captureShot = () => h('div', { class: 'cap-shot' },
  h('div', { class: 'cap-date', text: dateLong(5, 8) }),
  h('div', { class: 'cap-row' },
    avatar(AV.me),
    h('div', { class: 'cap-col' },
      h('div', { class: 'cap-name', text: S.F }),
      h('div', { class: 'cap-line' },
        h('div', { class: 'cap-bubble', text: '엄마 어버이날 축하해 주말에 갈게 사랑해' }),
        h('span', { class: 'cap-time', text: '오전 11:31' })))));

function momWallpaper({ withShot = true } = {}) {
  if (S.wallpaperLove) return h('div', { class: 'ls-wall capture' }, withShot ? captureShot() : null);
  return h('div', { class: 'ls-wall art', html: ART.cherry({ slice: true }) });
}

async function part2() {
  await titleCard({ label: '2부', title: '엄마의 휴대폰', quote: '배터리 3%' });
  setClock(11, 6, '01:12');
  setBattery(3);

  // 잠금화면: 내가 보낸 말들이 '읽지 않음'으로 쌓여 있다
  const unread = [
    ...S.night.map(t => ({ t, when: '10월 31일' })),
    ...S.last.map(t => ({ t, when: '11월 5일' })),
  ];
  await lockScene({
    narr: '엄마의 휴대폰을 켰다.',
    wall: momWallpaper({ withShot: false }),
    slot: S.wallpaperLove ? h('div', { class: 'ls-slot' }, captureShot()) : null,
    cls: 'mom',
    hint: '알림을 눌러 잠금 해제',
    gapBefore: 2200,
    cards: unread.map(u => ({ title: S.F, text: u.t, when: u.when, tag: '읽지 않음', gap: 520, quiet: true })),
  });
  await momPin();
  await momHome();
}

async function momPin() {
  const dots = [0, 1, 2, 3].map(() => h('i'));
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map(k => h('span', { class: k ? 'pk' : 'pk blank', text: k }));
  const narr = h('p', { class: 'pin-narr' });
  const v = h('section', { class: 'view pin', dataset: { tone: 'dark', temp: '1' } },
    momWallpaper(), h('div', { class: 'pin-shade' }),
    h('div', { class: 'pin-in' },
      narr,
      h('div', { class: 'pin-title', text: '비밀번호 입력' }),
      h('div', { class: 'pin-dots' }, dots),
      h('div', { class: 'pin-pad' }, keys)));
  await show(v, 900);
  await typeText(narr, '비밀번호는 내 생일이었다.', { cps: 13 });
  await wait(1600);
  for (const d of dots) {
    d.classList.add('on');
    await wait(520);
  }
  await wait(700);
  v.classList.add('unlock');
  await wait(500);
}

/* ---------- 홈 화면 ---------- */
const APPS = [
  { id: 'msg', name: '메시지', icon: 'message-circle', color: '#5b9bd5', run: () => appMessages() },
  { id: 'photo', name: '사진', icon: 'photo', color: '#e7a33e', run: () => appPhotos() },
  { id: 'calls', name: '통화 기록', icon: 'phone', color: '#4caf7a', run: () => appCalls() },
  { id: 'search', name: '검색', icon: 'world-search', color: '#7a8cff', run: () => appSearch() },
  { id: 'rec', name: '녹음', icon: 'microphone', color: '#e05d5d', run: () => appRecorder() },
  { id: 'drafts', name: '임시저장함', icon: 'file-pencil', color: '#a88b6a', run: () => appDrafts() },
];

async function momHome() {
  const seen = new Set();
  let batt = 3;
  const note = h('div', { class: 'home-note' });
  const setNote = () => {
    note.replaceChildren(icon('battery-1'), h('span', { text: `배터리 ${batt}% · 임시저장함은 마지막에 열어 보세요` }));
  };
  setNote();
  const tiles = APPS.map(a => {
    const b = h('button', { class: 'app-tile', type: 'button', dataset: { app: a.id } },
      h('span', { class: 'app-ic', style: `--ac:${a.color}` }, icon(a.icon), h('span', { class: 'app-seen' }, icon('check'))),
      h('span', { class: 'app-name', text: a.name }));
    return [b, a];
  });
  const v = h('section', { class: 'view home', dataset: { tone: 'dark' } },
    momWallpaper(), h('div', { class: 'home-shade' }),
    h('div', { class: 'home-in' }, note, h('div', { class: 'home-grid' }, tiles.map(t => t[0]))));

  for (;;) {
    await show(v, 800);
    const others = APPS.filter(a => a.id !== 'drafts' && !seen.has(a.id));
    v.querySelector('[data-app="drafts"]').classList.toggle('ready', others.length === 0);
    const app = await pick(tiles);
    if (app.id === 'drafts' && others.length) {
      const ok = await confirmSheet(v, '배터리가 얼마 남지 않았다.', `아직 열어 보지 않은 앱: ${others.map(a => a.name).join(', ')}`, '임시저장함 열기', '다른 앱 먼저 보기');
      if (!ok) continue;
    }
    await app.run();
    seen.add(app.id);
    tiles.find(t => t[1] === app)[0].classList.add('seen');
    if (app.id === 'drafts') return;
    if (seen.size >= 3 && batt === 3) {
      batt = 2;
      setBattery(2);
      setNote();
    }
  }
}

function confirmSheet(parent, title, body, yes, no) {
  return new Promise(res => {
    const y = h('button', { class: 'pill key', type: 'button', text: yes });
    const n = h('button', { class: 'pill', type: 'button', text: no });
    const sheet = h('div', { class: 'sheet-wrap' },
      h('div', { class: 'sheet', role: 'dialog', 'aria-label': title },
        h('b', { text: title }), h('p', { text: body }), h('div', { class: 'sheet-btns' }, n, y)));
    parent.append(sheet);
    pick([[y, true], [n, false]]).then(v => {
      sheet.remove();
      res(v);
    });
  });
}

/* ---------- 앱 공통 틀 ---------- */
function appShell(title, { back = true, cls = '' } = {}) {
  const backBtn = back
    ? h('button', { class: 'ap-back', type: 'button', 'aria-label': '뒤로' }, icon('chevron-left'))
    : h('span', { class: 'ap-back' });
  const body = h('div', { class: 'ap-body' });
  const titleEl = h('h2', { text: title });
  const el = h('section', { class: `view app ${cls}`.trim(), dataset: { tone: 'app', temp: '1' } },
    h('header', { class: 'ap-head' }, backBtn, titleEl), body);
  return { el, body, back: backBtn, titleEl };
}

/* ---------- 메시지 ---------- */
let MOM_ROOMS = null;

function buildMomRooms() {
  const imo = new Room({ title: '이모', peers: { imo: { name: '이모', av: AV.imo } }, back: true });
  imo.script = [
    ['date', 8, 21],
    ['imo', '언니 결과 어떻게 나왔어', '오후 7:12'],
    ['me', '안좋단다', '오후 7:20'],
    ['imo', '애한테는 말했어?', '오후 7:20'],
    ['me', '아직', '오후 7:24'],
    ['imo', '언제 말할라고', '오후 7:24'],
    ['me', '바쁜애한테 무슨말을해', '오후 7:31'],
    ['imo', '언니 그러다 후회한다', '오후 7:31'],
    ['date', 9, 28],
    ['imo', '추석때 말했어?', '오전 9:02'],
    ['me', '못했다', '오전 9:40'],
    ['me', '얼굴보니까 못하겠더라', '오전 9:40'],
  ];
  const dad = new Room({ title: '남편', peers: { dad: { name: '남편', av: AV.dad } }, back: true });
  dad.script = [
    ['date', 7, 14],
    ['dad', '병원 몇시', '오전 7:05'],
    ['me', '10시 혼자간다', '오전 7:09'],
    ['dad', '같이가자', '오전 7:09'],
    ['date', 8, 10],
    ['dad', '애한테 내려오라고 문자했다', '오후 9:05'],
    ['me', '왜그랬어', '오후 9:11'],
    ['dad', '애도 알아야지', '오후 9:11'],
    ['date', 8, 21],
    ['dad', '애한테 말하자', '오후 4:20'],
    ['me', '추석때 내가 할께', '오후 4:32'],
  ];
  const song = new Room({
    title: '화요일 노래교실 12',
    peers: { t: { name: '노래교실 선생님', av: AV.teacher }, s: { name: '순옥', av: AV.member } },
    back: true,
  });
  song.script = [
    ['date', 10, 6],
    ['t', '회원님들 환절기 감기 조심하세요^^', '오후 5:10'],
    ['date', 10, 13],
    ['t', '이번주 휴강합니다~', '오전 10:02'],
    ['date', 10, 20],
    ['s', '경희님 요즘 안보이시네요 쾌차하세요', '오후 2:15'],
    ['me', '감사합니다 곧 갈께요', '오후 6:48'],
    ['caption', '경희님.'],
    ['caption', '엄마 이름이 경희라는 걸, 처음 알게 된 것 같았다.'],
  ];
  return { imo, dad, song };
}

async function playScript(room) {
  if (room.played) return;
  room.played = true;
  for (const [kind, a, b] of room.script) {
    if (kind === 'date') room.date(a, b);
    else if (kind === 'caption') { await wait(900); await room.caption(a); }
    else {
      room.msg({ from: kind, text: P(a), time: b });
      await wait(650);
    }
  }
}

async function appMessages() {
  MOM_ROOMS ||= buildMomRooms();
  const sh = appShell('메시지');
  const lastUnread = S.last[S.last.length - 1] || S.night[S.night.length - 1] || '';
  const rows = [
    { key: 'F', name: S.F, av: AV.me, preview: lastUnread, when: '11월 5일', badge: S.night.length + S.last.length },
    { key: 'imo', name: '이모', av: AV.imo, preview: '얼굴보니까 못하겠더라', when: '9월 28일' },
    { key: 'song', name: '화요일 노래교실', av: AV.group, preview: '감사합니다 곧 갈께요', when: '10월 20일', count: 12 },
    { key: 'dad', name: '남편', av: AV.dad, preview: '추석때 내가 할께', when: '8월 21일' },
  ];
  const pairs = rows.map(r => {
    const b = h('button', { class: 'ml-row', type: 'button' },
      avatar(r.av),
      h('span', { class: 'ml-mid' },
        h('span', { class: 'ml-name' }, h('b', { text: r.name }), r.count ? h('span', { class: 'ml-count', text: ` ${r.count}` }) : null),
        h('span', { class: 'ml-prev', text: r.preview })),
      h('span', { class: 'ml-side' }, h('span', { class: 'ml-when', text: r.when }), r.badge ? h('span', { class: 'ml-badge', text: r.badge }) : null));
    sh.body.append(b);
    return [b, r.key];
  });
  await show(sh.el, 700);
  for (;;) {
    const k = await pick([[sh.back, 'back'], ...pairs]);
    if (k === 'back') return;
    if (k === 'F') {
      toast(sh.el, '열면 1이 사라질 것 같았다. 엄마가 읽은 게 아닌데.', 4200);
      continue;
    }
    const room = MOM_ROOMS[k];
    await show(room.el, 700);
    const back = onceClick(room.backBtn);
    await playScript(room);
    await back;
    await show(sh.el, 600);
  }
}

/* ---------- 사진 ---------- */
async function appPhotos() {
  const items = [
    { art: 'snow', cap: '눈 와서 찍었다 {F} 보여줄라고', m: 1, d: 18 },
    { art: 'cherry', cap: '아빠가 찍었다 다 흔들렸다', m: 4, d: 5 },
    { art: 'soup', cap: '생일 미역국 아빠가 끓였는데 짜다', m: 6, d: 26 },
    { art: 'carousel', cap: '일곱살 {F} 회전목마 열번 탔다', m: 9, d: 10 },
    { art: 'recipe', cap: '장조림 세번 다시 썼다', m: 10, d: 15 },
    S.wallpaperLove
      ? { art: 'capture', cap: '사랑한대 배경화면 했다', m: 5, d: 8 }
      : { art: 'maple', cap: '내년에도 볼수있을까', m: 10, d: 20 },
  ].sort((a, b) => stamp(b.m, b.d, 0, 0) - stamp(a.m, a.d, 0, 0));
  const sh = appShell('사진');
  const grid = h('div', { class: 'ph-grid' });
  const pairs = items.map(it => {
    const b = h('button', { class: 'ph-thumb', type: 'button', 'aria-label': `${it.m}월 ${it.d}일 사진`, html: ART[it.art]() });
    grid.append(b);
    return [b, it];
  });
  sh.body.append(h('div', { class: 'ph-head', text: `사진 ${items.length}장` }), grid);
  await show(sh.el, 700);
  for (;;) {
    const it = await pick([[sh.back, null], ...pairs]);
    if (!it) return;
    const vw = appShell(`${it.m}월 ${it.d}일`, { cls: 'viewer' });
    vw.body.append(
      h('div', { class: 'pv-img', html: ART[it.art]() }),
      h('div', { class: 'pv-desc' }, h('span', { class: 'pv-lbl', text: '설명' }), h('p', { text: P(it.cap) })));
    await show(vw.el, 600);
    await onceClick(vw.back);
    await show(sh.el, 500);
  }
}

/* ---------- 통화 기록 ---------- */
async function appCalls() {
  const c0830 = S.calls.c0830 || { answered: false };
  const c1003 = S.calls.c1003 || { answered: false };
  const c0821 = S.calls.c0821;
  const F = S.F;
  const list = [
    { who: F, ic: 'phone-x', when: '10월 31일 오후 11:38', note: '발신 취소', red: true },
    { who: F, ic: 'phone-x', when: '10월 31일 오후 11:36', note: '발신 취소', red: true },
    { who: '대학병원', ic: 'phone-incoming', when: '10월 29일 오전 10:12', note: '수신 · 3분 40초' },
    { who: F, ic: 'video', when: '10월 3일 오후 8:30', note: c1003.answered ? `영상통화 · ${fmtDurKo(c1003.secs)}` : '영상통화 · 연결 안 됨' },
    { who: F, ic: 'phone-x', when: '9월 28일 오전 3:05', note: '발신 취소', red: true },
    { who: F, ic: 'phone-outgoing', when: '8월 30일 오후 8:15', note: c0830.answered ? `발신 · ${fmtDurKo(c0830.secs)}` : '발신 · 연결 안 됨' },
    c0821 ? { who: F, ic: 'phone-incoming', when: '8월 21일 오후 2:48', note: `수신 · ${fmtDurKo(c0821.secs)}` } : null,
    { who: F, ic: 'phone-outgoing', when: '8월 21일 오후 2:41', note: '발신 · 연결 안 됨' },
    { who: F, ic: 'phone-outgoing', when: '8월 21일 오후 2:39', note: '발신 · 연결 안 됨' },
    { who: '대학병원', ic: 'phone-incoming', when: '8월 21일 오전 11:02', note: '수신 · 1분 52초' },
    { who: '내과', ic: 'phone-incoming', when: '5월 27일 오전 10:40', note: '수신 · 2분 05초' },
  ].filter(Boolean);
  const sh = appShell('통화 기록');
  for (const c of list) {
    sh.body.append(h('div', { class: `cl-row${c.red ? ' red' : ''}` },
      h('span', { class: 'cl-ic' }, icon(c.ic)),
      h('span', { class: 'cl-mid' }, h('b', { text: c.who }), h('span', { text: c.note })),
      h('span', { class: 'cl-when', text: c.when })));
  }
  await show(sh.el, 700);
  await onceClick(sh.back);
}

/* ---------- 검색 ---------- */
async function appSearch() {
  const words = ['자식한테 아프다고 말하는법', '장조림 오래 보관하는법', '항암 머리 빠지면', '새벽에 잠 안올때', '음성 녹음 하는법', '자식 걱정 안시키는법', '서울 큰병원 가는길', '글씨 크게 하는법', '이모티콘 보내는법'];
  const sh = appShell('검색');
  sh.body.append(
    h('div', { class: 'se-box' }, icon('search'), h('span', { text: '검색어를 입력하세요' })),
    h('div', { class: 'se-head' }, h('b', { text: '최근 검색어' }), h('span', { text: '전체 삭제' })));
  words.forEach((w, i) => {
    const row = h('div', { class: 'se-row', style: `animation-delay:${(i * 0.12 * SPEED).toFixed(2)}s` }, icon('clock'), h('span', { text: w }), icon('x', 'se-x'));
    sh.body.append(row);
  });
  await show(sh.el, 700);
  await onceClick(sh.back);
}

/* ---------- 녹음 ---------- */
async function appRecorder() {
  const recs = [
    { name: '새 녹음', when: '10월 30일 오전 2:14', dur: '0:52', cut: true,
      lines: ['{C} 엄마다', '이거 들을때면 엄마가…', '아니다 이건 다시 하자', '', '밥 잘 챙겨먹고', '추운데 옷 따뜻하게 입고', '도착하면 도착했다고 하고', '엄마는 괜찮다', '엄마는…'] },
    { name: '보낸 녹음', when: '1월 5일 오후 3:21', dur: '0:09', lines: ['아 아 이거 되나', '{C} 엄마다', '아이고 모르겠다', '밥 잘 챙겨먹어라', '끊는다'] },
    { name: '연습 2', when: '1월 5일 오후 3:12', dur: '0:06', lines: ['{C} 엄마다', '아니다 이건 이상하다'] },
    { name: '연습 1', when: '1월 5일 오후 3:05', dur: '0:04', lines: ['아 아 이거 되나'] },
  ];
  const sh = appShell('녹음');
  const pairs = recs.map(r => {
    const b = h('button', { class: 'rc-row', type: 'button' },
      h('span', { class: 'rc-ic' }, icon('microphone')),
      h('span', { class: 'rc-mid' }, h('b', { text: r.name }), h('span', { text: r.when })),
      h('span', { class: 'rc-dur', text: r.dur }));
    sh.body.append(b);
    return [b, r];
  });
  await show(sh.el, 700);
  for (;;) {
    const r = await pick([[sh.back, null], ...pairs]);
    if (!r) return;
    await playRecording(r);
    await show(sh.el, 500);
  }
}

async function playRecording(r) {
  const vw = appShell(r.name, { cls: 'player' });
  const bars = [];
  for (let i = 0; i < 40; i++) bars.push(h('i', { style: `--h:${(18 + Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)) * 80).toFixed(0)}%` }));
  const timeEl = h('div', { class: 'pl-time', text: '0:00' });
  const playBtn = h('button', { class: 'pl-play', type: 'button', 'aria-label': '재생' }, icon('player-play'));
  const text = h('div', { class: 'pl-text' });
  vw.body.append(
    h('div', { class: 'pl-when', text: r.when }),
    h('div', { class: 'pl-wave' }, bars), timeEl,
    h('div', { class: 'pl-ctrl' }, playBtn, h('span', { class: 'pl-total', text: r.dur })),
    text);
  await show(vw.el, 600);
  const choice = await pick([[vw.back, 'back'], [playBtn, 'play']]);
  if (choice === 'back') return;
  playBtn.disabled = true;
  playBtn.replaceChildren(icon('player-pause'));
  const total = Number(r.dur.split(':')[0]) * 60 + Number(r.dur.split(':')[1]);
  const lines = r.lines.map(P);
  let shown = 0;
  const step = () => {
    shown = Math.min(total, shown + 1);
    timeEl.textContent = `${Math.floor(shown / 60)}:${pad2(shown % 60)}`;
    bars.forEach((b, i) => b.classList.toggle('lit', i / bars.length < shown / total));
  };
  const perLine = total / lines.length;
  for (const line of lines) {
    const target = Math.min(total, Math.round(shown + perLine));
    const p = h('p', { class: line ? '' : 'pl-silence', text: line ? '' : '(한참 아무 소리도 없다)' });
    text.append(p);
    const typing = line ? typeText(p, line, { cps: 8 }) : wait(1600);
    const ticking = (async () => { while (shown < target) { step(); await wait(260); } })();
    await Promise.all([typing, ticking]);
    await wait(480);
  }
  while (shown < total) step();
  playBtn.replaceChildren(icon('player-play'));
  if (r.cut) {
    await wait(900);
    text.append(h('p', { class: 'pl-cut', text: '녹음은 거기서 끝나 있었다.' }));
  }
  await onceClick(vw.back);
}

/* ---------- 임시저장함 ---------- */
function buildDrafts() {
  const fixed = [
    { at: stamp(8, 21, 15, 31), label: labelAt(8, 21, 15, 31), tag: '전송 안 됨',
      lines: [{ t: '{C} 엄마 큰병원에서 검사결과 나왓는데', del: true }, { note: '지움' }, '바쁜애한테 무슨'] },
    { at: stamp(9, 28, 3, 14), label: labelAt(9, 28, 3, 14), tag: '전송 안 됨',
      lines: [{ t: '엄마가 좀 아프다', del: true }, { t: '무서워', del: true }, { note: '지움' }, '자는애 깰라'] },
    { at: stamp(10, 15, 14, 10), label: labelAt(10, 15, 14, 10), lines: RECIPE_MEMO },
    { at: stamp(10, 25, 21, 30), label: labelAt(10, 25, 21, 30), lines: kindMemo() },
    { at: stamp(10, 29, 13, 5), label: labelAt(10, 29, 13, 5), lines: FORGET_MEMO },
  ];
  return [...S.memos, ...fixed].sort((a, b) => a.at - b.at);
}

const RECIPE_MEMO = ['장조림', '소고기 홍두깨살 한근', '물 세컵 간장 반컵', '설탕 두숟갈 마늘 한줌', '메추리알 꼭 넣기', '{F} 메추리알만 골라먹음'];
const FORGET_MEMO = ['요즘 자꾸 깜빡한다', '밥먹어 두번 보냄', '약 때문인가'];
const kindMemo = () => (S.kindness >= 10
  ? ['요즘 {F} 답장이 길다', '엄마 아픈거 눈치챘나', '그래도 좋다']
  : ['요즘 {F} 많이 바쁜가보다', '괜찮다', '바쁜게 좋은거다']);

function memoLines(lines) {
  return lines.map(l => {
    const x = typeof l === 'string' ? { t: l } : l;
    if (x.note) return h('div', { class: 'dl-note', text: x.note });
    return h('div', { class: x.del ? 'dl-line del' : 'dl-line', text: P(x.t) });
  });
}

async function appDrafts() {
  setBattery(1);
  const items = buildDrafts();
  const total = items.length + 1;
  const sh = appShell('임시저장함', { back: false, cls: 'drafts' });
  const count = h('div', { class: 'dr-count' });
  const stage = h('div', { class: 'dr-stage' });
  const nextBtn = h('button', { class: 'pill key dr-next', type: 'button' }, h('span', { text: '다음' }), icon('chevron-right'));
  sh.body.append(count, stage, h('div', { class: 'dr-foot' }, nextBtn));
  await show(sh.el, 700);

  const card = (n, it) => h('article', { class: 'dr-card' },
    h('header', { class: 'dr-head' },
      h('span', { class: 'dr-no', text: `${n}` }),
      h('span', { class: 'dr-label', text: it.label }),
      h('span', { class: `dr-tag${it.tag === '전송 안 됨' ? ' warn' : ''}`, text: it.tag || '임시저장' })),
    h('div', { class: 'dr-body' }, memoLines(it.lines)));

  for (let i = 0; i < items.length; i++) {
    count.textContent = `${i + 1} / ${total}`;
    stage.replaceChildren(card(i + 1, items[i]));
    await wait(900);
    await onceClick(nextBtn);
  }

  // 마지막: 10월 31일 오후 11:41 · 전송 안 됨
  count.textContent = `${total} / ${total}`;
  const body = h('div', { class: 'dr-body letter' });
  const last = h('article', { class: 'dr-card last' },
    h('header', { class: 'dr-head' },
      h('span', { class: 'dr-no', text: `${total}` }),
      h('span', { class: 'dr-label', text: labelAt(10, 31, 23, 41) }),
      h('span', { class: 'dr-tag warn', text: '전송 안 됨' })),
    body);
  stage.replaceChildren(last);
  nextBtn.replaceChildren(icon('file-pencil'), h('span', { text: '열어 보기' }));
  await onceClick(nextBtn);
  nextBtn.remove();
  const l1 = h('div', { class: 'dl-line' });
  body.append(l1);
  await typeJamo(l1, P('{C} 엄마가 할말이 있는데'), { step: 120 });
  await wait(500);
  const l2 = h('div', { class: 'dl-line' });
  body.append(l2);
  await typeJamo(l2, '글씨가 느려서…', { step: 140 });
  await wait(1200);
  await batteryDeath(sh.el);
}

async function batteryDeath(viewEl) {
  const modal = h('div', { class: 'batt-modal', role: 'alertdialog' },
    h('div', { class: 'bm-card' }, icon('battery-exclamation'), h('b', { text: '배터리가 부족합니다' }), h('span', { text: '남은 배터리 1% · 충전기를 연결하세요' })));
  viewEl.append(modal);
  buzz(true);
  await wait(2600);
  viewEl.classList.add('crt');
  await wait(1300);
  setBattery(null);
  await narration(['화면이 꺼졌다.', '', '충전기를 꽂고 기다리는 동안', '엄마의 1년을 생각했다.'], { show: 400, end: 3000, gap: 1000 });
}
