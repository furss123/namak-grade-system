/**
 * 2022 개정 교육과정 5등급제 · 9등급제(상대평가) · 동점자 처리 엔진
 * index.html processAllGrades() 와 동일 규칙
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.GradeEngine = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const META_KEYS = ['학번', '이름', '학년', '반', '번호', '단위수', '합계', '총점', '총계'];

    const SUBJECT_ORDER = [
        '국어', '공통국어 1', '공통국어2', '공통국어 2',
        '수학', '공통수학 1', '공통수학2', '공통수학 2',
        '영어', '공통영어 1', '공통영어2', '공통영어 2',
        '한국사', '한국사 1', '한국사2', '한국사 2',
        '통합사회', '통합사회 1', '통합사회2', '통합사회 2',
        '통합과학', '통합과학 1', '통합과학2', '통합과학 2',
    ];

    function isExcludedSubjectKey(key) {
        if (!key || META_KEYS.includes(key)) return true;
        const n = String(key).replace(/\s+/g, '');
        return /합계|총점|총계/.test(n);
    }

    function getSubjects(student) {
        const subjects = Object.keys(student).filter((k) => !isExcludedSubjectKey(k));
        return subjects.sort((a, b) => {
            let idxA = SUBJECT_ORDER.indexOf(a);
            let idxB = SUBJECT_ORDER.indexOf(b);
            if (idxA === -1) idxA = 999;
            if (idxB === -1) idxB = 999;
            return idxA - idxB;
        });
    }

    function roundScore(score) {
        let n = Number(score);
        if (isNaN(n)) n = 0;
        return Math.round(n * 100) / 100;
    }

    /** 9등급제: 중간석차 백분율 → 등급 (누적 4·11·23·40·60·77·89·96·100%) */
    function grade9FromIntermediatePercent(percent) {
        const p = Number(percent);
        if (p <= 4) return 1;
        if (p <= 11) return 2;
        if (p <= 23) return 3;
        if (p <= 40) return 4;
        if (p <= 60) return 5;
        if (p <= 77) return 6;
        if (p <= 89) return 7;
        if (p <= 96) return 8;
        return 9;
    }

    function processAllGrades(studentData) {
        const processedGradesCache = {};
        const subjectStatsCache = {};

        if (!studentData || studentData.length === 0) {
            return { processedGradesCache, subjectStatsCache, cutLimits: null };
        }

        const subjects = getSubjects(studentData[0]);
        const totalStudents = studentData.length;
        const cutLimits = {
            N: totalStudents,
            cut1: Math.round(totalStudents * 0.1),
            cut2: Math.round(totalStudents * 0.34),
            cut3: Math.round(totalStudents * 0.66),
            cut4: Math.round(totalStudents * 0.9),
        };

        subjects.forEach((subject) => {
            let rawScores = studentData.map((s) => ({
                id: String(s['학번']),
                score: roundScore(s[subject]),
            }));
            rawScores.sort((a, b) => b.score - a.score);

            let i = 0;
            let currentRank = 1;

            while (i < rawScores.length) {
                let j = i;
                while (j < rawScores.length && rawScores[j].score === rawScores[i].score) j++;

                const tieCount = j - i;
                const highestRank = currentRank;
                const lowestRank = currentRank + tieCount - 1;
                const intermediateRank = highestRank + (tieCount - 1) / 2;
                const intermediateRankPercent = (intermediateRank / totalStudents) * 100;

                let grade = 5;
                let step = 'STEP2';

                if (lowestRank <= cutLimits.cut1) {
                    grade = 1;
                } else if (highestRank > cutLimits.cut1 && lowestRank <= cutLimits.cut2) {
                    grade = 2;
                } else if (highestRank > cutLimits.cut2 && lowestRank <= cutLimits.cut3) {
                    grade = 3;
                } else if (highestRank > cutLimits.cut3 && lowestRank <= cutLimits.cut4) {
                    grade = 4;
                } else if (highestRank > cutLimits.cut4) {
                    grade = 5;
                } else {
                    step = 'STEP3_4';
                    if (intermediateRankPercent <= 10) grade = 1;
                    else if (intermediateRankPercent <= 34) grade = 2;
                    else if (intermediateRankPercent <= 66) grade = 3;
                    else if (intermediateRankPercent <= 90) grade = 4;
                    else grade = 5;
                }

                const rankStr = tieCount > 1 ? `${highestRank}(${tieCount})` : `${highestRank}`;
                const grade9 = grade9FromIntermediatePercent(intermediateRankPercent);

                for (let k = i; k < j; k++) {
                    const studentId = rawScores[k].id;
                    if (!processedGradesCache[studentId]) processedGradesCache[studentId] = {};
                    processedGradesCache[studentId][subject] = {
                        score: rawScores[k].score,
                        rank: highestRank,
                        tieCount,
                        rankStr,
                        interRank: intermediateRank.toFixed(1),
                        intermediateRankPercent: Math.round(intermediateRankPercent * 1000) / 1000,
                        grade,
                        grade9,
                        step,
                        highestRank,
                        lowestRank,
                    };
                }
                currentRank += tieCount;
                i = j;
            }

            const allScoresOnly = rawScores.map((s) => s.score);
            const gradeScores = { 1: [], 2: [], 3: [], 4: [], 5: [] };
            rawScores.forEach((s) => {
                gradeScores[processedGradesCache[s.id][subject].grade].push(s.score);
            });

            const avgNum = allScoresOnly.reduce((a, b) => a + b, 0) / totalStudents;
            const variancePop = allScoresOnly.reduce((sum, x) => sum + (x - avgNum) * (x - avgNum), 0) / totalStudents;
            const stdPop = Math.sqrt(variancePop);

            subjectStatsCache[subject] = {
                avg: avgNum.toFixed(2),
                std: stdPop.toFixed(2),
                max: Math.max(...allScoresOnly).toFixed(2),
                min: Math.min(...allScoresOnly).toFixed(2),
                cut1: gradeScores[1].length ? Math.min(...gradeScores[1]).toFixed(2) : '-',
                cut2: gradeScores[2].length ? Math.min(...gradeScores[2]).toFixed(2) : '-',
                cut3: gradeScores[3].length ? Math.min(...gradeScores[3]).toFixed(2) : '-',
                cut4: gradeScores[4].length ? Math.min(...gradeScores[4]).toFixed(2) : '-',
                allScoresSorted: allScoresOnly,
            };
        });

        return { processedGradesCache, subjectStatsCache, cutLimits };
    }

    return { getSubjects, isExcludedSubjectKey, roundScore, grade9FromIntermediatePercent, processAllGrades, META_KEYS };
});
