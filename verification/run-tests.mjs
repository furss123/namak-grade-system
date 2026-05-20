import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const GradeEngine = require('./grade-engine.js');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const EXPECTED_DIR = path.join(__dirname, 'expected');

function loadFixture(caseId) {
    const jsonPath = path.join(FIXTURES_DIR, `${caseId}.fixture.json`);
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`fixture 없음: ${jsonPath} (node generate.mjs 실행)`);
    }
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8')).students;
}

function compareStudent(actual, expected, studentId) {
    const errors = [];
    for (const f of ['score', 'rankStr', 'rank', 'tieCount', 'interRank', 'grade', 'step']) {
        if (actual[f] !== expected[f]) {
            errors.push(`  학번 ${studentId}: ${f} 기대=${JSON.stringify(expected[f])} 실제=${JSON.stringify(actual[f])}`);
        }
    }
    const pctDiff = Math.abs(actual.intermediateRankPercent - expected.intermediateRankPercent);
    if (pctDiff > 0.001) {
        errors.push(`  학번 ${studentId}: intermediateRankPercent 기대=${expected.intermediateRankPercent} 실제=${actual.intermediateRankPercent}`);
    }
    return errors;
}

function runCase(caseId) {
    const expectedPath = path.join(EXPECTED_DIR, `${caseId}.json`);
    if (!fs.existsSync(expectedPath)) {
        return { caseId, ok: false, errors: [`정답지 없음: ${caseId}`] };
    }

    const students = loadFixture(caseId);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    const subject = expected.subject || '국어';
    const { processedGradesCache, cutLimits } = GradeEngine.processAllGrades(students);
    const errors = [];

    for (const key of ['N', 'cut1', 'cut2', 'cut3', 'cut4']) {
        if (cutLimits[key] !== expected.cutLimits[key]) {
            errors.push(`  cutLimits.${key}: 기대=${expected.cutLimits[key]} 실제=${cutLimits[key]}`);
        }
    }

    for (const [studentId, exp] of Object.entries(expected.students)) {
        const act = processedGradesCache[studentId]?.[subject];
        if (!act) {
            errors.push(`  학번 ${studentId}: 결과 없음`);
            continue;
        }
        errors.push(...compareStudent(act, exp, studentId));
    }

    return { caseId, title: expected.title, ok: errors.length === 0, errors };
}

function main() {
    const manifestPath = path.join(__dirname, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('manifest.json 없음. 먼저 node generate.mjs 를 실행하세요.');
        process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let passed = 0;
    let failed = 0;

    console.log('=== 등급 엔진 검증 (fixture × 정답지) ===\n');

    for (const c of manifest.cases) {
        const result = runCase(c.id);
        if (result.ok) {
            console.log(`PASS  ${c.id} — ${result.title}`);
            passed++;
        } else {
            console.log(`FAIL  ${c.id} — ${result.title}`);
            result.errors.forEach((e) => console.log(e));
            failed++;
        }
    }

    console.log(`\n=== 결과: ${passed} passed, ${failed} failed ===`);
    process.exit(failed > 0 ? 1 : 0);
}

main();
