'use strict';

/* ================================================================
   3부 · 엄마의 1년
   같은 메신저, 이제 나는 엄마다. 엄마 말은 오른쪽(1 포함),
   1부에서 내가 고른 답이 왼쪽으로 그대로 온다.
   ================================================================ */

// 엄마의 작성창: (긴 진심 → 지우기) → 짧은 말 → 보내기
async function momSays(room, text, { draft = null, slip = null, tap = true, step = 125, read = null } = {}) {
  if (draft) {
    await room.compose(draft, { step: 105 });
    await room.button('지우기', 'backspace');
    await room.erase();
    await wait(1000);
  }
  if (slip) {
    // 오타를 냈다가 지우고 다시 친다: slip = [잘못 친 글자까지, 지울 글자 수]
    const [typed, back] = slip;
    await room.compose(typed, { step });
    await wait(800);
    await room.backspace(back);
    await wait(500);
    const kept = Array.from(P(typed)).length - back;
    await room.compose(Array.from(P(text)).slice(kept).join(''), { step, append: true });
  } else {
    await room.compose(text, { step });
  }
  if (tap) await room.button('보내기', 'send');
  else await wait(550);
  const m = room.sendComposed();
  if (read != null) {
    await wait(read);
    room.markRead();
  }
  return m;
}

// 메모 카드가 내려와 그 선택의 메모를 쓰는 모습
async function memoCard(room, { label, lines, flash = false }) {
  if (flash) {
    room.el.classList.add('shot');
    await wait(500);
    room.el.classList.remove('shot');
  }
  const body = h('div', { class: 'mc-body' });
  const saved = h('span', { class: 'mc-saved' }, icon('check'), '임시저장됨');
  const card = h('div', { class: 'memo-card' },
    h('div', { class: 'mc-head' }, icon('file-pencil'), h('span', { text: `임시저장함 · ${label}` }), saved),
    body);
  room.overlay.append(card);
  void card.offsetWidth;
  card.classList.add('in');
  await wait(900);
  for (const l of lines) {
    const p = h('div', { class: 'mc-line' });
    body.append(p);
    await typeJamo(p, P(l), { step: 85, jitter: 60 });
    await wait(260);
  }
  await wait(2200);
  saved.classList.add('on');
  await wait(1100);
  card.classList.remove('in');
  card.classList.add('out');
  await wait(800);
  card.remove();
}

// 1부에서 내가 했던 반응이 이번엔 엄마 쪽으로 온다
async function kidEcho(room, id, { readDelay = 1800, momLag = 1600 } = {}) {
  const sc = SC[id];
  const o = sc.opts[S.picks[id]];
  await wait(readDelay);
  room.markRead();
  if (o.act) {
    await wait(2600);
    await room.caption('1은 사라졌는데, 답장은 오지 않았다.');
  } else {
    await wait(1400);
    room.msg({ from: 'kid', text: P(o.t) });
    await wait(momLag);
    for (const r of o.r || []) await momSays(room, norm(r).text, { tap: false, step: 85, read: 900 });
  }
  if (o.m) {
    await wait(700);
    await memoCard(room, { label: memoAt(sc).label, lines: o.m, flash: o.wall });
  }
}

// 짧게 되감기: 메모가 남은 1부 장면을 엄마 쪽에서 한 번 더
async function replay(room, id) {
  const sc = SC[id];
  const o = sc.opts[S.picks[id]];
  if (!o || !o.m) return;
  setClock(sc.m, sc.d, sc.t);
  room.date(sc.m, sc.d);
  await wait(900);
  for (const it of sc.mom) {
    const x = norm(it);
    if (x.photo) {
      await wait(800);
      room.msg({ from: 'me', kind: 'photo', art: x.photo, unread: true });
      await wait(600);
    } else {
      await momSays(room, x.text, { tap: false, step: 85 });
    }
  }
  await kidEcho(room, id);
}

// 3부의 통화: 저장해 둔 통화를 엄마 쪽에서 다시 듣는다
async function replayCall(room, rec, { video = false, incoming = false } = {}) {
  const call = new Call({ name: momContact(), av: AV.me, sub: video ? '영상통화' : '휴대전화', video, remote: 'person', self: 'covered' });
  await show(call.el, 900);
  if (incoming) {
    await call.ring({ acceptOnly: true });
  } else {
    call.dial();
    await wait(3000);
    if (!rec || !rec.answered) {
      await call.fail('연결되지 않았습니다');
      await show(room.el, 900);
      return false;
    }
  }
  call.connect();
  await wait(700);
  for (const l of rec.lines) await call.say(l.who === 'kid' ? 'them' : 'me', l.t);
  const secs = await call.end();
  await show(room.el, 900);
  room.msg({ from: incoming ? 'kid' : 'me', kind: 'call', call: { secs: rec.secs || secs, video } });
  return true;
}

