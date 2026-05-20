/**
 * 의존성 없이 fixture·정답지 생성 (Node 내장 모듈만 사용)
 * 실행: node build.cjs
 */
const fs = require('fs');
const path = require('path');
const GradeEngine = require('./grade-engine.js');

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

async function main() {
    const { CASES } = await import('./cases.mjs');
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    fs.mkdirSync(EXPECTED_DIR, { recursive: true });

    const manifest = { generatedAt: new Date().toISOString(), cases: [] };

    for (const caseDef of CASES) {
        const result = GradeEngine.processAllGrades(caseDef.students);
        const expected = buildExpected(caseDef, result);

        fs.writeFileSync(
            path.join(FIXTURES_DIR, `${caseDef.id}.fixture.json`),
            JSON.stringify({ students: caseDef.students }, null, 2),
            'utf8'
        );
        fs.writeFileSync(path.join(FIXTURES_DIR, `${caseDef.id}.csv`), toCsv(caseDef.students), 'utf8');
        fs.writeFileSync(
            path.join(EXPECTED_DIR, `${caseDef.id}.json`),
            JSON.stringify(expected, null, 2),
            'utf8'
        );

        manifest.cases.push({
            id: caseDef.id,
            title: caseDef.title,
            fixtureJson: `fixtures/${caseDef.id}.fixture.json`,
            fixtureCsv: `fixtures/${caseDef.id}.csv`,
            expected: `expected/${caseDef.id}.json`,
            N: expected.N,
            cutLimits: expected.cutLimits,
        });
        console.log('OK', caseDef.id, 'N=' + expected.N);
    }

    fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Done. Run: node run-tests.mjs');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
