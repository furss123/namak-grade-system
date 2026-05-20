# 등급 산출 규칙 검증 체크리스트

**기준:** 2022 개정 교육과정 5등급제 · 동점자 처리  
**대상 엔진:** `grade-engine.js` (= `index.html`의 `processAllGrades`)

---

## 공통 규칙 (모든 케이스)

| # | 규칙 | 검증 방법 |
|---|------|-----------|
| R1 | 점수 반올림: 셋째 자리에서 반올림 → 둘째 자리 | case04 `rawInput` vs `score` |
| R2 | `cutN = round(N × 10/34/66/90%)` | 각 케이스 `cutLimits` |
| R3 | 동점자 동일 `rankStr` (예: `6(3)`) | case02, case05 |
| R4 | `interRank = highestRank + (tieCount-1)/2` | 동점 케이스 `interRank` |
| R5 | STEP2: 그룹 전원이 한 구간에 포함되면 동일 등급 | case05 `step=STEP2` |
| R6 | STEP3·4: 경계 걸치면 `interRank/N×100`로 10/34/66/90% 비교 | case02, case06 |

---

## 케이스별 체크리스트

### case01_basic_10 — 기본 (N=10)

- [ ] `cut1=1, cut2=3, cut3=7, cut4=9`
- [ ] 동점 없음 → `rankStr`에 괄호 없음
- [ ] 1위 1등급, 2~3위 2등급, 4~7위 3등급, 8~9위 4등급, 10위 5등급
- [ ] 컷라인: 1등급 100.0 / 2등급 90.0 / 3등급 70.0 / 4등급 60.0

### case02_tie_boundary_20 — STEP 3·4 (N=20)

- [ ] `cut2=7`
- [ ] 6~8위 동점 `6(3)`, 점수 82.0
- [ ] `interRank=7.0` → 7/20×100 = **35%** → **3등급** (34% 초과)
- [ ] `step=STEP3_4`, 동점자 1206·1207·1208 전원 동일 결과

### case03_rounding_23 — 컷 반올림 (N=23)

- [ ] `cut1=2, cut2=8, cut3=15, cut4=21`
- [ ] 3위(1303) **2등급** — 2등급 마지막 석차
- [ ] 9위(1309) **3등급** — 3등급 첫 석차
- [ ] 16위(1316) **4등급**, 22~23위 **5등급**

### case04_score_rounding — 점수 반올림 (N=8)

- [ ] `90.125` → `90.13`, `90.124` → `90.12`
- [ ] `85.005` → `85.01` (1403·1404 동점 `3(2)`)
- [ ] `85.004` → `85.00` (1405 단독 5위)
- [ ] `80.996` → `81.00`

### case05_tie_within_grade — STEP 2 (N=15)

- [ ] 3~4위 동점 `3(2)`, 점수 93.0
- [ ] `highest=3, lowest=4` → 2등급 구간에 **완전 포함** → 전원 **2등급**
- [ ] `step=STEP2` (STEP3·4 아님)

### case06_intermediate_step34 — STEP 3·4 (N=10)

- [ ] 3~4위 동점 `3(2)`, 점수 90.0
- [ ] STEP2 실패 → `interRank=3.5` → **35%** → **3등급**
- [ ] `step=STEP3_4`

---

## 실행 방법

### 1) CLI 자동 검증 (권장)

```bash
cd verification
node build.cjs      # fixture·정답지·CSV 재생성 (선택)
node run-tests.mjs  # 6케이스 일괄 PASS/FAIL
```

### 2) 브라우저

```bash
cd verification
npx --yes serve .
```

브라우저에서 `http://localhost:3000/verify.html` → **전체 케이스 검증**

### 3) 본편 index.html 수동 대조

1. `fixtures/case02_tie_boundary_20.csv`를 엑셀에서 열어 `.xlsx`로 저장 후 업로드  
2. 학번 `1206` 조회  
3. 석차 `6(3)`, 등급 `3`, 중간석차 `7.0` 확인  

---

## index.html 연동

`index.html`은 `verification/grade-engine.js`를 `<script src="verification/grade-engine.js">`로 불러와  
`processAllGrades()`에서 `GradeEngine.processAllGrades(studentData)`를 호출합니다.

엔진 수정 시 반드시:

1. `node build.cjs` 로 정답지 재생성  
2. `node run-tests.mjs` PASS 확인  
3. 필요 시 `VERIFY.md` 체크리스트 갱신  

---

## 파일 구조

```
verification/
  grade-engine.js      # 단일 규칙 구현
  cases.mjs            # 케이스 정의 (수정 시 build 재실행)
  fixtures/            # 입력 데이터 (.fixture.json, .csv)
  expected/            # 정답지 (.json)
  VERIFY.md            # 이 문서
  verify.html          # 브라우저 검증 UI
  build.cjs            # 생성 스크립트
  run-tests.mjs        # 자동 테스트
```
