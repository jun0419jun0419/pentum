'use strict';

/* ================================================================
   사진 대신 쓰는 평면 SVG 일러스트 (사람 얼굴은 그리지 않는다)
   ================================================================ */

let ART_N = 0;
const artId = () => `art${++ART_N}`;

// 항상 같은 그림이 나오도록 씨앗이 있는 난수
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svg = (body, label, { slice = false } = {}) =>
  `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}"${slice ? ' preserveAspectRatio="xMidYMid slice"' : ''}>${body}</svg>`;

const ART = {
  // 1월 18일 · 눈 쌓인 마당
  snow() {
    const r = seeded(7);
    let flakes = '';
    for (let i = 0; i < 46; i++) flakes += `<circle cx="${(r() * 240).toFixed(1)}" cy="${(r() * 170).toFixed(1)}" r="${(0.8 + r() * 1.6).toFixed(1)}"/>`;
    let posts = '';
    for (let x = 6; x < 140; x += 16) posts += `<rect x="${x}" y="94" width="5" height="28" rx="1"/><rect x="${x - 1}" y="92" width="7" height="3" rx="1.5" fill="#fff"/>`;
    let steps = '';
    for (let i = 0; i < 7; i++) steps += `<ellipse cx="${132 + i * 8 + (i % 2) * 5}" cy="${172 - i * 8}" rx="2.6" ry="1.5"/>`;
    return svg(`
      <rect width="240" height="180" fill="#d3dde8"/>
      <path d="M0 92 Q40 70 80 86 T160 80 T240 84 V122 H0Z" fill="#bfcbd8"/>
      <path d="M0 92 Q40 70 80 86 T160 80 T240 84 V89 Q200 85 160 87 T80 93 T0 97Z" fill="#f4f7fa"/>
      <rect x="150" y="62" width="86" height="58" fill="#c8b29a"/>
      <path d="M140 66 L192 36 L246 66Z" fill="#7a5d52"/>
      <path d="M140 66 L192 36 L246 66 L242 70 L192 43 L144 70Z" fill="#fff"/>
      <rect x="164" y="80" width="26" height="20" rx="2" fill="#fbe5b2" stroke="#8b7462" stroke-width="2.5"/>
      <path d="M177 80 V100 M164 90 H190" stroke="#8b7462" stroke-width="2"/>
      <rect x="204" y="84" width="18" height="36" fill="#8a6a55"/>
      <rect x="0" y="103" width="142" height="4" fill="#a08877"/>
      <g fill="#a08877">${posts}</g>
      <path d="M0 118 Q70 108 130 116 T240 114 V180 H0Z" fill="#fbfdff"/>
      <ellipse cx="62" cy="142" rx="24" ry="5" fill="#e2e9f1"/>
      <ellipse cx="92" cy="147" rx="18" ry="4" fill="#e2e9f1"/>
      <path d="M46 141 q-6 -27 16 -31 q22 4 16 31z" fill="#5e3f2e"/>
      <ellipse cx="62" cy="110.5" rx="15" ry="4.5" fill="#fff"/>
      <path d="M79 146 q-5 -21 13 -24 q18 3 13 24z" fill="#6c4a37"/>
      <ellipse cx="92" cy="122.5" rx="12" ry="3.6" fill="#fff"/>
      <g fill="#dbe3ec">${steps}</g>
      <path d="M118 120 V78 M118 96 L104 84 M118 88 L130 74 M118 104 L128 96" stroke="#6b5a4e" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <path d="M104 84 l-2 -1 M130 74 l2 -1" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <g fill="#fff" opacity=".9">${flakes}</g>`, '눈 쌓인 마당');
  },

  // 4월 5일 · 벚꽃 가지 (아빠가 찍어서 조금 흔들렸다)
  cherry({ slice = false } = {}) {
    const id = artId();
    const r = seeded(11);
    const spots = [[30, 150], [60, 120], [92, 98], [122, 82], [150, 70], [176, 62], [205, 48], [228, 40], [98, 60], [80, 40], [140, 112], [168, 120], [196, 96]];
    let flowers = '';
    for (const [bx, by] of spots) {
      for (let k = 0; k < 4; k++) {
        const x = bx + (r() - 0.5) * 34;
        const y = by + (r() - 0.5) * 26;
        const s = 4 + r() * 3.5;
        const tone = r() < 0.5 ? '#f7c6d4' : '#fbd9e3';
        let petals = '';
        for (let p = 0; p < 5; p++) {
          const ang = (p / 5) * Math.PI * 2 + r();
          petals += `<circle cx="${(x + Math.cos(ang) * s).toFixed(1)}" cy="${(y + Math.sin(ang) * s).toFixed(1)}" r="${(s * 0.8).toFixed(1)}"/>`;
        }
        flowers += `<g fill="${tone}">${petals}</g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.45).toFixed(1)}" fill="#e98aa6"/>`;
      }
    }
    let falling = '';
    for (let i = 0; i < 14; i++) {
      const x = (r() * 240).toFixed(1);
      const y = (r() * 180).toFixed(1);
      falling += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.6" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})"/>`;
    }
    const branch = `
      <path d="M-10 186 Q40 140 92 100 T176 60 T252 30" stroke="#5b4336" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M92 100 Q90 70 78 38" stroke="#5b4336" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M130 84 Q152 104 172 124" stroke="#5b4336" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M176 60 Q190 80 200 100" stroke="#5b4336" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${flowers}`;
    return svg(`
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93c5ee"/><stop offset="1" stop-color="#ddeefc"/></linearGradient></defs>
      <rect width="240" height="180" fill="url(#${id})"/>
      <g opacity=".35" transform="translate(4 2)">${branch}</g>
      <g>${branch}</g>
      <g fill="#f9cfdc" opacity=".9">${falling}</g>`, '벚꽃 가지', { slice });
  },

  // 6월 26일 · 생일 미역국
  soup() {
    const r = seeded(3);
    let grains = '';
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const d = r() * 17;
      grains += `<ellipse cx="${(186 + Math.cos(a) * d).toFixed(1)}" cy="${(58 + Math.sin(a) * d).toFixed(1)}" rx="2.2" ry="1.2" transform="rotate(${(r() * 180).toFixed(0)} ${(186 + Math.cos(a) * d).toFixed(1)} ${(58 + Math.sin(a) * d).toFixed(1)})"/>`;
    }
    let oil = '';
    for (let i = 0; i < 9; i++) oil += `<circle cx="${(84 + r() * 46).toFixed(1)}" cy="${(80 + r() * 40).toFixed(1)}" r="${(1.5 + r() * 2.5).toFixed(1)}"/>`;
    return svg(`
      <rect width="240" height="180" fill="#c89a6c"/>
      <path d="M0 44 H240 M0 98 H240 M0 152 H240" stroke="#b5875a" stroke-width="2"/>
      <rect x="18" y="20" width="204" height="146" rx="10" fill="#efe5d4" opacity=".55"/>
      <circle cx="104" cy="100" r="54" fill="#d9d3c8"/>
      <circle cx="104" cy="98" r="52" fill="#f5f1ea"/>
      <circle cx="104" cy="98" r="42" fill="#4a5c31"/>
      <path d="M76 92 q14 -14 26 -2 t28 -2 M72 108 q16 10 30 -2 t30 4 M86 80 q10 6 22 -4 M90 120 q14 -6 26 2" stroke="#2d3f1d" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M80 100 q12 -6 22 2 M104 86 q10 6 20 -2" stroke="#6b8546" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <g fill="#e9d79b" opacity=".75">${oil}</g>
      <circle cx="186" cy="58" r="28" fill="#d9d3c8"/>
      <circle cx="186" cy="57" r="26" fill="#f5f1ea"/>
      <circle cx="186" cy="57" r="20" fill="#fdfcf8"/>
      <g fill="#ece7dc">${grains}</g>
      <circle cx="190" cy="134" r="20" fill="#f5f1ea"/>
      <path d="M178 130 l10 -6 l8 8 l-10 6z M190 138 l9 -4 l3 8 l-9 3z M180 140 l7 0 l1 6 l-8 -1z" fill="#c7442f"/>
      <rect x="40" y="160" width="130" height="5" rx="2.5" fill="#cfd3d8" transform="rotate(-4 40 160)"/>
      <ellipse cx="34" cy="160" rx="14" ry="9" fill="#cfd3d8" transform="rotate(-4 34 160)"/>
      <rect x="168" y="150" width="70" height="3.5" rx="1.75" fill="#8a5a36" transform="rotate(-18 168 150)"/>
      <rect x="172" y="158" width="70" height="3.5" rx="1.75" fill="#8a5a36" transform="rotate(-16 172 158)"/>`, '미역국 한 상');
  },

  // 9월 10일 프로필 · 일곱 살 회전목마 (옛날 사진)
  carousel() {
    const id = artId();
    let lights = '';
    for (let x = 22; x <= 218; x += 14) lights += `<circle cx="${x}" cy="46" r="3"/>`;
    let scallop = '';
    for (let x = 14; x < 230; x += 24) scallop += `<path d="M${x} 52 a12 12 0 0 0 24 0z"/>`;
    return svg(`
      <defs><radialGradient id="${id}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2410" stop-opacity=".45"/></radialGradient></defs>
      <rect width="240" height="180" fill="#f2e6cf"/>
      <rect x="8" y="8" width="224" height="164" fill="#e7cfa4"/>
      <rect x="8" y="8" width="224" height="32" fill="#c98a5a"/>
      <path d="M8 40 H232 V52 H8Z" fill="#e9c27c"/>
      <g fill="#d36a4f">${scallop}</g>
      <g fill="#fff3c4">${lights}</g>
      <path d="M8 26 L120 12 L232 26" stroke="#e9c27c" stroke-width="3" fill="none"/>
      <path d="M40 52 V172 M200 52 V172" stroke="#c9a24f" stroke-width="4"/>
      <rect x="8" y="150" width="224" height="22" fill="#b98b5e"/>
      <path d="M124 52 V172" stroke="#d8b25a" stroke-width="5"/>
      <path d="M86 108 q-14 6 -12 26 q6 -10 14 -14z" fill="#a8835e"/>
      <ellipse cx="120" cy="112" rx="34" ry="15" fill="#fbf4e6"/>
      <path d="M140 106 L154 84 Q158 77 166 79 L175 85 Q178 90 171 91 L162 91 L151 112Z" fill="#fbf4e6"/>
      <path d="M152 86 Q146 92 142 104" stroke="#c96d4e" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M98 122 L92 148 M108 124 L106 150" stroke="#fbf4e6" stroke-width="7" stroke-linecap="round"/>
      <path d="M140 120 L152 130 L147 140" stroke="#fbf4e6" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M110 98 q12 -6 22 2 l-2 10 h-18z" fill="#c9433a"/>
      <rect x="111" y="84" width="16" height="20" rx="6" fill="#e0664f"/>
      <circle cx="119" cy="77" r="7.5" fill="#5a4234"/>
      <path d="M112 88 l-6 10 M126 88 l6 8" stroke="#e0664f" stroke-width="4" stroke-linecap="round"/>
      <rect width="240" height="180" fill="url(#${id})"/>
      <rect width="240" height="180" fill="#d9a35f" opacity=".12"/>`, '회전목마');
  },

  // 10월 15일 · 장조림 만드는 법 공책
  recipe() {
    const f = esc(P('{F}'));
    let rules = '';
    for (let y = 46; y < 170; y += 18) rules += `<path d="M28 ${y} H214" />`;
    const lines = ['소고기 홍두깨살 한근', '물 세컵 간장 반컵', '설탕 두숟갈 마늘 한줌', '메추리알 꼭 넣기', `${f} 메추리알만 골라먹음`];
    const texts = lines.map((t, i) => `<text x="48" y="${78 + i * 18}">${t}</text>`).join('');
    return svg(`
      <rect width="240" height="180" fill="#d6c0a0"/>
      <g transform="rotate(-3 120 90)">
        <rect x="22" y="10" width="198" height="166" rx="3" fill="#000" opacity=".12" transform="translate(3 4)"/>
        <rect x="22" y="10" width="198" height="166" rx="3" fill="#fffcf3"/>
        <g stroke="#cad8ea" stroke-width="1">${rules}</g>
        <path d="M40 10 V176" stroke="#eba3a3" stroke-width="1.4"/>
        <g font-family="'Noto Serif KR', serif" fill="#2d3f6b">
          <text x="48" y="44" font-size="17" font-weight="600">장조림</text>
          <g font-size="11.5">${texts}</g>
        </g>
        <path d="M150 40 q4 -4 8 0 t8 0 t8 0 t8 0" stroke="#2d3f6b" stroke-width="1.3" fill="none"/>
        <path d="M150 36 l32 8" stroke="#2d3f6b" stroke-width="1.1"/>
        <path d="M138 128 q3 -3 6 0 t6 0 t6 0" stroke="#2d3f6b" stroke-width="1.1" fill="none" opacity=".7"/>
      </g>
      <rect x="184" y="130" width="64" height="7" rx="3.5" fill="#3b5ba0" transform="rotate(-38 184 130)"/>`, '장조림 만드는 법 공책');
  },

  // 병원 창밖 단풍
  maple() {
    const r = seeded(5);
    let leaves = '';
    const tones = ['#d9532b', '#e8823a', '#c23b22', '#f0a640'];
    for (let i = 0; i < 34; i++) {
      const cx = 40 + r() * 160;
      const cy = 46 + r() * 70;
      leaves += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(10 + r() * 12).toFixed(1)}" fill="${tones[i % 4]}"/>`;
    }
    let slats = '';
    for (let y = 18; y < 40; y += 5) slats += `<rect x="26" y="${y}" width="188" height="3.6" rx="1"/>`;
    return svg(`
      <rect width="240" height="180" fill="#e6e9e3"/>
      <rect x="26" y="16" width="188" height="130" fill="#cfe3f2"/>
      <rect x="26" y="96" width="188" height="50" fill="#dfe7d9"/>
      <rect x="150" y="64" width="54" height="82" fill="#e9ecef"/>
      <path d="M158 74 h10 M178 74 h10 M158 88 h10 M178 88 h10 M158 102 h10 M178 102 h10" stroke="#c4ccd4" stroke-width="5"/>
      <path d="M108 150 V100 M108 116 L92 100 M108 108 L124 94" stroke="#6b4a37" stroke-width="6" stroke-linecap="round"/>
      <g opacity=".96">${leaves}</g>
      <g fill="#f4f4f0" opacity=".92">${slats}</g>
      <path d="M26 16 H214 V146 H26Z M120 16 V146 M26 82 H214" stroke="#fbfbf8" stroke-width="7" fill="none"/>
      <rect x="14" y="146" width="212" height="12" rx="2" fill="#f4f3ee"/>
      <rect x="14" y="158" width="212" height="22" fill="#d7dad3"/>
      <path d="M176 132 h18 l-3 14 h-12z" fill="#fff" stroke="#d2d2cc" stroke-width="1.2"/>`, '병원 창밖 단풍');
  },

  // 5월 8일 · 어버이날 메시지 캡처
  capture() {
    return svg(`
      <rect width="240" height="180" fill="#aebfcf"/>
      <rect x="66" y="16" width="108" height="16" rx="8" fill="#000" opacity=".16"/>
      <text x="120" y="27.5" font-size="8.5" fill="#fff" text-anchor="middle" font-family="sans-serif">2026년 5월 8일 금요일</text>
      <rect x="16" y="50" width="30" height="30" rx="11" fill="#cbbcf2"/>
      <circle cx="31" cy="61" r="5.5" fill="none" stroke="#4a4560" stroke-width="2"/>
      <path d="M22 75 q9 -9 18 0" fill="none" stroke="#4a4560" stroke-width="2"/>
      <text x="54" y="58" font-size="9" fill="#33414f" font-family="sans-serif">${esc(P('{F}'))}</text>
      <rect x="54" y="64" width="150" height="46" rx="12" fill="#fff"/>
      <text font-size="11.5" fill="#1d1d1d" font-family="sans-serif"><tspan x="66" y="83">엄마 어버이날 축하해</tspan><tspan x="66" y="100">주말에 갈게 사랑해</tspan></text>
      <text x="208" y="108" font-size="7.5" fill="#4e5d6b" font-family="sans-serif">오전 11:31</text>
      <rect x="2" y="2" width="236" height="176" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>`, '어버이날 메시지 캡처');
  },

  // 에필로그 · 내가 만든 장조림
  jang() {
    const r = seeded(9);
    let beef = '';
    for (let i = 0; i < 12; i++) {
      const x = 80 + r() * 80;
      const y = 66 + r() * 52;
      beef += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(16 + r() * 12).toFixed(1)}" height="7" rx="3.5" fill="${r() < 0.5 ? '#7a3f22' : '#8e4c2a'}" transform="rotate(${(r() * 160 - 80).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    let eggs = '';
    for (let i = 0; i < 9; i++) {
      const x = 82 + r() * 76;
      const y = 68 + r() * 46;
      eggs += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="6.5" fill="#c58a4f"/><ellipse cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" rx="3" ry="2" fill="#e2b07a"/>`;
    }
    let garlic = '';
    for (let i = 0; i < 5; i++) garlic += `<ellipse cx="${(90 + r() * 60).toFixed(1)}" cy="${(72 + r() * 40).toFixed(1)}" rx="4.5" ry="3.4" fill="#e7cf9c"/>`;
    return svg(`
      <rect width="240" height="180" fill="#b88a5e"/>
      <path d="M0 56 H240 M0 124 H240" stroke="#a87b50" stroke-width="2"/>
      <ellipse cx="120" cy="96" rx="76" ry="62" fill="#000" opacity=".12"/>
      <circle cx="120" cy="92" r="64" fill="#e9e4da"/>
      <circle cx="120" cy="92" r="58" fill="#f6f2ea"/>
      <circle cx="120" cy="92" r="48" fill="#5a2f17"/>
      ${beef}${eggs}${garlic}
      <circle cx="104" cy="76" r="7" fill="#fff" opacity=".12"/>
      <rect x="182" y="120" width="70" height="4" rx="2" fill="#7a4a2a" transform="rotate(-24 182 120)"/>
      <rect x="186" y="130" width="70" height="4" rx="2" fill="#7a4a2a" transform="rotate(-21 186 130)"/>`, '장조림');
  },
};
