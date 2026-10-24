'use strict';

/* ================================================================
   화면 부품: 상태표시줄, 화면 전환, 대화방, 잠금화면, 통화, 카드
   ================================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const phone = $('#phone');
const screenEl = $('#screen');
const sbTime = $('#sb-time');
const sbPct = $('#sb-pct');
const sbBatt = $('#sb-batt');

function renderStatus() {
  sbTime.textContent = statusTime();
}

function setBattery(pct) {
  if (pct == null) {
    sbPct.textContent = '';
    sbBatt.className = 'ti ti-battery-4';
    phone.classList.remove('lowbatt');
    return;
  }
  sbPct.textContent = pct + '%';
  sbBatt.className = 'ti ti-battery-1';
  phone.classList.add('lowbatt');
}

// 진동: 화면이 살짝 떨리고, 되는 기기에서는 실제로 진동한다
function buzz(strong = false) {
  phone.classList.remove('buzz');
  void phone.offsetWidth;
  phone.classList.add('buzz');
  try { navigator.vibrate?.(strong ? [220, 90, 220] : 150); } catch { /* 지원하지 않는 기기 */ }
}

/* ---------- 화면 전환 (느리게 겹쳐 사라진다) ---------- */
let curView = null;
let zTop = 10;

async function show(view, ms = 900) {
  if (curView === view) return;
  if (!view.isConnected) screenEl.append(view);
  const prev = curView;
  curView = view;
  view.style.zIndex = ++zTop;
  view.style.setProperty('--fade', `${Math.round(ms * SPEED)}ms`);
  view.removeAttribute('aria-hidden');
  void view.offsetWidth;
  view.classList.add('on');
  phone.dataset.tone = view.dataset.tone || 'chat';
  await wait(ms);
  if (prev && prev !== curView) {
    prev.classList.remove('on');
    prev.setAttribute('aria-hidden', 'true');
    if (prev.dataset.temp) setTimeout(() => { if (prev !== curView) prev.remove(); }, 1500);
  }
}

/* ---------- 프로필 사진 (둥근 사각형 + 아이콘) ---------- */
const AV = {
  mom: { icon: 'flower', color: '#f7b8c8' },
  momKid: { icon: 'mood-kid', color: '#ffd978' },
  imo: { icon: 'plant-2', color: '#a8dab3' },
  dad: { icon: 'mountain', color: '#a9c0dc' },
  me: { icon: 'user', color: '#cbbcf2' },
  teacher: { icon: 'music', color: '#f5c08a' },
  member: { icon: 'leaf', color: '#bfe0a0' },
  group: { icon: 'microphone-2', color: '#f2a7a0' },
};

const avatar = (av, who = '') =>
  h('div', { class: 'av', style: `--avc:${av.color}`, dataset: { who } }, icon(av.icon));

/* ================================================================
   대화방
   me     : 오른쪽 노란 말풍선 쪽 (1부는 나, 3부와 2부 엄마 폰에서는 엄마)
   peers  : { key: { name, av } } 왼쪽 흰 말풍선 쪽
   ================================================================ */
class Room {
  constructor({ title, sub = '', peers, back = false }) {
    this.peers = peers;
    this.el = h('section', { class: 'view room', dataset: { tone: 'chat' }, 'aria-hidden': 'true' });
    this.titleEl = h('div', { class: 'rh-title', text: title });
    this.subEl = h('div', { class: 'rh-sub', text: sub });
    this.backBtn = back
      ? h('button', { class: 'rh-back', type: 'button', 'aria-label': '뒤로' }, icon('chevron-left'))
      : h('span', { class: 'rh-back' }, icon('chevron-left'));
    const head = h('header', { class: 'rh' },
      this.backBtn,
      h('div', { class: 'rh-names' }, this.titleEl, this.subEl),
      h('span', { class: 'rh-icons' }, icon('search'), icon('menu-2')));
    this.list = h('div', { class: 'msgs', role: 'log', 'aria-live': 'polite' });
    this.body = h('div', { class: 'rb' }, this.list);
    this.choicesEl = h('div', { class: 'choices' });
    this.inputText = h('span', { class: 'ib-text' });
    this.inputBar = h('div', { class: 'ib' },
      h('span', { class: 'ib-plus' }, icon('plus')),
      h('div', { class: 'ib-field' }, this.inputText, h('span', { class: 'ib-ph', text: '메시지 입력' })),
      h('span', { class: 'ib-send' }, icon('send')));
    this.foot = h('footer', { class: 'rf' }, this.choicesEl, this.inputBar);
    this.overlay = h('div', { class: 'room-over' });
    this.el.append(head, this.body, this.foot, this.overlay);
    this.lastDate = null;
    this.last = null;
    this.typingRow = null;
  }

