'use strict';

/* ================================================================
   1부 · 나의 1년
   장면 형식: 날짜·시간, 잠금화면(ls) 여부, 내레이션(cap),
   엄마의 말(mom), 선택지(opts: 내 답 t → 엄마 답 r, 숨은 메모 m, 다정함 k)
   ================================================================ */

const R = {}; // 대화방들

function createRooms() {
  R.mom = new Room({ title: '엄마', peers: { mom: { name: '엄마', av: AV.mom } } });
  R.imo = new Room({ title: '이모', peers: { imo: { name: '이모', av: AV.imo } } });
  R.dad = new Room({ title: '아빠', peers: { dad: { name: '아빠', av: AV.dad } } });
}

const IGNORE = '(읽고 답장 안 하기)';

const SCENES = [
  { card: { part: '나의 1년', label: '1부 · 1장', title: '겨울', quote: '추운데옷입어' } },
  {
    id: 's1', m: 12, d: 3, t: '19:12', ls: true, read: 600,
    cap: '퇴근길 지하철. 사람들 틈에 끼어 서 있다.',
    mom: ['추운데옷입어'],
    opts: [
      { t: 'ㅇㅇ', k: 0, m: ['ㅇㅇ', '이것도 답장이다', '바쁜데 답해줬네'] },
      { t: IGNORE, act: true, k: -1, m: ['1이 없어졌다', '읽었으면 됐다'] },
      { t: '응 엄마도 감기 조심해', k: 1, r: ['그래'], m: ['엄마도 감기조심하래', '캡쳐해둠'] },
    ],
  },
  {
    id: 's2', m: 12, d: 3, t: '19:31', read: 600, buzz: true,
    cap: '역에서 내리는데 또 진동이 울린다.',
    mom: ['근데 이모티콘은 어떻게 보내니', '이모는 웃는거 막 보내던데'],
    opts: [
      { t: '키보드에 웃는 얼굴 버튼 눌러봐', k: 1, r: [{ text: '찾앗다', slow: 1.8 }, '^^'], m: ['{F}한테 제일 먼저 보냄'] },
      { t: '주말에 가서 알려줄게', k: 1, r: ['그래 기다릴께'], m: ['이모티콘 핑계로', '얼굴 보겠다'] },
      { t: '몰라 이모한테 물어봐', k: -1, r: ['그래'], m: ['{F}한테 ^^ 보내볼까 하다가', '안보냄'] },
    ],
  },
  {
    id: 's3', m: 12, d: 31, t: '23:58', ls: true, read: 600,
    cap: '친구들이랑 카운트다운을 기다리는 중.',
    mom: ['새해복많이받아'],
    opts: [
      { t: '엄마 아직 2분 남았어ㅋㅋ', k: 1, r: ['엄마가 일등할라고'], m: ['작년엔 이모가 일등함'] },
      { t: '엄마도 새해 복 많이 받아', k: 1, r: ['^^'] },
      { t: 'ㅇㅇ', k: 0, m: ['올해 첫 ㅇㅇ', '그래도 좋다'] },
    ],
  },
  {
    id: 's4', m: 1, d: 5, t: '15:22', ls: true, read: 600, pre: 2, preview: '음성 메시지',
    cap: '카페에서 친구를 기다리는 중.',
    mom: ['이모가 녹음하는거 알려줫다', { voice: { dur: '0:09', lines: ['아 아 이거 되나', '{C} 엄마다', '아이고 모르겠다', '밥 잘 챙겨먹어라', '끊는다'] } }],
    hint: '음성 메시지를 눌러 들어 보세요',
    opts: [
      { t: 'ㅋㅋㅋ 엄마 목소리 좋다', gate: true, k: 1, r: ['^^'], m: ['세번 녹음한거', '말 안했다'] },
      { t: '엄마 그냥 전화해ㅋㅋ', gate: true, k: 0, r: ['전화하면 바쁠까봐'] },
      { t: '(나중에 들어야지)', act: true, k: -1, m: ['다음엔 글씨로 보내야지'] },
    ],
  },
  {
    id: 's5', m: 1, d: 18, t: '14:05', ls: true, read: 600, pre: 1,
    cap: '늦잠 자고 일어난 주말 오후.',
    mom: [{ photo: 'snow' }, '눈왓다 우리동네'],
    opts: [
      { t: '우와 예쁘다', k: 1, r: ['^^'] },
      { t: '엄마 미끄러우니까 나가지 마', k: 1, r: ['알앗다 걱정마라'], m: ['엄마 걱정도 하고', '다 컸다'] },
      { t: 'ㅇㅇ', k: 0, m: ['눈사람도 만들었는데', '그건 안보냄'] },
    ],
  },

  { card: { label: '1부 · 2장', title: '봄', quote: '밥먹어' } },
  {
    id: 's6', m: 3, d: 14, t: '22:03', ls: true, read: 1500,
    cap: '밤 10시. 사무실엔 나 혼자 남았다.',
    mom: ['밥먹어'],
    opts: [
      { t: '먹었어', k: 0, r: ['그래'], m: ['안먹은것 같은데', '그냥 믿어주자'] },
      { t: 'ㅇㅇ', k: 0, m: ['밤10시에 ㅇㅇ', '아직 회사구나'] },
      { t: '아직… 엄마 김치찌개 먹고 싶다', k: 1, r: ['알앗다', '김치 택배로 보내줄께'] },
    ],
  },
  {
    id: 's7', m: 3, d: 18, t: '20:20', read: 1500,
    sys: '택배 도착 · 보낸 사람 엄마',
    cap: '퇴근하고 오니 문 앞에 상자가 있다.',
    mom: ['김치받앗니', '냉장고 안쪽에 넣어라'],
    opts: [
      { t: '받았어! 엄마 최고', k: 1, r: ['^^'] },
      { t: 'ㅇㅇ 받음', k: 0, r: ['그래'] },
      { t: '엄마 무거운데 왜 보냈어', k: 1, r: ['안무겁다'], m: ['사실 좀 무거웠다', '요즘 팔에 힘이 없다'] },
    ],
  },
  {
    id: 's8', m: 4, d: 5, t: '13:30', ls: true, read: 1500, pre: 1,
    cap: '밀린 빨래를 돌리는 주말.',
    mom: [{ photo: 'cherry' }, '아빠랑 벚꽃보러왓다', '너도 왓으면 좋앗을텐데'],
    opts: [
      { t: '다음엔 같이 가자', k: 1, r: ['그래 내년에 꼭'], m: ['내년 벚꽃', '기다린다'] },
      { t: '와 예쁘다 사진 더 보내줘', k: 1, r: ['아빠가 백장 찍엇다'] },
      { t: 'ㅇㅇ 좋겠다', k: 0, r: ['그래'] },
    ],
  },
  {
    id: 's9', m: 5, d: 8, t: '11:20', read: 1500,
    cap: '회의가 세 개 연달아 잡힌 날.',
    mom: [{ text: '이번주말에오니', hes: 1 }, '멸치볶음 해놧다'],
    opts: [
      { t: '이번 주는 바빠ㅠ 다음에 갈게', k: 0, r: ['그래 바쁘면 담에와'], m: ['오늘 어버이날인데', '바쁜가보다', '괜찮다'] },
      { t: 'ㅇㅇ 갈게', k: 0, r: ['그래'], m: ['온대!!!'] },
      { t: '엄마 어버이날 축하해 주말에 갈게 사랑해', k: 1, r: [{ text: '고맙다', slow: 1.6 }], m: ['캡쳐해서', '폰 배경화면으로 해둠'], wall: true },
    ],
  },
  {
    id: 's10', m: 5, d: 20, t: '07:10', ls: true, read: 1500,
    cap: '출근 준비로 정신없는 아침.',
    mom: ['엄마 건강검진 받으러간다', '별거아니다 나이들면 다하는거'],
    opts: [
      { t: '결과 나오면 알려줘', k: 0, r: ['그래'] },
      { t: '같이 가줄까? 반차 쓸게', k: 1, r: ['됏다 일해라', '마음만 받는다'], m: ['그말만으로 됐다'] },
      { t: 'ㅇㅇ 잘 다녀와', k: 0, r: ['^^'] },
    ],
  },
  {
    id: 's11', m: 6, d: 2, t: '19:45', room: 'imo', from: 'imo', read: 2000,
    cap: '이모한테 문자가 왔다.',
    mom: ['이모다', '너희 엄마 요새 살이 쏙 빠졌더라', '다이어트 하나 한번 물어봐라'],
    opts: [
      { t: '엄마가 다이어트를?', k: 0, r: ['그러게 말이다', '전화 한번 드려라'] },
      { t: '알겠어 이모, 전화해볼게', k: 1, r: ['그래 착하다'] },
      { t: 'ㅇㅇ', k: 0, r: ['그래'] },
    ],
  },

  { card: { label: '1부 · 3장', title: '여름', quote: '별일아니다' }, before: () => R.mom.setSub('건강이 최고') },
  {
    id: 's12', m: 6, d: 26, t: '12:40', ls: true, read: 3000, pre: 1,
    cap: '점심을 먹다가 폰을 봤다.',
    mom: ['오늘 엄마 생일이다', { photo: 'soup' }, '아빠가 미역국 끓여줫다^^'],
    opts: [
      { t: '헉 엄마 생일 축하해!! 깜빡했어 미안해ㅠ', k: 1, r: ['괜찮다'] },
      { t: '엄마 생일 축하해 선물 보낼게', k: 1, r: ['선물은 무슨'], m: ['선물보다', '목소리가 듣고싶다'] },
      { t: 'ㅊㅋㅊㅋ', k: 0, r: ['^^'], m: ['이모한테', '무슨 뜻이냐 물어봤다'] },
    ],
  },
  {
    id: 's13', m: 7, d: 2, t: '21:40', ls: true, read: 3000,
    cap: '퇴근하고 소파에 누워 있다.',
    mom: ['요즘 잘자니'],
    opts: [
      { t: '응 잘 자. 엄마는?', k: 1, r: ['엄마는 요즘 잠이 안온다', { text: '아니다 너는 푹자라', hes: 1 }] },
      { t: '갑자기?ㅋㅋ', k: 0, r: ['그냥'], m: ['요즘 밤이 길다'] },
      { t: IGNORE, act: true, k: -1 },
    ],
  },
  {
    id: 's14', m: 7, d: 20, t: '17:15', ls: true, read: 3000,
    cap: '외근을 마치고 회사로 돌아가는 버스 안.',
    mom: ['엄마 폰 글씨 크게하는거 어떻게하니', '요즘 눈이 침침하다'],
    opts: [
      { t: '설정에서 글자 크기 키우면 돼', k: 0, r: ['찾앗다'] },
      { t: '주말에 가서 해줄게', k: 1, r: ['그래 기다릴께'] },
      { t: '엄마 눈 괜찮아? 안과 가봐', k: 1, r: ['괜찮다 나이들어 그렇다'], m: ['안과 말고', '다른 병원은 다니고 있다'] },
    ],
  },
  {
    id: 's15', m: 8, d: 10, t: '21:02', room: 'dad', from: 'dad', read: 3000,
    cap: '아빠한테 문자가 왔다. 처음 있는 일이다.',
    mom: ['아빠다', '엄마 요즘 기운이 없다', '시간되면 한번 내려와라'],
    opts: [
      { t: '무슨 일 있어?', k: 0, r: ['아니다 그냥'] },
      { t: '추석에 갈게', k: 0, r: ['그래'] },
      { t: '엄마한테 전화해볼게', k: 1, r: ['엄마한테는 아빠가 말했단 말 하지마라'] },
    ],
  },
  {
    id: 's16', m: 8, d: 21, t: '14:47', ls: true, read: 3000, pre: 2,
    cap: '회의 중이었다. 폰이 두 번 진동했다.',
    lsBefore: [{ title: '엄마', text: '부재중 전화 2통', icon: 'phone-x', when: '오후 2:41' }],
    mom: ['바쁘니', '괜찮다 별일아니다'],
    opts: [
      { t: '(바로 전화 걸기)', act: true, k: 1, run: callMomBack },
      { t: '이따 전화할게', k: 0, r: ['그래'], cap2: '…그리고 잊어버렸다.' },
      { t: IGNORE, act: true, k: -1 },
    ],
    tail: async room => {
      await wait(2600);
      setClock(8, 21, '15:30');
      await wait(1200);
      await room.peerType('mom', { deleted: true, len: 34, hes: 1 });
    },
  },
  { run: momCall0830 },
  {
    id: 's18', m: 9, d: 10, t: '18:02', ls: true, read: 3000,
    cap: '회사 앞 편의점에서 삼각김밥을 고르는 중.',
    before: () => { R.mom.setAvatar('mom', AV.momKid); R.mom.setSub('{F} 화이팅'); },
    mom: ['엄마 프사 바꿧다', '니 어릴때 사진이다'],
    opts: [
      { t: '엄마 이거 언제 적 사진이야ㅋㅋ', k: 1, r: ['일곱살때', '이때 제일 이뻣다'] },
      { t: 'ㅋㅋㅋ 귀엽네', k: 0, r: ['^^'] },
      { t: '엄마 그거 좀 바꿔ㅠ 창피해', k: 0, r: ['싫다'] },
    ],
  },

  { card: { label: '1부 · 4장', title: '가을', quote: '도착햇니' } },
  {
    id: 's19', m: 9, d: 27, t: '18:31', ls: true, read: 6000,
    cap: '추석 연휴 마지막 날, 서울 가는 기차. 무릎 위에 엄마가 싸준 반찬통이 있다.',
    mom: ['도착햇ㄴ니'],
    opts: [
      { t: 'ㅇㅇ', k: 0, r: ['그래 쉬어'], m: ['이번에 {F} 얼굴', '실컷 봤다', '이걸로 됐다'] },
      { t: '응 도착! 반찬 잘 먹을게', k: 1, r: ['남기지말고'], m: ['장조림 만드는법 적어놔야겠다', '엄마없어도 해먹게'] },
      { t: '응 근데 엄마 요즘 왜 이렇게 말랐어?', k: 1, r: ['다이어트한다'], m: ['눈치 빨라서 큰일이다'] },
    ],
  },
  {
    id: 's20', m: 9, d: 28, t: '03:12', ls: true, read: 6000,
    cap: '새벽에 진동이 울렸다.',
    mom: ['{F} 어릴때 메추리알만 골라먹던거 기억나니'],
    opts: [
      { t: '엄마 왜 안 자?', k: 1 },
      { t: 'ㅋㅋ 기억나', k: 1 },
      { t: '(내일 답하기로 하고 다시 잔다)', act: true, k: -1, cap2: '다시 잠이 들었다.' },
    ],
    tail: async room => {
      await wait(2800);
      await room.peerType('mom', { deleted: true, len: 30, hes: 2 });
      await wait(1800);
      await room.peerType('mom', '아니다 자라');
    },
  },
  { run: momVideo1003 },
  {
    id: 's22', m: 10, d: 15, t: '16:20', ls: true, read: 6000, pre: 1,
    cap: '회의 들어가기 5분 전.',
    mom: [{ photo: 'recipe' }, '장조림 만드는법 적엇다', '나중에 해먹어라'],
    opts: [
      { t: '엄마가 해주면 되지 왜ㅋㅋ', k: 0, r: ['그냥', '알아두면 좋다'] },
      { t: 'ㅇㅇ 저장해둘게', k: 0, r: ['그래'] },
      { t: '엄마 왜 그래 무섭게', k: 1, r: ['무섭긴', '엄마 아무데도 안간다'], m: ['제일 큰 거짓말이다'] },
    ],
  },
  {
    id: 's23', m: 10, d: 22, t: '21:10', ls: true, read: 6000,
    cap: '씻고 나와서 머리를 말리는 중.',
    mom: ['니 어릴때 엄마한테 편지 써준거', '아직 가지고 있다'],
    opts: [
      { t: '그걸 아직 갖고 있어?ㅋㅋ', k: 1, r: ['서랍에 다 있다'], m: ['엄마 편지는', '엄마가 써야겠다'] },
      { t: '뭐라고 썼는데?', k: 1, r: ['엄마 사랑해요 커서 효도할께요'] },
      { t: 'ㅇㅇ', k: 0 },
    ],
  },
  {
    id: 's24', m: 10, d: 29, t: '12:30', read: 11000,
    cap: '점심시간.',
    mom: ['밥먹어', { text: '밥먹어', pause: 2600 }],
    opts: [
      { t: '엄마 두 번 보냈어ㅋㅋ', k: 0, r: ['그랫나'] },
      { t: 'ㅇㅇ', k: 0 },
      { t: '엄마 괜찮아? 요즘 좀 이상해', k: 1, r: ['괜찮다 걱정마'] },
    ],
  },
  { run: lastNight1031 },
  { run: climax },
];

