'use strict';

/* ================================================================
   공통 유틸: 시간, 탭으로 넘기기, 요소 만들기, 한글 처리, 게임 상태
   ================================================================ */

// ?speed=0.05 처럼 주면 모든 대기 시간이 그 배율로 줄어든다(점검용).
const QS = new URLSearchParams(location.search);
const SPEED = Math.min(4, Math.max(0.01, Number(QS.get('speed')) || 1));

const wait = ms => new Promise(r => setTimeout(r, ms * SPEED));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// 글을 읽는 데 필요한 시간(ms)
const readMs = text => clamp(900 + Array.from(String(text)).length * 70, 1500, 5600);

/* ---------- 탭으로 빨리 넘기기 ----------
   버튼이 아닌 곳을 탭하면 'tap' 이벤트가 퍼지고,
   진행 중인 타이핑은 끝까지 채워지고 대기는 바로 끝난다. */
const tapBus = new EventTarget();
const emitTap = () => tapBus.dispatchEvent(new Event('tap'));

function waitOrTap(ms) {
  return new Promise(res => {
    const done = () => {
      clearTimeout(timer);
      tapBus.removeEventListener('tap', done);
      res();
    };
    const timer = setTimeout(done, ms * SPEED);
    tapBus.addEventListener('tap', done);
  });
}

function watchSkip() {
  const w = { skipped: false };
  const on = () => { w.skipped = true; };
  tapBus.addEventListener('tap', on);
  w.stop = () => tapBus.removeEventListener('tap', on);
  return w;
}

/* ---------- 요소 만들기 ---------- */
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v; // 직접 만든 SVG 그림에만 쓴다
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const icon = (name, cls = '') => h('i', { class: `ti ti-${name}${cls ? ' ' + cls : ''}`, 'aria-hidden': 'true' });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// 버튼 한 번 누르기를 기다린다
const onceClick = el => new Promise(res => el.addEventListener('click', res, { once: true }));

// 여러 버튼 중 하나가 눌릴 때까지 기다려 그 값을 돌려준다
function pick(pairs) {
  return new Promise(res => {
    const offs = pairs.map(([el, val]) => {
      const f = () => { offs.forEach(off => off()); res(val); };
      el.addEventListener('click', f);
      return () => el.removeEventListener('click', f);
    });
  });
}

/* ---------- 한글 ---------- */
function hasBatchim(word) {
  const ch = Array.from(word).pop() || '';
  const code = ch.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

// 타이핑할 때 보이는 중간 모양: 도 → 돜 같은 자모 단계
const CHO = Array.from('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ');
function jamoSteps(ch) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return [ch];
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const steps = [CHO[cho], String.fromCharCode(0xac00 + cho * 588 + jung * 28)];
  if (code % 28) steps.push(ch);
  return steps;
}

/* ---------- 타이핑 효과 ---------- */
async function typeText(el, text, { cps = 12, jitter = 0.35 } = {}) {
  const w = watchSkip();
  let out = '';
  for (const c of Array.from(text)) {
    if (w.skipped) break;
    out += c;
    el.textContent = out;
    const pause = /[,.…?!]/.test(c) ? 4 : c === '\n' ? 5 : 1;
    await wait((1000 / cps) * (1 - jitter + Math.random() * jitter * 2) * pause);
  }
  el.textContent = text;
  w.stop();
}

// 엄마의 느린 손가락: 자모 단위로 천천히
async function typeJamo(el, text, { step = 100, jitter = 70, prefix = '' } = {}) {
  const w = watchSkip();
  let done = prefix;
  for (const ch of Array.from(text)) {
    if (w.skipped) break;
    for (const s of jamoSteps(ch)) {
      if (w.skipped) break;
      el.textContent = done + s;
      await wait(step + Math.random() * jitter);
    }
    done += ch;
    if (ch === ' ' || ch === '\n') await wait(step * 1.6);
  }
  el.textContent = prefix + text;
  w.stop();
}

async function eraseText(el, { step = 65 } = {}) {
  const t = Array.from(el.textContent);
  while (t.length) {
    t.pop();
    el.textContent = t.join('');
    await wait(step);
  }
}

/* ---------- 게임 상태 (메모리에만 있다) ---------- */
const S = {
  C: '딸아',          // 엄마가 나를 부르는 말
  F: '우리딸',        // 엄마가 나를 가리키는 말
  kindness: 0,        // 다정한 답 +1, 무시 -1
  picks: {},          // 장면 id → 고른 선택지 번호
  log: [],            // 모든 선택 기록
  memos: [],          // 엄마의 숨은 메모 { at, label, lines }
  calls: {},          // 통화 기록
  night: [],          // 10월 31일 밤에 내가 보낸 말
  last: [],           // 11월 5일 밤에 내가 보낸 말
  wallpaperLove: false,
};

function setCaller(kind, name) {
  if (kind === 'daughter') { S.C = '딸아'; S.F = '우리딸'; }
  else if (kind === 'son') { S.C = '아들아'; S.F = '우리아들'; }
  else {
    const b = hasBatchim(name);
    S.C = name + (b ? '아' : '야');
    S.F = '우리 ' + name + (b ? '이' : '');
  }
}
const P = s => String(s).replaceAll('{C}', S.C).replaceAll('{F}', S.F);

/* ---------- 이야기 속 시계 (2025년 12월 ~ 2026년 11월) ---------- */
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const yearOf = m => (m === 12 ? 2025 : 2026);
const CLOCK = { m: 12, d: 3, h: 19, mi: 12 };

function setClock(m, d, hm) {
  const [hh, mm] = hm.split(':').map(Number);
  Object.assign(CLOCK, { m, d, h: hh, mi: mm });
  renderStatus();
}
function tickClock(min = 1) {
  const t = CLOCK.h * 60 + CLOCK.mi + min;
  CLOCK.h = Math.floor(t / 60) % 24;
  CLOCK.mi = t % 60;
  renderStatus();
}
const pad2 = n => String(n).padStart(2, '0');
const ampm = (hh, mm) => `${hh < 12 ? '오전' : '오후'} ${hh % 12 || 12}:${pad2(mm)}`;
const nowLabel = () => ampm(CLOCK.h, CLOCK.mi);
const statusTime = () => `${CLOCK.h % 12 || 12}:${pad2(CLOCK.mi)}`;
const weekday = (m, d) => WEEK[new Date(yearOf(m), m - 1, d).getDay()];
const dateLong = (m, d) => `${yearOf(m)}년 ${m}월 ${d}일 ${weekday(m, d)}요일`;
const dateShort = (m, d) => `${m}월 ${d}일 ${weekday(m, d)}요일`;
const stamp = (m, d, hh, mm) => ((yearOf(m) * 13 + m) * 32 + d) * 1440 + hh * 60 + mm;
const labelAt = (m, d, hh, mm) => `${m}월 ${d}일 ${ampm(hh, mm)}`;
const fmtDur = s => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
const fmtDurKo = s => (s >= 60 ? `${Math.floor(s / 60)}분 ${pad2(s % 60)}초` : `${s}초`);

// 메시지 항목: 문자열이면 글, 객체면 사진·음성·삭제 등
const norm = it => (typeof it === 'string' ? { text: it } : it);
const previewOf = it => {
  const x = norm(it);
  return x.photo ? '사진' : x.voice ? '음성 메시지' : P(x.text);
};