  setSub(text) { this.subEl.textContent = P(text); }

  // 프로필 사진이 바뀌면 지난 말풍선의 사진도 같이 바뀐다
  setAvatar(who, av) {
    this.peers[who].av = av;
    this.list.querySelectorAll(`.av[data-who="${who}"]`).forEach(el => {
      el.style.setProperty('--avc', av.color);
      el.replaceChildren(icon(av.icon));
    });
  }

  scroll(again = true) {
    const go = () => this.body.scrollTo({ top: this.body.scrollHeight, behavior: SPEED < 1 ? 'auto' : 'smooth' });
    requestAnimationFrame(go);
    if (again) setTimeout(go, 650 * Math.max(SPEED, 0.2));
  }

  date(m, d) {
    const key = `${m}/${d}`;
    if (this.lastDate === key) return;
    this.lastDate = key;
    this.list.append(h('div', { class: 'datepill' }, h('span', { text: dateLong(m, d) })));
    this.scroll();
  }

  async caption(text, { hold = true } = {}) {
    this.list.append(h('div', { class: 'caption', text: P(text) }));
    this.scroll();
    if (hold) await waitOrTap(readMs(text) + 900);
  }

  system(text, ic = 'info-circle') {
    this.list.append(h('div', { class: 'sysline' }, icon(ic), h('span', { text: P(text) })));
    this.scroll();
  }

  typing(on) {
    if (on && !this.typingRow) {
      this.typingRow = h('div', { class: 'row peer cont typing-row' },
        h('div', { class: 'av sp' }),
        h('div', { class: 'col' }, h('div', { class: 'line' }, h('div', { class: 'bubble typing', 'aria-label': '입력 중' }, h('i'), h('i'), h('i')))));
      this.list.append(this.typingRow);
      this.scroll(false);
    } else if (!on && this.typingRow) {
      this.typingRow.remove();
      this.typingRow = null;
    }
  }

  bubbleFor(kind, x) {
    if (kind === 'photo') return h('div', { class: 'bubble photo', html: ART[x.art]() });
    if (kind === 'voice') return this.voiceBubble(x.voice);
    if (kind === 'deleted') return h('div', { class: 'bubble deleted' }, icon('info-circle'), h('span', { text: '삭제된 메시지입니다' }));
    if (kind === 'call') {
      const c = x.call;
      const what = c.video ? '영상통화' : '음성통화';
      const label = c.missed ? `부재중 ${what}` : c.cancel ? `${what} 취소` : `${what} ${fmtDur(c.secs || 0)}`;
      return h('div', { class: 'bubble callrec' }, h('span', { class: 'cr-ic' }, icon(c.video ? 'video' : 'phone')), h('span', { text: label }));
    }
    return h('div', { class: 'bubble', text: x.text });
  }

  msg({ from, kind = 'text', text = '', art, voice, call, time, unread = false }) {
    const mine = from === 'me';
    const tl = time || nowLabel();
    const prev = this.last;
    const cont = !!prev && prev.from === from && prev.time === tl && prev.row === this.list.lastElementChild;
    const bubble = this.bubbleFor(kind, { text, art, voice, call });
    const meta = h('div', { class: 'meta' });
    const unreadEl = unread ? h('span', { class: 'unread', text: '1' }) : null;
    if (unreadEl) meta.append(unreadEl);
    const timeEl = h('span', { class: 'time', text: tl });
    meta.append(timeEl);
    if (cont) prev.timeEl.remove();
    const row = h('div', { class: `row ${mine ? 'mine' : 'peer'}${cont ? ' cont' : ''}` });
    if (mine) {
      row.append(h('div', { class: 'line' }, meta, bubble));
    } else {
      const p = this.peers[from];
      row.append(
        cont ? h('div', { class: 'av sp' }) : avatar(p.av, from),
        h('div', { class: 'col' },
          cont ? null : h('div', { class: 'name', text: p.name }),
          h('div', { class: 'line' }, bubble, meta)));
    }
    this.list.append(row);
    this.last = { from, time: tl, row, timeEl };
    this.scroll();
    return { row, bubble, unreadEl };
  }