const SC = Object.fromEntries(SCENES.filter(s => s.id).map(s => [s.id, s]));

// 숨은 메모의 시각: 장면 시각 + 2분
function memoAt(sc, plus = 2) {
  const [hh, mm] = sc.t.split(':').map(Number);
  const t = hh * 60 + mm + plus;
  const H = Math.floor(t / 60);
  const M = t % 60;
  return { at: stamp(sc.m, sc.d, H, M), label: labelAt(sc.m, sc.d, H, M) };
}

function record(id, i, o, sc) {
  S.picks[id] = i;
  S.kindness += o.k || 0;
  S.log.push({ id, t: o.t });
  if (o.wall) S.wallpaperLove = true;
  if (o.m && sc) S.memos.push({ id, ...memoAt(sc), lines: o.m });
}

async function playScene(sc) {
  setClock(sc.m, sc.d, sc.t);
  const room = R[sc.room || 'mom'];
  const who = sc.from || 'mom';
  let gate = null;
  const add = r => { if (r.bubble.played) gate = r.bubble.played; };

  if (sc.ls) {
    const pre = sc.pre ?? 1;
    const cards = [...(sc.lsBefore || []), { title: room.peers[who].name, text: sc.preview || previewOf(sc.mom[pre - 1]) }];
    await lockScene({ narr: sc.cap, cards });
    // 대화방이 잠금화면 뒤로 완전히 가려진 뒤에 바꿔야 전환 중에 미리 보이지 않는다
    sc.before?.();
    room.date(sc.m, sc.d);
    sc.mom.slice(0, pre).forEach(it => add(room.peerNow(who, it)));
    await show(room.el, 800);
    await wait(700);
    for (const it of sc.mom.slice(pre)) add(await room.peerType(who, it));
  } else {
    sc.before?.();
    if (curView !== room.el) await show(room.el, 1000);
    room.date(sc.m, sc.d);
    if (sc.sys) room.system(sc.sys, 'package');
    if (sc.cap) await room.caption(sc.cap);
    if (sc.buzz) buzz();
    for (const it of sc.mom) add(await room.peerType(who, it));
  }

  await wait(500);
  const i = await room.choose(sc.opts, { gate, hint: sc.hint });
  const o = sc.opts[i];
  record(sc.id, i, o, sc);

  if (o.run) {
    await o.run(room);
  } else if (o.act) {
    await room.caption('읽고, 답장하지 않았다.');
  } else {
    await room.send(o.t);
    await wait(sc.read);
    room.markRead();
    await wait(900);
    for (const r of o.r || []) await room.peerType(who, r);
  }
  if (o.cap2) {
    await wait(900);
    await room.caption(o.cap2);
  }
  if (sc.tail) await sc.tail(room);
}