// 걸었다가 엄마가 스스로 끊는 전화
async function dialAndCancel(room, note) {
  await room.button('전화 걸기', 'phone');
  const call = new Call({ name: momContact(), av: AV.me, sub: '휴대전화' });
  await show(call.el, 800);
  call.dial({ endable: true });
  await wait(1600);
  if (note) await call.showNote(note);
  call.endBtn.classList.add('pulse');
  await call.hangup('발신 취소');
  await show(room.el, 800);
}

async function dialNoAnswer(room) {
  await room.button('전화 걸기', 'phone');
  const call = new Call({ name: momContact(), av: AV.me, sub: '휴대전화' });
  await show(call.el, 800);
  call.dial();
  await wait(4200);
  await call.fail('연결되지 않았습니다');
  await show(room.el, 800);
}

// 1월 5일: 녹음 시작 → 0:01~0:09 → 전송
async function recordVoice(room) {
  const v = SC.s4.mom[1].voice;
  const timer = h('div', { class: 'rs-time', text: '0:00' });
  const lines = h('div', { class: 'rs-lines' });
  const bars = [];
  for (let i = 0; i < 28; i++) bars.push(h('i', { style: `--h:${(20 + Math.abs(Math.sin(i * 1.3)) * 70).toFixed(0)}%` }));
  const btn = h('button', { class: 'rs-btn', type: 'button' }, h('span', { class: 'rs-dot' }), h('span', { text: '녹음 시작' }));
  const sheet = h('div', { class: 'rec-sheet' },
    h('div', { class: 'rs-title', text: '음성 녹음 · 세 번째' }),
    timer, h('div', { class: 'rs-wave' }, bars), lines, btn);
  room.overlay.append(sheet);
  void sheet.offsetWidth;
  sheet.classList.add('in');
  await onceClick(btn);
  btn.disabled = true;
  btn.replaceChildren(h('span', { class: 'rs-dot live' }), h('span', { text: '녹음 중' }));
  sheet.classList.add('live');
  const texts = v.lines.map(P);
  let sec = 0;
  for (let i = 0; i < 9; i++) {
    sec = i + 1;
    timer.textContent = `0:${pad2(sec)}`;
    const t = texts[Math.floor((i / 9) * texts.length)];
    if (!lines.lastElementChild || lines.lastElementChild.dataset.t !== t) {
      lines.append(h('div', { text: t, dataset: { t } }));
    }
    await wait(1050);
  }
  sheet.classList.remove('live');
  btn.disabled = false;
  btn.replaceChildren(icon('send'), h('span', { text: '전송' }));
  await onceClick(btn);
  sheet.classList.remove('in');
  await wait(500);
  sheet.remove();
  const m = room.msg({ from: 'me', kind: 'voice', voice: v, unread: true });
  m.bubble.classList.add('done');
}

// 9월 10일: 프로필 사진 바꾸기 (창피하다는 말을 들었으면 나중에 되돌린다)
async function changeProfile(room, { label = '프로필 사진 바꾸기', from = AV.mom, to = AV.momKid, status = '{F} 화이팅' } = {}) {
  await room.button(label, 'camera');
  const av = avatar(from);
  const statusEl = h('div', { class: 'pf-status', text: from === AV.mom ? '' : P(status) });
  const card = h('div', { class: 'profile-card' },
    h('div', { class: 'pf-av' }, av),
    h('div', { class: 'pf-name', text: '엄마' }),
    statusEl);
  room.overlay.append(card);
  void card.offsetWidth;
  card.classList.add('in');
  await wait(1600);
  av.classList.add('swap');
  await wait(500);
  av.style.setProperty('--avc', to.color);
  av.replaceChildren(icon(to.icon));
  av.classList.remove('swap');
  await wait(1000);
  if (!statusEl.textContent) await typeJamo(statusEl, P(status), { step: 120 });
  await wait(1800);
  card.classList.remove('in');
  await wait(700);
  card.remove();
}