  // 삭제: 말풍선이 '삭제된 메시지입니다'로 바뀐다
  deleteMsg(m) {
    m.bubble.className = 'bubble deleted';
    m.bubble.replaceChildren(icon('info-circle'), h('span', { text: '삭제된 메시지입니다' }));
    m.unreadEl?.remove();
  }

  voiceBubble(v) {
    const bars = [];
    for (let i = 0; i < 24; i++) bars.push(h('i', { style: `--h:${(28 + Math.abs(Math.sin(i * 1.7)) * 62 + (i % 3) * 6).toFixed(0)}%` }));
    const playIc = h('span', { class: 'vp-ic' }, icon('player-play'));
    const durEl = h('span', { class: 'vdur', text: v.dur });
    const head = h('button', { class: 'vrow', type: 'button', 'aria-label': '음성 메시지 재생' }, playIc, h('span', { class: 'wave' }, bars), durEl);
    const textBox = h('div', { class: 'vtext' });
    const bub = h('div', { class: 'bubble voice' }, head, textBox);
    bub.played = new Promise(res => {
      head.addEventListener('click', async () => {
        if (bub.classList.contains('playing') || bub.classList.contains('done')) return;
        await playVoice(bub, v, { playIc, durEl, textBox, bars });
        res();
      });
    });
    return bub;
  }

  // 아래 패널의 알약 버튼으로만 답을 고른다
  choose(opts, { gate = null, hint = '' } = {}) {
    return new Promise(res => {
      let done = false;
      const render = all => {
        if (done) return;
        const btns = [];
        opts.forEach((o, i) => {
          if (o.gate && !all) return;
          btns.push(h('button', {
            class: `pill${o.act ? ' act' : ''}${o.key ? ' key' : ''}`,
            type: 'button',
            onclick: () => {
              if (done) return;
              done = true;
              this.hideChoices();
              res(i);
            },
          }, P(o.t)));
        });
        if (!all && hint) btns.unshift(h('div', { class: 'ch-hint', text: hint }));
        this.choicesEl.replaceChildren(...btns);
        this.choicesEl.classList.add('on');
        this.scroll();
      };
      render(!gate);
      gate?.then(() => render(true));
    });
  }

  // 버튼 하나(지우기, 보내기, 전화 걸기…)
  button(label, ic, cls = '') {
    return new Promise(res => {
      const b = h('button', {
        class: `pill solo ${cls}`.trim(),
        type: 'button',
        onclick: () => { this.hideChoices(); res(); },
      }, icon(ic), h('span', { text: label }));
      this.choicesEl.replaceChildren(b);
      this.choicesEl.classList.add('on');
      this.scroll();
    });
  }

  hideChoices() {
    this.choicesEl.classList.remove('on');
    this.choicesEl.querySelectorAll('button').forEach(b => { b.disabled = true; });
  }

  // 1부: 내가 고른 말은 빠르게 입력창에 찍혔다가 보내진다
  async send(text, { unread = true } = {}) {
    this.inputBar.classList.add('typing');
    await typeText(this.inputText, P(text), { cps: 34, jitter: 0.25 });
    await wait(260);
    this.inputText.textContent = '';
    this.inputBar.classList.remove('typing');
    return this.msg({ from: 'me', text: P(text), unread });
  }

  // 3부: 엄마의 작성창
  async compose(text, { step = 105, append = false } = {}) {
    this.inputBar.classList.add('typing');
    const prefix = append ? this.inputText.textContent : '';
    await typeJamo(this.inputText, P(text), { step, prefix });
  }

  async erase() {
    await eraseText(this.inputText, { step: 70 });
    this.inputBar.classList.remove('typing');
  }

  sendComposed({ unread = true } = {}) {
    const t = this.inputText.textContent;
    this.inputText.textContent = '';
    this.inputBar.classList.remove('typing');
    return this.msg({ from: 'me', text: t, unread });
  }

