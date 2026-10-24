# 엄마의 임시저장함

몰래 아팠던 엄마의 1년치 짧은 문자 이야기입니다. 1부 · 2부 · 3부 · 에필로그로 이루어져 있고, 플레이 시간은 약 1시간입니다.

**바로 플레이: https://jun0419jun0419.github.io/pentum/** (아래 방법으로 GitHub Pages를 켠 뒤 열립니다)

- 빌드 도구 없이 `docs/` 폴더의 `index.html`, `js/*.js`, `css/style.css`만으로 돌아가는 정적 사이트입니다.
- 백엔드, 로그인, 저장이 없습니다. 모든 선택과 상태는 브라우저 메모리에만 있고, 새로고침하면 처음부터 시작합니다.
- 휴대폰에서는 전체 화면으로, 넓은 화면에서는 360×740 휴대폰 프레임 안에서 보입니다. 기기의 라이트/다크 모드를 따릅니다.
- 명조체(Noto Serif KR)는 Google Fonts에서, 아이콘은 Tabler Icons 웹폰트(jsDelivr CDN)에서 불러옵니다. 인터넷이 끊기면 기본 글꼴로 보이고 아이콘만 빠집니다.

## GitHub Pages 켜는 법

1. GitHub에서 이 저장소를 열고 **Settings**(설정) → 왼쪽 메뉴의 **Pages**로 갑니다.
2. **Build and deployment** 아래 **Source**를 **Deploy from a branch**로 고릅니다.
3. **Branch**에서 `main`을 고르고, 옆의 폴더를 **`/docs`**로 바꾼 뒤 **Save**를 누릅니다.
4. 1~2분 기다리면 같은 화면 위쪽에 사이트 주소가 나타납니다. 보통 `https://<사용자이름>.github.io/pentum/` 입니다.

알아 두면 좋은 점:

- 무료 계정은 **공개(public) 저장소**에서만 Pages를 쓸 수 있습니다. 비공개 저장소라면 유료 플랜이 필요하거나 저장소를 공개로 바꿔야 합니다.
- `docs/.nojekyll` 파일이 있어서 GitHub가 Jekyll 변환 없이 파일을 그대로 올립니다. 지우지 마세요.
- 배포 진행 상황은 저장소의 **Actions** 탭에 `pages build and deployment`로 보입니다.
- 그다음부터는 `docs/` 안의 파일을 고쳐 `main`에 푸시하면 몇 분 안에 자동으로 다시 배포됩니다.

## 내 컴퓨터에서 열어 보기

`docs/index.html`을 브라우저로 바로 열어도 됩니다. 로컬 서버로 보려면:

```bash
cd docs
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

점검할 때는 주소 뒤에 `?speed=0.1`을 붙이면 모든 연출이 10배 빨라집니다.

## 파일 구조

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