/* ---------- 10월 31일: 메모장의 편지 ---------- */
const LETTER = [
  ['{C} 엄마가 할말이 있는데', '글씨가 느려서 자꾸 지웠다'],
  ['니가 보낸 문자에 1 금방 없어졌지', '엄마가 폰을 손에 쥐고 살아서 그래'],
  ['밥먹었니 옷입어 도착햇니', '엄마는 그것밖에 못보냈는데', '그거 다 사랑한다는 말이다'],
  ['장조림은 공책에 적어놨다', '메추리알 꼭 넣어라'],
  ['나중에 엄마한테 보낸 문자에', '1이 안 없어져도', '엄마가 안 읽은거 아니다', '엄마는 다 안다'],
  ['{F} 사랑해', '이 말은 다 쓰고 간다'],
];

async function letterScene() {
  const text = h('div', { class: 'lt-text' });
  const banners = h('div', { class: 'lt-banners' });
  const foot = h('div', { class: 'lt-foot' });
  const v = h('section', { class: 'view memoapp', dataset: { tone: 'app', temp: '1' } },
    h('header', { class: 'lt-head' }, icon('chevron-left'), h('b', { text: '메모' }), h('span', { text: '완료' })),
    h('div', { class: 'lt-date', text: labelAt(10, 31, 23, 41) }),
    h('div', { class: 'lt-scroll' }, text),
    foot, banners);
  await show(v, 1100);
  await wait(900);
  const night = S.night.slice();
  for (let pi = 0; pi < LETTER.length; pi++) {
    for (const line of LETTER[pi]) {
      const p = h('div', { class: 'lt-line' });
      text.append(p);
      await typeJamo(p, P(line), { step: 105, jitter: 80 });
      p.parentElement.parentElement.scrollTo({ top: 99999, behavior: 'smooth' });
      await wait(650);
    }
    text.append(h('div', { class: 'lt-gap' }));
    // 엄마가 쓰는 동안 뒤에서 내 답장이 도착하지만 엄마는 보지 못한다
    if ((pi === 0 || pi === 2) && night.length) showBanner(banners, night.shift());
    await wait(1100);
  }
  await wait(1200);
  const btn = h('button', { class: 'pill key lt-send', type: 'button' }, icon('send'), h('span', { text: '문자로 보내기' }));
  foot.append(btn);
  await onceClick(btn);
  btn.disabled = true;
  buzz(true);
  phone.classList.add('tremble');
  await wait(700);
  phone.classList.remove('tremble');
  v.classList.add('falling');
  await wait(1900);
  await narration(['문자로 보내려던 순간', '엄마의 손에서 휴대폰이 떨어졌다.', '', '그 메시지는 임시저장함에 남았고', '내 답장 옆의 1은', '사라지지 않았다.'], { show: 900, end: 4000, gap: 1100 });
}

function showBanner(parent, t) {
  const b = h('div', { class: 'banner' },
    avatar(AV.me),
    h('div', { class: 'bn-mid' }, h('b', { text: momContact() }), h('span', { text: t })),
    h('span', { class: 'bn-when', text: '지금' }));
  parent.append(b);
  setTimeout(() => b.classList.add('in'), 50);
  setTimeout(() => b.classList.remove('in'), 3200 * SPEED + 50);
  setTimeout(() => b.remove(), 4200 * SPEED + 50);
}