  peerNow(who, it) {
    const x = norm(it);
    if (x.photo) return this.msg({ from: who, kind: 'photo', art: x.photo });
    if (x.voice) return this.msg({ from: who, kind: 'voice', voice: x.voice });
    if (x.deleted) return this.msg({ from: who, kind: 'deleted' });
    return this.msg({ from: who, text: P(x.text) });
  }

  // 엄마는 느리게 친다: 글이 길수록 점 세 개가 오래 깜빡인다
  async peerType(who, it) {
    const x = norm(it);
    if (x.pause) await wait(x.pause);
    const len = x.text ? Array.from(P(x.text)).length : x.voice ? 16 : x.len || 6;
    const dur = clamp(1500 + len * 220, 1900, 8800) * (x.slow || 1);
    for (let k = 0; k < (x.hes || 0); k++) {
      this.typing(true);
      await wait(1700);
      this.typing(false);
      await wait(1500);
    }
    this.typing(true);
    await wait(dur);
    this.typing(false);
    return this.peerNow(who, x);
  }

  // 상대가 읽으면 내 메시지 옆의 1이 사라진다
  markRead({ slow = false } = {}) {
    const els = [...this.list.querySelectorAll('.unread:not(.gone)')];
    els.forEach((el, i) => {
      if (slow) {
        el.style.transitionDuration = `${2.2 * Math.max(SPEED, 0.05)}s`;
        el.style.transitionDelay = `${i * 0.9 * Math.max(SPEED, 0.05)}s`;
      }
      el.classList.add('gone');
    });
    return els.length;
  }
}

// 음성 메시지 재생: 파형이 차오르고 받아쓰기가 타이핑된다
async function playVoice(bub, v, { playIc, durEl, textBox, bars }) {
  bub.classList.add('playing');
  playIc.replaceChildren(icon('player-pause'));
  const total = Number(v.dur.split(':')[1]) + Number(v.dur.split(':')[0]) * 60;
  const lines = v.lines.map(P);
  const est = (lines.join('').length * 105 + lines.length * 520) * SPEED;
  const t0 = performance.now();
  const timer = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / est);
    durEl.textContent = `${Math.floor((p * total) / 60)}:${pad2(Math.round(p * total) % 60)}`;
    bars.forEach((b, i) => b.classList.toggle('lit', i / bars.length < p));
  }, 120);
  for (const line of lines) {
    const p = h('div');
    textBox.append(p);
    bub.closest('.rb, .ap-body')?.scrollBy?.({ top: 40 });
    await typeText(p, line, { cps: 9 });
    await wait(500);
  }
  clearInterval(timer);
  bars.forEach(b => b.classList.add('lit'));
  durEl.textContent = v.dur;
  playIc.replaceChildren(icon('player-play'));
  bub.classList.remove('playing');
  bub.classList.add('done');
}

/* ================================================================
   잠금화면: 내레이션 → 큰 시계 → 잠시 뒤 알림 카드가 진동과 함께
   ================================================================ */
async function lockScene({ narr = '', cards, hint = '알림을 눌러 확인하세요', wall = null, slot = null, cls = '', gapBefore = 1800 }) {
  const narrEl = h('p', { class: 'ls-narr' });
  const stack = h('div', { class: 'ls-stack' });
  const hintEl = h('div', { class: 'ls-hint', text: hint });
  const v = h('section', { class: `view lock ${cls}`.trim(), dataset: { tone: 'dark', temp: '1' } },
    wall || h('div', { class: 'ls-wall' }),
    h('div', { class: 'ls-shade' }),
    narrEl,
    h('div', { class: 'ls-top' },
      h('div', { class: 'ls-lock' }, icon('lock')),
      h('div', { class: 'ls-clock', text: statusTime() }),
      h('div', { class: 'ls-date', text: dateShort(CLOCK.m, CLOCK.d) })),
    slot,
    stack,
    hintEl);
  await show(v, 1000);
  if (narr) {
    await typeText(narrEl, P(narr), { cps: 15 });
    await waitOrTap(readMs(narr));
  }
  await wait(gapBefore);
  let resolve;
  const tapped = new Promise(r => { resolve = r; });
  for (const c of cards) {
    const card = h('button', { class: 'notif', type: 'button', onclick: () => resolve(c) },
      h('div', { class: 'n-head' },
        h('span', { class: 'n-app' }, icon(c.icon || 'message-circle')),
        h('b', { text: P(c.title) }),
        h('span', { class: 'n-when', text: ` · ${c.when || '지금'}` }),
        c.tag ? h('span', { class: 'n-tag', text: c.tag }) : null),
      h('div', { class: 'n-text', text: P(c.text) }));
    stack.prepend(card);
    if (!c.quiet) buzz();
    await wait(c.gap ?? 1100);
  }
  hintEl.classList.add('on');
  await tapped;
  return v;
}