/* ---------- 8월 21일: 바로 전화 걸기 ---------- */
async function callMomBack(room) {
  setClock(8, 21, '14:48');
  const call = new Call({ name: '엄마', av: room.peers.mom.av, sub: '휴대전화' });
  await show(call.el, 800);
  call.dial();
  await wait(2800);
  call.connect();
  const lines = [];
  const say = async (who, t) => { lines.push({ who, t }); await call.say(who === 'mom' ? 'them' : 'me', t); };
  await call.choose(['엄마, 전화했었어?']);
  await say('kid', '엄마, 전화했었어?');
  await say('mom', '아이고 바쁜데 왜 전화했어');
  await say('mom', '별일아니다 그냥 목소리 들을라고');
  await call.choose(['진짜 별일 없는 거지?']);
  await say('kid', '진짜 별일 없는 거지?');
  await say('mom', '일해라 끊는다');
  const secs = await call.end();
  S.calls.c0821 = { answered: true, lines, secs };
  await show(room.el, 900);
  room.msg({ from: 'me', kind: 'call', call: { secs } });
  await wait(600);
  await room.caption('별일 아니라고 했다.');
}

/* ---------- 8월 30일: 엄마의 전화 ---------- */
async function momCall0830() {
  setClock(8, 30, '20:15');
  const room = R.mom;
  const call = new Call({ name: '엄마', av: room.peers.mom.av, sub: '휴대전화' });
  await show(call.el, 1100);
  const a = await call.ring();
  if (a === 'decline') {
    record('s17', 'decline', { t: '(전화 거절)', k: -1 });
    S.calls.c0830 = { answered: false };
    await call.fail('통화 거절');
    await show(room.el, 900);
    room.date(8, 30);
    room.msg({ from: 'mom', kind: 'call', call: { missed: true } });
    await wait(1200);
    await room.peerType('mom', '바쁘구나');
    await room.peerType('mom', '담에하자');
    await wait(1800);
    return;
  }
  call.connect();
  const lines = [];
  const say = async (who, t) => { lines.push({ who, t }); await call.say(who === 'mom' ? 'them' : 'me', t); };
  const ask = async (opts, ks) => {
    const i = await call.choose(opts);
    S.kindness += ks[i];
    S.log.push({ id: 's17', t: opts[i] });
    await say('kid', opts[i]);
    return i;
  };
  let ended = false;
  await wait(800);
  await say('mom', '밥은 먹었니');
  const i1 = await ask(['응 먹었어', '아직. 엄마는?'], [0, 1]);
  if (i1 === 1) await say('mom', '엄마는 먹었다');
  await say('mom', '엄마 목소리 좀 이상하지');
  await say('mom', '감기다');
  const i2 = await ask(['병원은 가봤어?', '엄마 목소리 왜 그래? 진짜 괜찮아?', '나 지금 좀 바빠서 이따 다시 할게'], [1, 1, -1]);
  if (i2 === 0) await say('mom', '갓다왓다 괜찮다');
  if (i2 === 1) {
    await say('mom', '괜찮다 감기라니까');
    await say('mom', '니 목소리 들으니까 다 나았다');
  }
  if (i2 === 2) {
    await say('mom', '그래 일해라');
    ended = true;
  }
  if (!ended) {
    await say('mom', '추석에 오니');
    const i3 = await ask(['응 꼭 갈게', '일 좀 봐서…'], [1, 0]);
    await say('mom', i3 === 0 ? '장조림 해놓을께' : '그래 바쁘면 안와도 된다');
    await say('mom', '끊는다');
  }
  S.picks.s17 = 'answer';
  const secs = await call.end();
  S.calls.c0830 = { answered: true, lines, secs };
  await show(room.el, 900);
  room.date(8, 30);
  room.msg({ from: 'mom', kind: 'call', call: { secs } });
  await wait(1800);
}

