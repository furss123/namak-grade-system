/**
 * 성적 업로드 양식 xlsx 생성 → assets/grade-upload-template.xlsx
 * 형식: 반, 번호, 이름, 국어, 수학, 영어, 한국사, 통합사회, 통합과학 (Sheet1)
 * 실행: node scripts/generate-grade-template.cjs
 */
const path = require('path');
const XLSX = require(path.join(__dirname, '../verification/node_modules/xlsx'));

const outPath = path.join(__dirname, '../assets/grade-upload-template.xlsx');
const headers = ['반', '번호', '이름', '국어', '수학', '영어', '한국사', '통합사회', '통합과학'];

const dataRows = [];
for (let num = 1; num <= 5; num++) {
  dataRows.push({
    반: 1,
    번호: num,
    이름: '',
    국어: '',
    수학: '',
    영어: '',
    한국사: '',
    통합사회: '',
    통합과학: '',
  });
}

const ws = XLSX.utils.json_to_sheet(dataRows, { header: headers });
ws['!cols'] = [
  { wch: 5 },
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
  ['① 「Sheet1」 시트에 반·번호·이름과 교과별 원점수를 입력합니다.'],
  ['② 필수 열: 반, 번호, 이름 (학번 열은 넣지 않습니다)'],
  ['③ 교과 열: 국어, 수학, 영어, 한국사, 통합사회, 통합과학'],
  ['④ .xlsx로 저장 후 「성적 데이터 등록」에서 업로드합니다.'],
]);
guide['!cols'] = [{ wch: 58 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
XLSX.utils.book_append_sheet(wb, guide, '작성안내');
XLSX.writeFile(wb, outPath);
console.log('Wrote', outPath);