/* ================================================================
   통화 화면 (항상 어두운 전체 화면)
   자막: 상대(them)는 크고 흰 글씨, 나(me)는 작고 회색 오른쪽
   ================================================================ */
class Call {
  constructor({ name, av, sub = '휴대전화', video = false, remote = 'person', self = 'person' }) {
    this.sub = sub;
    this.el = h('section', { class: `view call${video ? ' video' : ''}`, dataset: { tone: 'dark', temp: '1' } });
    if (video) {
      const face = kind => (kind === 'covered'
        ? h('div', { class: 'cam covered' }, icon('hand-stop'))
        : h('div', { class: 'cam person' }, icon('user')));
      this.remote = h('div', { class: 'remote' }, face(remote));
      this.selfCam = h('div', { class: 'selfcam' }, face(self));
      this.el.append(this.remote, this.selfCam);
    }
    this.status = h('div', { class: 'c-status', text: sub });
    this.avWrap = h('div', { class: 'c-av' }, h('i', { class: 'c-ring' }), h('i', { class: 'c-ring r2' }), avatar(av, 'call'));
    this.subs = h('div', { class: 'c-subs', 'aria-live': 'polite' });
    this.note = h('p', { class: 'c-note' });
    this.choicesEl = h('div', { class: 'c-choices' });
    this.btns = h('div', { class: 'c-btns' });
    this.el.append(
      h('div', { class: 'c-top' }, h('div', { class: 'c-name', text: P(name) }), this.status),
      this.avWrap, this.note, this.subs, this.choicesEl, this.btns);
    this.iv = null;
    this.t0 = 0;
  }

  btn(kind) {
    const isEnd = kind !== 'accept';
    return h('button', { class: `c-btn ${isEnd ? 'red' : 'green'}`, type: 'button', 'aria-label': kind === 'accept' ? '받기' : kind === 'decline' ? '거절' : '종료' },
      h('span', { class: 'c-circle' }, icon(isEnd ? 'phone-off' : 'phone')),
      h('span', { class: 'c-lbl', text: kind === 'accept' ? '받기' : kind === 'decline' ? '거절' : '종료' }));
  }

  // 걸려 오는 전화. 'accept' 또는 'decline'
  ring({ acceptOnly = false, quake = false } = {}) {
    this.status.textContent = this.sub;
    this.el.classList.add('ringing');
    if (quake) phone.classList.add('quake');
    const acc = this.btn('accept');
    const dec = acceptOnly ? null : this.btn('decline');
    this.btns.replaceChildren(...[dec, acc].filter(Boolean));
    const iv = setInterval(() => buzz(true), 1700 * Math.max(SPEED, 0.2));
    buzz(true);
    const pairs = [[acc, 'accept']];
    if (dec) pairs.push([dec, 'decline']);
    return pick(pairs).then(r => {
      clearInterval(iv);
      phone.classList.remove('quake');
      this.el.classList.remove('ringing');
      this.btns.replaceChildren();
      return r;
    });
  }

  // 내가 거는 전화. endable이 아니면 끊기 버튼은 흐리게만 보인다
  dial({ endable = false } = {}) {
    this.status.textContent = '연결 중…';
    this.el.classList.add('ringing');
    this.endBtn = this.btn('end');
    if (!endable) {
      this.endBtn.disabled = true;
      this.endBtn.classList.add('dim');
    }
    this.hungUp = onceClick(this.endBtn);
    this.btns.replaceChildren(this.endBtn);
  }