/* ---------- 10월 3일: 엄마의 영상통화 ---------- */
async function momVideo1003() {
  setClock(10, 3, '20:30');
  const room = R.mom;
  const call = new Call({ name: '엄마', av: room.peers.mom.av, sub: '영상통화', video: true, remote: 'covered', self: 'person' });
  await show(call.el, 1100);
  const a = await call.ring();
  if (a === 'decline') {
    record('s21', 'decline', { t: '(영상통화 거절)', k: -1 });
    S.calls.c1003 = { answered: false };
    await call.fail('통화 거절');
    await show(room.el, 900);
    room.date(10, 3);
    room.msg({ from: 'mom', kind: 'call', call: { missed: true, video: true } });
    await wait(1200);
    await room.peerType('mom', '바쁘구나');
    await room.peerType('mom', '담에보자');
    await wait(1800);
    return;
  }
  call.connect();
  const lines = [];
  const say = async (who, t) => { lines.push({ who, t }); await call.say(who === 'mom' ? 'them' : 'me', t); };
  await wait(900);
  await say('mom', '엄마 얼굴 보지마라');
  await say('mom', '자고 일어나서 부었다');
  const opts = ['엄마 얼굴 보여줘', '괜찮아. 목소리만 들어도 돼', '엄마 어디 아파?'];
  const i = await call.choose(opts);
  S.kindness += [0, 1, 1][i];
  S.log.push({ id: 's21', t: opts[i] });
  S.picks.s21 = i;
  await say('kid', opts[i]);
  if (i === 0) await say('mom', '다음에 이쁠때 보여줄께');
  if (i === 1) {
    await say('mom', '니 얼굴이나 보자');
    await say('mom', '^^');
  }
  if (i === 2) await say('mom', '아프긴 부은거다');
  await say('mom', '{F} 얼굴 봤으니 됐다');
  const secs = await call.end();
  S.calls.c1003 = { answered: true, lines, secs };
  await show(room.el, 900);
  room.date(10, 3);
  room.msg({ from: 'mom', kind: 'call', call: { secs, video: true } });
  await wait(1800);
}

