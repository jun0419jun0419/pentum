# pentum: 포켓로그 Jev 봇

[PokeRogue(포켓로그)](https://github.com/pagefaultgames/pokerogue) 전투에서 **TypeSafe의 Jev 모델**이 기술을 대신 고르는 봇입니다.

## 봇이 하는 일

- 전투 중 기술을 고를 차례가 되면 게임 상태를 읽습니다. 내 포켓몬, 상대 포켓몬, HP, 타입, 기술별 위력·명중률·PP·상성이 포함됩니다.
- 이 상태를 Jev에 보내 "어떤 기술이 가장 좋은가"를 묻고, Jev가 고른 기술을 게임에 입력합니다.
- 터미널에 Jev가 각 기술에 매긴 확률을 보여 줍니다.
- Jev 호출이 실패하면 "위력 × 상성 × 자속 보정"이 가장 큰 기술로 대신 고릅니다.

## 직접 하셔야 하는 일 (현재 버전)

봇은 **전투 중 기술 선택만** 합니다. 아래는 직접 하셔야 합니다.

- 스타터 선택, 게임 시작
- 포켓몬 교체, 기절 후 다음 포켓몬 선택
- 아이템 상점(보상) 선택, 새 기술 배우기
- 더블 배틀에서 공격 대상 선택
- 몬스터볼 던지기, 도망가기

## 준비물

- Node.js 24.9 이상 (포켓로그 개발 서버 요구사항), pnpm
- TypeSafe API 키 ([typesafe.ai](https://typesafe.ai)에서 발급)

## 실행 방법

### 1. 포켓로그를 내 컴퓨터에서 실행

봇은 공식 사이트(pokerogue.net)에서는 작동하지 않습니다. 게임 내부 상태를 읽어야 해서 **개발 모드로 띄운 포켓로그**가 필요합니다. 개발 모드에서는 로그인도 필요 없습니다.

```bash
git clone --recurse-submodules https://github.com/pagefaultgames/pokerogue.git
cd pokerogue
pnpm install
pnpm start:dev
```

`http://localhost:8000`에서 게임이 열리면 이 창은 그대로 둡니다.

### 2. 봇 실행

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

## 설정 (환경 변수)

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `TYPESAFE_API_KEY` | (필수) | TypeSafe API 키 |
| `POKEROGUE_URL` | `http://localhost:8000` | 포켓로그 개발 서버 주소 |
| `TYPESAFE_DEFAULT_MODEL` | `jev-latest` | 사용할 모델 |

**API 키는 코드나 GitHub에 저장하지 마세요.** 환경 변수로만 넣어 주세요.

## 구조

- `src/bot.mjs`: 브라우저를 띄우고 0.5초마다 기술 선택 차례인지 확인합니다.
- `src/game.mjs`: 게임 페이지 안에서 실행되어 전투 상태를 읽고 기술을 입력합니다.
- `src/decide.mjs`: Jev에 보낼 질문(Choice)을 만들고 결과를 해석합니다.
- `test/`: Jev 응답을 흉내 낸 가짜 서버로 판단 로직을 검사합니다. 실행: `npm test`
