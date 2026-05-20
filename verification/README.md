# 고등학교 성적 등급 검증 세트

2022 개정 교육과정 **5등급제** 동점자 처리 규칙을 검증하는 fixture·정답지·자동 테스트입니다.

## 빠른 시작

```bash
cd verification
node run-tests.mjs
```

6개 케이스가 모두 `PASS`이면 `grade-engine.js`가 정답지와 일치합니다.

정당지·CSV를 다시 만들 때:

```bash
node build.cjs
```

`index.html`은 이 폴더의 `grade-engine.js`를 직접 사용합니다. 엔진을 고치면 `node run-tests.mjs`로 검증하세요.

`index.html` 업로드용 `.xlsx`가 필요하면:

```bash
npm install
node generate.mjs
```

## 폴더

| 경로 | 설명 |
|------|------|
| `fixtures/*.fixture.json` | 입력 성적 (과목: 국어) |
| `fixtures/*.csv` | 엑셀에서 열기/편집용 |
| `expected/*.json` | 학번별 정답 (석차·등급·step) |
| `VERIFY.md` | 수동 체크리스트 |
| `verify.html` | 브라우저 검증 UI |

자세한 규칙·케이스별 포인트는 [VERIFY.md](./VERIFY.md)를 참고하세요.