/* ---------- 10월 31일 밤: 엄마가 할말이 ---------- */
async function lastNight1031() {
  setClock(10, 31, '23:40');
  const room = R.mom;
  if (curView !== room.el) await show(room.el, 1000);
  room.date(10, 31);
  await room.caption('자려고 누웠다.');
  await wait(1400);
  for (let k = 0; k < 2; k++) {
    room.typing(true);
    await wait(2300);
    room.typing(false);
    await wait(1900);
  }
  room.typing(true);
  await wait(2600);
  room.typing(false);
  room.peerNow('mom', '{C} 엄마가 할말이');
  await wait(1800);

  const opts = ['응 엄마 뭔데?', '?', '엄마?'];
  const first = await room.choose(opts.map(t => ({ t })));
  S.picks.s25 = first;
  S.log.push({ id: 's25', t: opts[first] });
  await room.send(opts[first]);
  S.night.push(opts[first]);
  await wait(5200);
  tickClock(1);
  const rest = opts.filter((_, i) => i !== first);
  const second = await room.choose([...rest.map(t => ({ t })), { t: '(그냥 기다린다)', act: true }]);
  if (second < rest.length) {
    S.log.push({ id: 's25', t: rest[second] });
    await room.send(rest[second]);
    S.night.push(rest[second]);
    await wait(4600);
  } else {
    await wait(2600);
  }
  await room.caption('답이 오지 않았다.');
  await wait(2400);
  await room.caption('그대로 잠이 들었다.');
  await wait(2600);
}

