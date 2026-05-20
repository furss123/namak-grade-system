/**
 * 성적 업로드 양식 xlsx 생성 → assets/grade-upload-template.xlsx
 * 실행: node scripts/generate-grade-template.cjs
 */
const path = require('path');
const XLSX = require(path.join(__dirname, '../verification/node_modules/xlsx'));

const outPath = path.join(__dirname, '../assets/grade-upload-template.xlsx');

const dataRows = [
  {
    학번: 1101,
    이름: '예시_홍길동',
    학년: 1,
    반: 1,
    번호: 1,
    국어: 85,
    수학: 90,
    영어: 88,
    한국사: 92,
    통합사회: 87,
    통합과학: 86,
  },
  {
    학번: 1102,
    이름: '예시_김철수',
    학년: 1,
    반: 1,
    번호: 2,
    국어: '',
    수학: '',
    영어: '',
    한국사: '',
    통합사회: '',
    통합과학: '',
  },
  {
    학번: 1103,
    이름: '',
    학년: 1,
    반: 1,
    번호: 3,
    국어: '',
    수학: '',
    영어: '',
    한국사: '',
    통합사회: '',
    통합과학: '',
  },
];

const ws = XLSX.utils.json_to_sheet(dataRows);
ws['!cols'] = [
  { wch: 8 },
  { wch: 14 },
  { wch: 6 },
  { wch: 5 },
  { wch: 6 },
  { wch: 8 },
  { wch: 8 },
  { wch: 8 },
  { wch: 8 },
  { wch: 10 },
  { wch: 10 },
];

const guide = XLSX.utils.aoa_to_sheet([
  ['남악고등학교 1학년 성적 입력 양식 — 작성 안내'],
  [],
  ['① 「성적데이터」 시트에 학생별 원점수를 입력합니다.'],
  ['② 필수 열: 학번, 이름, 학년, 반, 번호'],
  ['③ 교과 열: 국어, 수학, 영어, 한국사, 통합사회, 통합과학'],
  ['④ 예시 행은 삭제 후 실제 데이터를 입력하세요.'],
  ['⑤ .xlsx로 저장 후 시스템에 업로드합니다.'],
]);
guide['!cols'] = [{ wch: 56 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, '성적데이터');
XLSX.utils.book_append_sheet(wb, guide, '작성안내');
XLSX.writeFile(wb, outPath);
console.log('Wrote', outPath);
