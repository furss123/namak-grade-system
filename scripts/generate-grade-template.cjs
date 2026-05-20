/**
 * 성적 업로드 양식 xlsx 생성 → assets/grade-upload-template.xlsx
 * 정보입력란: 1행 헤더, 2행 단위수, 3행~ 학생
 * 작성안내 시트 포함
 * 실행: node scripts/generate-grade-template.cjs
 */
const path = require('path');
const XLSX = require(path.join(__dirname, '../verification/node_modules/xlsx'));

const outPath = path.join(__dirname, '../assets/grade-upload-template.xlsx');
const SHEET_MAIN = '정보입력란';

const headers = ['반', '번호', '이름', '국어', '수학', '영어', '한국사', '통합사회', '통합과학'];
const defaultUnits = { 국어: 4, 수학: 4, 영어: 4, 한국사: 3, 통합사회: 3, 통합과학: 3 };

const unitRow = ['단위수', '', ''];
headers.slice(3).forEach((s) => unitRow.push(defaultUnits[s] ?? 1));

const aoa = [headers, unitRow];
for (let num = 1; num <= 5; num++) {
  aoa.push([1, num, '', '', '', '', '', '', '']);
}

const ws = XLSX.utils.aoa_to_sheet(aoa);
ws['!cols'] = [
  { wch: 7 },
  { wch: 6 },
  { wch: 12 },
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
  [`① 「${SHEET_MAIN}」시트: 1행 열 제목, 2행 과목별 단위수, 3행부터 학생 성적`],
  [`② 단위수는 「${SHEET_MAIN}」 2행(반 열에 「단위수」)에만 적으면 됩니다.`],
  ['③ 열 이름을 국어(4)처럼 괄호에 단위수를 넣어도 인식합니다.'],
  ['④ 필수: 반·번호·이름 또는 학번·이름. .xlsx 저장 후 「성적 데이터 등록」에서 업로드'],
]);
guide['!cols'] = [{ wch: 65 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, SHEET_MAIN);
XLSX.utils.book_append_sheet(wb, guide, '작성안내');
XLSX.writeFile(wb, outPath);
console.log('Wrote', outPath);