/* ---------- 11월 1일 새벽 4시 2분 ---------- */
async function climax() {
  await narration([''], { end: 1600, show: 1600 });
  setClock(11, 1, '04:02');
  const call = new Call({ name: '아빠', av: AV.dad, sub: '휴대전화' });
  await show(call.el, 1400);
  while ((await call.ring({ quake: true })) === 'decline') {
    S.log.push({ id: 'climax', t: '(아빠 전화 거절)' });
    await call.refused();
  }
  call.connect();
  await wait(2600);
  call.subs.append(h('p', { class: 'sub them hush', text: '……' }));
  await wait(4200);
  await narration(['아빠는 한참 아무 말도 하지 않았다.', '엄마가 쓰러졌다고 했다.', '', '엄마는 끝내 그 말을 보내지 못했다.'], { end: 3600, gap: 1100, show: 1600 });
  await narration(['며칠 뒤'], { end: 2200, show: 1600 });

  setClock(11, 5, '01:08');
  const room = R.mom;
  await show(room.el, 1600);
  room.date(11, 5);
  await room.caption('엄마를 보내고 온 날 밤. 엄마와의 대화방을 열었다.');
  await wait(1200);
  let left = ['엄마 보고 싶어', '엄마 밥은 먹었어?', '엄마 미안해', '엄마 사랑해'];
  let first = true;
  for (;;) {
    const opts = left.map(t => ({ t }));
    if (!first) opts.push({ t: '엄마 폰을 열어 본다', act: true, key: true });
    const i = await room.choose(opts);
    if (i >= left.length) break;
    const t = left[i];
    left = left.filter(x => x !== t);
    S.log.push({ id: 'last', t });
    await room.send(t);
    S.last.push(t);
    await wait(first ? 4200 : 2600);
    if (first) await room.caption('1이 사라지지 않는다.');
    first = false;
  }
}

async function part1() {
  for (const step of SCENES) {
    if (step.card) {
      await titleCard(step.card);
      step.before?.();
      continue;
    }
    if (step.run) {
      await step.run();
      continue;
    }
    await playScene(step);
    await wait(3000);
  }
}