  // 빨간 버튼이 눌릴 때까지 (3부에서 엄마가 스스로 끊는다)
  async hangup(label = '발신 취소') {
    await this.hungUp;
    this.el.classList.remove('ringing');
    this.btns.replaceChildren();
    this.status.textContent = label;
    await wait(1300);
  }

  connect() {
    this.el.classList.remove('ringing');
    this.el.classList.add('live');
    this.t0 = performance.now();
    const tick = () => { this.status.textContent = fmtDur(this.secs()); };
    tick();
    this.iv = setInterval(tick, 250);
    this.btns.replaceChildren(h('button', { class: 'c-btn red dim', type: 'button', disabled: true, 'aria-label': '통화 중' }, h('span', { class: 'c-circle' }, icon('phone-off'))));
  }

  secs() { return Math.floor((performance.now() - this.t0) / (1000 * SPEED)); }

  async say(who, text) {
    const line = h('p', { class: `sub ${who}` });
    [...this.subs.children].forEach(el => el.classList.add('old'));
    this.subs.append(line);
    while (this.subs.children.length > 3) this.subs.firstElementChild.remove();
    if (who === 'them') await typeText(line, P(text), { cps: 13 });
    else line.textContent = P(text);
    await waitOrTap(readMs(text) + (who === 'them' ? 300 : 0));
  }

  async showNote(text) {
    this.note.textContent = '';
    this.note.classList.add('on');
    await typeText(this.note, P(text), { cps: 13 });
    await waitOrTap(readMs(text));
  }

  choose(opts) {
    return new Promise(res => {
      const btns = opts.map((t, i) => h('button', {
        class: 'pill dark',
        type: 'button',
        onclick: () => {
          this.choicesEl.replaceChildren();
          res(i);
        },
      }, P(t)));
      this.choicesEl.replaceChildren(...btns);
    });
  }

  async end(label = '통화 종료') {
    clearInterval(this.iv);
    const s = this.secs();
    this.el.classList.remove('live', 'ringing');
    this.btns.replaceChildren();
    this.status.textContent = `${label} · ${fmtDur(s)}`;
    await wait(1500);
    return s;
  }

  async fail(label = '연결되지 않았습니다') {
    clearInterval(this.iv);
    this.el.classList.remove('ringing', 'live');
    this.btns.replaceChildren();
    this.status.textContent = label;
    await wait(1700);
  }

  // 거절하면 잠깐 끊겼다가 다시 울린다
  async refused() {
    this.status.textContent = '통화 거절';
    await wait(2000);
    this.status.textContent = this.sub;
  }
}

/* ================================================================
   장 제목 카드, 검은(흰) 화면 내레이션, 짧은 알림
   ================================================================ */
async function titleCard({ part = '', label, title, quote }) {
  const v = h('section', { class: 'view card', dataset: { tone: 'card', temp: '1' } },
    h('div', { class: 'card-in' },
      part ? h('div', { class: 'card-part', text: part }) : null,
      h('div', { class: 'card-label', text: label }),
      h('h2', { class: 'card-title', text: title }),
      h('p', { class: 'card-quote', text: P(quote) })));
  await show(v, 1400);
  await waitOrTap(5400);
}

async function narration(lines, { theme = 'black', gap = 900, end = 2400, show: showMs = 1200 } = {}) {
  const v = h('section', { class: `view narr ${theme}`, dataset: { tone: theme === 'white' ? 'light' : 'dark', temp: '1' } });
  const box = h('div', { class: 'narr-box' });
  v.append(box);
  await show(v, showMs);
  await wait(500);
  for (const line of lines) {
    if (line === '') {
      box.append(h('div', { class: 'narr-gap' }));
      continue;
    }
    const p = h('p');
    box.append(p);
    await typeText(p, P(line), { cps: 11 });
    await waitOrTap(gap + Array.from(line).length * 55);
  }
  await waitOrTap(end);
  return v;
}

function toast(parent, text, ms = 3600) {
  parent.querySelector('.toast')?.remove();
  const t = h('div', { class: 'toast', role: 'status', text: P(text) });
  parent.append(t);
  setTimeout(() => t.classList.add('out'), ms * SPEED);
  setTimeout(() => t.remove(), (ms + 900) * SPEED);
}
