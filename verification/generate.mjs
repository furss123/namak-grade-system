import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { CASES } from './cases.mjs';

const require = createRequire(import.meta.url);
const GradeEngine = require('./grade-engine.js');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const EXPECTED_DIR = path.join(__dirname, 'expected');

function toCsv(students) {
    const headers = ['학번', '이름', '학년', '반', '번호', '국어'];
    const lines = [headers.join(',')];
    for (const s of students) {
        lines.push(headers.map((h) => s[h]).join(','));
    }
    return '\uFEFF' + lines.join('\n');
}

function buildExpected(caseDef, engineResult) {
    const { processedGradesCache, subjectStatsCache, cutLimits } = engineResult;
    const subject = '국어';
    const students = {};

    for (const s of caseDef.students) {
        const id = String(s['학번']);
        const p = processedGradesCache[id][subject];
        students[id] = {
            이름: s['이름'],
            rawInput: s['국어'],
            score: p.score,
            rankStr: p.rankStr,
            rank: p.rank,
            tieCount: p.tieCount,
            interRank: p.interRank,
            intermediateRankPercent: p.intermediateRankPercent,
            grade: p.grade,
            step: p.step,
            highestRank: p.highestRank,
            lowestRank: p.lowestRank,
        };
    }

    return {
        caseId: caseDef.id,
        title: caseDef.title,
        description: caseDef.description,
        checks: caseDef.checks,
        rulesVersion: '2022-개정-5등급제',
        N: cutLimits.N,
        cutLimits,
        subject,
        subjectStats: subjectStatsCache[subject],
        students,
    };
}

async function maybeWriteXlsx(caseDef, filePath) {
    try {
        const XLSX = (await import('xlsx')).default;
        const ws = XLSX.utils.json_to_sheet(caseDef.students);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '성적');
        XLSX.writeFile(wb, filePath);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    fs.mkdirSync(EXPECTED_DIR, { recursive: true });

    const manifest = { generatedAt: new Date().toISOString(), cases: [] };
    let xlsxOk = true;

    for (const caseDef of CASES) {
        const result = GradeEngine.processAllGrades(caseDef.students);
        const expected = buildExpected(caseDef, result);

        const fixtureJsonPath = path.join(FIXTURES_DIR, `${caseDef.id}.fixture.json`);
        const csvPath = path.join(FIXTURES_DIR, `${caseDef.id}.csv`);
        const xlsxPath = path.join(FIXTURES_DIR, `${caseDef.id}.xlsx`);
        const jsonPath = path.join(EXPECTED_DIR, `${caseDef.id}.json`);

        fs.writeFileSync(fixtureJsonPath, JSON.stringify({ students: caseDef.students }, null, 2), 'utf8');
        fs.writeFileSync(csvPath, toCsv(caseDef.students), 'utf8');
        fs.writeFileSync(jsonPath, JSON.stringify(expected, null, 2), 'utf8');

        const wroteXlsx = await maybeWriteXlsx(caseDef, xlsxPath);
        if (!wroteXlsx) xlsxOk = false;

        manifest.cases.push({
            id: caseDef.id,
            title: caseDef.title,
            fixtureJson: `fixtures/${caseDef.id}.fixture.json`,
            fixtureCsv: `fixtures/${caseDef.id}.csv`,
            fixtureXlsx: wroteXlsx ? `fixtures/${caseDef.id}.xlsx` : null,
            expected: `expected/${caseDef.id}.json`,
            N: expected.N,
            cutLimits: expected.cutLimits,
        });

        console.log(`✓ ${caseDef.id} (N=${expected.N})`);
    }

    fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    console.log('\n생성: fixtures/*.json, *.csv, expected/*.json');
    if (!xlsxOk) console.log('※ xlsx 미생성 — npm install 후 다시 실행하면 .xlsx도 생성됩니다.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
