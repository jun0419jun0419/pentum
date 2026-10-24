# pentum

이 저장소에는 두 가지가 들어 있습니다.

- **[엄마의 임시저장함](#엄마의-임시저장함)**: GitHub Pages로 배포하는 한국어 인터랙티브 스토리 게임 (`docs/`)
- **[포켓로그 Jev 봇](#포켓로그-jev-봇)**: PokeRogue 전투에서 기술을 대신 고르는 봇 (`src/`)

---

## 엄마의 임시저장함

몰래 아팠던 엄마의 1년치 짧은 문자 이야기입니다. 1부 · 2부 · 3부 · 에필로그로 이루어져 있고, 플레이 시간은 약 1시간입니다.

- 빌드 도구 없이 `docs/` 폴더의 `index.html`, `js/*.js`, `css/style.css`만으로 돌아가는 정적 사이트입니다.
- 백엔드, 로그인, 저장이 없습니다. 모든 선택과 상태는 브라우저 메모리에만 있고, 새로고침하면 처음부터 시작합니다.
- 휴대폰에서는 전체 화면으로, 넓은 화면에서는 360×740 휴대폰 프레임 안에서 보입니다. 기기의 라이트/다크 모드를 따릅니다.
- 명조체(Noto Serif KR)는 Google Fonts에서, 아이콘은 Tabler Icons 웹폰트(jsDelivr CDN)에서 불러옵니다. 인터넷이 끊기면 기본 글꼴로 보이고 아이콘만 빠집니다.

### GitHub Pages 켜는 법

1. 게임 파일이 든 브랜치를 기본 브랜치(`main`)에 병합합니다. 병합하지 않고 이 브랜치에서 바로 배포해도 됩니다.
2. GitHub에서 이 저장소를 열고 **Settings**(설정) → 왼쪽 메뉴의 **Pages**로 갑니다.
3. **Build and deployment** 아래 **Source**를 **Deploy from a branch**로 고릅니다.
4. **Branch**에서 배포할 브랜치(예: `main`)를 고르고, 옆의 폴더를 **`/docs`**로 바꾼 뒤 **Save**를 누릅니다.
5. 1~2분 기다리면 같은 화면 위쪽에 사이트 주소가 나타납니다. 보통 `https://<사용자이름>.github.io/pentum/` 입니다.

알아 두면 좋은 점:

- 무료 계정은 **공개(public) 저장소**에서만 Pages를 쓸 수 있습니다. 비공개 저장소라면 유료 플랜이 필요하거나 저장소를 공개로 바꿔야 합니다.
- `docs/.nojekyll` 파일이 있어서 GitHub가 Jekyll 변환 없이 파일을 그대로 올립니다. 지우지 마세요.
- 배포 진행 상황은 저장소의 **Actions** 탭에 `pages build and deployment`로 보입니다.
- 그다음부터는 `docs/` 안의 파일을 고쳐 그 브랜치에 푸시하면 몇 분 안에 자동으로 다시 배포됩니다.

### 내 컴퓨터에서 열어 보기

`docs/index.html`을 브라우저로 바로 열어도 됩니다. 로컬 서버로 보려면:

```bash
cd docs
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

점검할 때는 주소 뒤에 `?speed=0.1`을 붙이면 모든 연출이 10배 빨라집니다.

### 파일 구조

| 파일 | 내용 |
| --- | --- |
| `docs/index.html` | 휴대폰 화면 틀, 글꼴·아이콘·스크립트 불러오기 |
| `docs/css/style.css` | 전체 스타일 (메신저, 잠금화면, 통화, 엄마의 휴대폰, 라이트/다크) |
| `docs/js/util.js` | 대기·타이핑·한글 처리, 게임 상태 `S`, 이야기 속 시계 |
| `docs/js/art.js` | 사진 대신 쓰는 평면 SVG 일러스트 |
| `docs/js/ui.js` | 대화방, 읽음 표시 1, 잠금화면 알림, 통화 화면, 장 제목 카드 |
| `docs/js/part1.js` | 1부 · 나의 1년 (장면 데이터와 진행) |
| `docs/js/part2.js` | 2부 · 엄마의 휴대폰 (메시지, 사진, 통화 기록, 검색, 녹음, 임시저장함) |
| `docs/js/part3.js` | 3부 · 엄마의 1년 (엄마의 작성창, 메모 카드, 편지) |
| `docs/js/epilogue.js` | 에필로그 · 장조림 요리와 엔딩 |
| `docs/js/main.js` | 시작 화면, 인트로, 전체 진행 순서 |

장면의 대사와 선택지, 엄마의 숨은 메모는 `docs/js/part1.js`의 `SCENES` 배열에 모여 있습니다. 문구를 고칠 때는 이 배열만 바꾸면 2부 임시저장함과 3부 재생에도 그대로 반영됩니다.

---

## 포켓로그 Jev 봇

[PokeRogue(포켓로그)](https://github.com/pagefaultgames/pokerogue) 전투에서 **TypeSafe의 Jev 모델**이 기술을 대신 고르는 봇입니다.

### 봇이 하는 일

- 전투 중 기술을 고를 차례가 되면 게임 상태를 읽습니다. 내 포켓몬, 상대 포켓몬, HP, 타입, 기술별 위력·명중률·PP·상성이 포함됩니다.
- 이 상태를 Jev에 보내 "어떤 기술이 가장 좋은가"를 묻고, Jev가 고른 기술을 게임에 입력합니다.
- 터미널에 Jev가 각 기술에 매긴 확률을 보여 줍니다.
- Jev 호출이 실패하면 "위력 × 상성 × 자속 보정"이 가장 큰 기술로 대신 고릅니다.

### 직접 하셔야 하는 일 (현재 버전)

봇은 **전투 중 기술 선택만** 합니다. 아래는 직접 하셔야 합니다.

- 스타터 선택, 게임 시작
- 포켓몬 교체, 기절 후 다음 포켓몬 선택
- 아이템 상점(보상) 선택, 새 기술 배우기
- 더블 배틀에서 공격 대상 선택
- 몬스터볼 던지기, 도망가기

### 준비물

- Node.js 24.9 이상 (포켓로그 개발 서버 요구사항), pnpm
- TypeSafe API 키 ([typesafe.ai](https://typesafe.ai)에서 발급)

### 실행 방법

#### 1. 포켓로그를 내 컴퓨터에서 실행

봇은 공식 사이트(pokerogue.net)에서는 작동하지 않습니다. 게임 내부 상태를 읽어야 해서 **개발 모드로 띄운 포켓로그**가 필요합니다. 개발 모드에서는 로그인도 필요 없습니다.

```bash
git clone --recurse-submodules https://github.com/pagefaultgames/pokerogue.git
cd pokerogue
pnpm install
pnpm start:dev
```

`http://localhost:8000`에서 게임이 열리면 이 창은 그대로 둡니다.

#### 2. 봇 실행

새 터미널에서 실행합니다.

```bash
cd pentum
npm install
npx playwright install chromium
export TYPESAFE_API_KEY=발급받은_키     # Windows PowerShell: $env:TYPESAFE_API_KEY="발급받은_키"
npm run bot
```

봇 전용 브라우저 창이 뜨면 그 창에서 게임을 시작하세요. 전투에서 기술을 고를 차례가 오면 봇이 대신 고르고, 터미널에 이렇게 표시됩니다.

```
[웨이브 5 턴 1] Charmander(80%) vs Oddish(100%)
  Jev 선택 → Ember (확신도 90%) [Scratch:5% Growl:5% Ember:90%]
```

`Ctrl+C`로 봇을 종료합니다.

### 설정 (환경 변수)

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `TYPESAFE_API_KEY` | (필수) | TypeSafe API 키 |
| `POKEROGUE_URL` | `http://localhost:8000` | 포켓로그 개발 서버 주소 |
| `TYPESAFE_DEFAULT_MODEL` | `jev-latest` | 사용할 모델 |

**API 키는 코드나 GitHub에 저장하지 마세요.** 환경 변수로만 넣어 주세요.

### 구조

- `src/bot.mjs`: 브라우저를 띄우고 0.5초마다 기술 선택 차례인지 확인합니다.
- `src/game.mjs`: 게임 페이지 안에서 실행되어 전투 상태를 읽고 기술을 입력합니다.
- `src/decide.mjs`: Jev에 보낼 질문(Choice)을 만들고 결과를 해석합니다.
- `test/`: Jev 응답을 흉내 낸 가짜 서버로 판단 로직을 검사합니다. 실행: `npm test`