/* ---------- 3부 진행 ---------- */
async function part3() {
  await titleCard({ label: '3부', title: '엄마의 1년', quote: '엄마는 휴대폰을 손에 쥐고 살았다' });
  setBattery(null);
  const room = new Room({ title: momContact(), peers: { kid: { name: momContact(), av: AV.me } } });
  R.f = room;

  // 12월 3일
  setClock(12, 3, '19:08');
  await show(room.el, 1300);
  room.date(12, 3);
  await room.caption('뉴스에서 내일은 영하 10도라고 했다.');
  setClock(12, 3, '19:12');
  await momSays(room, '추운데옷입어', { draft: '{C} 내일 영하10도래 목도리하고 내복도 입고 가라 감기걸리면 고생한다' });
  await kidEcho(room, 's1', { readDelay: 1500 });
  await replay(room, 's2');

  // 12월 31일
  setClock(12, 31, '23:57');
  room.date(12, 31);
  await room.caption('올해는 이모보다 먼저 보내야 한다.');
  setClock(12, 31, '23:58');
  await momSays(room, '새해복많이받아', { slip: ['새해봉', 1] });
  await kidEcho(room, 's3', { readDelay: 1500 });

  // 1월 5일
  setClock(1, 5, '15:20');
  room.date(1, 5);
  await room.caption('녹음을 세 번 했다. 세 번째가 제일 나았다.');
  setClock(1, 5, '15:22');
  await momSays(room, '이모가 녹음하는거 알려줫다');
  await recordVoice(room);
  await kidEcho(room, 's4', { readDelay: 2000 });
  await replay(room, 's5');

  // 3월 14일
  setClock(3, 14, '22:03');
  room.date(3, 14);
  await room.caption('밤 10시가 넘었다. 오늘은 연락이 없었다.');
  await momSays(room, '밥먹었니', { draft: '밥은 먹고 일하니 엄마가 반찬 보내줄까 김치는 있니' });
  await kidEcho(room, 's6', { readDelay: 2200 });
  await replay(room, 's7');
  await replay(room, 's8');

  // 5월 8일
  setClock(5, 8, '11:20');
  room.date(5, 8);
  await room.caption('달력의 5월 8일에 동그라미를 쳐 두었다.');
  await momSays(room, '이번주말에오니', { draft: '오늘 어버이날인데 전화 한통' });
  await momSays(room, '멸치볶음 해놧다');
  await kidEcho(room, 's9', { readDelay: 2400 });
  await replay(room, 's10');

  // 5월 27일
  setClock(5, 27, '11:05');
  room.date(5, 27);
  await room.caption('내과 선생님이 큰 병원에 가 보라고 했다.');
  await room.compose('{C} 엄마 큰병원 가보래', { step: 120 });
  await room.button('지우기', 'backspace');
  await room.erase();
  await wait(900);
  await room.caption('아무것도 보내지 않았다.');
  await replay(room, 's12');

  // 7월 2일
  setClock(7, 2, '21:40');
  room.date(7, 2);
  await momSays(room, '요즘 잘자니', { draft: '요즘 엄마는 잠이 안온다 너는 잘자니' });
  await kidEcho(room, 's13', { readDelay: 2600 });
  await replay(room, 's14');

  // 8월 21일
  setClock(8, 21, '14:38');
  room.date(8, 21);
  await room.caption('대학병원 진료실. 의사 선생님 말이 잘 들리지 않았다.');
  setClock(8, 21, '14:39');
  await dialNoAnswer(room);
  setClock(8, 21, '14:41');
  await dialNoAnswer(room);
  setClock(8, 21, '14:47');
  await momSays(room, '바쁘니');
  await momSays(room, '괜찮다 별일아니다');
  const p16 = S.picks.s16;
  await wait(3200);
  room.markRead();
  if (p16 === 0 && S.calls.c0821) {
    await wait(1600);
    setClock(8, 21, '14:48');
    await replayCall(room, S.calls.c0821, { incoming: true });
    await wait(600);
    await room.caption('별일 아니라고 했다.');
  } else if (p16 === 1) {
    await wait(1400);
    room.msg({ from: 'kid', text: '이따 전화할게' });
    await wait(1200);
    await momSays(room, '그래', { tap: false, read: 900 });
    await wait(1800);
    await room.caption('전화는 오지 않았다.');
  } else {
    await wait(2600);
    await room.caption('1은 사라졌는데, 답장은 오지 않았다.');
  }
  setClock(8, 21, '15:30');
  await wait(1200);
  await room.caption('지금 말해야 한다.');
  const big = await momSays(room, '{C} 엄마 큰병원에서 검사결과 나왓는데', { step: 120 });
  await wait(2000);
  await room.button('모두에게서 삭제', 'trash', 'danger');
  room.deleteMsg(big);
  await wait(1600);

  // 8월 30일
  setClock(8, 30, '20:14');
  room.date(8, 30);
  await room.caption('목소리가 쉬어 있었다. 감기라고 하기로 했다.');
  await room.button('전화 걸기', 'phone');
  setClock(8, 30, '20:15');
  const ok0830 = await replayCall(room, S.calls.c0830);
  if (!ok0830) {
    room.msg({ from: 'me', kind: 'call', call: { cancel: true } });
    await momSays(room, '바쁘구나', { tap: false, read: 2600 });
    await momSays(room, '담에하자', { tap: false });
  }
  await wait(1400);

  // 9월 10일
  setClock(9, 10, '17:50');
  room.date(9, 10);
  await room.caption('머리카락이 한 움큼씩 빠졌다. 거울 대신 옛날 사진을 봤다.');
  await changeProfile(room);
  setClock(9, 10, '18:02');
  await momSays(room, '엄마 프사 바꿧다');
  await momSays(room, '니 어릴때 사진이다', { slip: ['니 어릴떄', 1] });
  await kidEcho(room, 's18', { readDelay: 3000 });
  if (S.picks.s18 === 2) {
    await wait(1200);
    await changeProfile(room, { label: '프로필 사진 되돌리기', from: AV.momKid, to: AV.mom });
  }

  // 9월 27일
  setClock(9, 27, '18:24');
  room.date(9, 27);
  await room.caption('기차가 떠났다. 반찬통에 장조림을 제일 많이 넣었다.');
  setClock(9, 27, '18:31');
  await room.compose('도착햇', { step: 140 });
  await room.caption('손이 떨렸다.');
  await room.compose('ㄴ니', { step: 180, append: true });
  await room.button('보내기', 'send');
  room.sendComposed();
  await kidEcho(room, 's19', { readDelay: 3400 });

  // 9월 28일
  setClock(9, 28, '03:05');
  room.date(9, 28);
  await room.caption('진통제가 듣지 않는 밤.');
  await dialAndCancel(room, '자는 애 깨우지 말자.');
  setClock(9, 28, '03:12');
  await momSays(room, '{F} 어릴때 메추리알만 골라먹던거 기억나니');
  await kidEcho(room, 's20', { readDelay: 4200 });
  await wait(1400);
  const scared = await momSays(room, '엄마가 좀 아프다\n무서워', { step: 130 });
  await wait(2000);
  await room.button('모두에게서 삭제', 'trash', 'danger');
  room.deleteMsg(scared);
  await wait(1600);
  await momSays(room, '아니다 자라');
  await wait(1400);

  // 10월 3일
  setClock(10, 3, '20:28');
  room.date(10, 3);
  await room.caption('얼굴이 많이 부었다. 카메라를 손으로 가렸다.');
  await room.button('영상통화 걸기', 'video');
  setClock(10, 3, '20:30');
  const ok1003 = await replayCall(room, S.calls.c1003, { video: true });
  if (!ok1003) {
    room.msg({ from: 'me', kind: 'call', call: { cancel: true, video: true } });
    await momSays(room, '바쁘구나', { tap: false, read: 2600 });
    await momSays(room, '담에보자', { tap: false });
  }
  await wait(1400);

  // 10월 15일
  setClock(10, 15, '14:10');
  room.date(10, 15);
  await room.caption('공책에 장조림 만드는 법을 적었다. 손이 떨려서 세 번 다시 썼다.');
  await memoCard(room, { label: labelAt(10, 15, 14, 10), lines: RECIPE_MEMO });
  setClock(10, 15, '16:20');
  await room.button('사진 보내기', 'photo');
  room.msg({ from: 'me', kind: 'photo', art: 'recipe', unread: true });
  await wait(1000);
  await momSays(room, '장조림 만드는법 적엇다');
  await momSays(room, '나중에 해먹어라');
  await kidEcho(room, 's22', { readDelay: 5000 });
  await replay(room, 's23');

  // 10월 25일
  setClock(10, 25, '21:30');
  room.date(10, 25);
  await wait(800);
  await memoCard(room, { label: labelAt(10, 25, 21, 30), lines: kindMemo() });

  // 10월 29일
  setClock(10, 29, '12:30');
  room.date(10, 29);
  await room.caption('약 때문인지 자꾸 깜빡한다.');
  await momSays(room, '밥먹었니');
  await wait(2400);
  await room.caption('보냈던가?');
  await momSays(room, '밥먹었니');
  await kidEcho(room, 's24', { readDelay: 2600, momLag: 7000 });
  await memoCard(room, { label: labelAt(10, 29, 13, 5), lines: FORGET_MEMO });

  // 10월 31일
  setClock(10, 31, '23:35');
  room.date(10, 31);
  await room.caption('오늘은 꼭 말하기로 했다.');
  setClock(10, 31, '23:36');
  await dialAndCancel(room, '목소리를 들으면 말을 못 할 것 같다.');
  setClock(10, 31, '23:38');
  await dialAndCancel(room, '');
  await room.caption('글로 쓰자. 천천히.');
  setClock(10, 31, '23:40');
  await room.compose('{C}', { step: 140 });
  await room.button('지우기', 'backspace');
  await room.erase();
  await wait(900);
  await room.compose('엄마가', { step: 140 });
  await room.button('지우기', 'backspace');
  await room.erase();
  await wait(1100);
  await room.compose('{C} 엄마가 할말이', { step: 150 });
  await wait(300);
  room.sendComposed();
  buzz();
  await room.caption('손가락이 미끄러졌다.');
  await wait(1200);
  room.markRead();
  await wait(1400);
  await room.caption('메모장을 열었다. 천천히 다 쓰고 보내자.');
  setClock(10, 31, '23:41');
  await letterScene();
}
