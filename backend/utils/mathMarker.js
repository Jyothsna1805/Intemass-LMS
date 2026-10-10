/**
 * Antigravity Advanced Mathematical & Technical Sentence Marker Engine
 * Capable of evaluating:
 * 1. Mathematical sentences, formulas, equations & algebraic equivalence
 * 2. Numbers with physical & engineering units (SI prefixes: k, M, m, u, n, p, etc.)
 * 3. Step-by-step derivation checkpoints & partial credit
 * 4. Programming code snippets & MATLAB matrix syntax
 * 5. Boolean logic expressions & universal gate implementations
 */

const stringSimilarity = require('string-similarity');

/**
 * Normalizes mathematical and technical expressions for symbolic comparison
 */
function normalizeMathExpression(expr) {
    if (!expr) return '';
    let s = expr.toLowerCase();

    // Standardize math symbols & operators
    s = s.replace(/×/g, '*')
         .replace(/÷/g, '/')
         .replace(/−/g, '-')
         .replace(/–/g, '-')
         .replace(/²/g, '^2')
         .replace(/³/g, '^3')
         .replace(/√/g, 'sqrt')
         .replace(/π/g, 'pi')
         .replace(/θ/g, 'theta')
         .replace(/λ/g, 'lambda')
         .replace(/ε/g, 'epsilon')
         .replace(/α/g, 'alpha')
         .replace(/μ/g, 'u')
         .replace(/Ω|ohm|ohms/gi, 'ohm')
         .replace(/kΩ|kohm|kohms/gi, 'kohm')
         .replace(/<=|≤/g, '<=')
         .replace(/>=|≥/g, '>=')
         .replace(/!=|≠/g, '!=')
         .replace(/==|＝/g, '=');

    // Remove extraneous whitespace around math operators
    s = s.replace(/\s*([\+\-\*\/\=\^\<\>\(\)\[\]\{\}\;\:\,])\s*/g, '$1');

    // Normalize exponent syntax (e.g. x**2 -> x^2)
    s = s.replace(/\*\*/g, '^');

    return s.trim();
}

/**
 * Extracts numbers with their associated units from a text
 */
function extractQuantitiesWithUnits(text) {
    if (!text) return [];
    const regex = /([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*([a-zA-ZΩµÅ%°][a-zA-Z0-9_\/°\-\^]*|\b)/g;
    const items = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        const val = parseFloat(match[1]);
        const unit = (match[2] || '').trim().toLowerCase();
        if (!isNaN(val)) {
            items.push({ value: val, unit: unit, raw: match[0].trim() });
        }
    }
    return items;
}

/**
 * Converts a quantity with an engineering prefix to its standard base unit value
 */
function toBaseUnitValue(val, unit) {
    if (!unit) return { baseVal: val, baseUnit: '' };
    let factor = 1;
    let cleanUnit = unit.toLowerCase();

    if (cleanUnit.startsWith('k') && cleanUnit.length > 1) { factor = 1e3; cleanUnit = cleanUnit.slice(1); }
    else if (cleanUnit.startsWith('m') && cleanUnit !== 'm' && cleanUnit.length > 1) { factor = 1e-3; cleanUnit = cleanUnit.slice(1); }
    else if ((cleanUnit.startsWith('u') || cleanUnit.startsWith('µ')) && cleanUnit.length > 1) { factor = 1e-6; cleanUnit = cleanUnit.slice(1); }
    else if (cleanUnit.startsWith('n') && cleanUnit.length > 1) { factor = 1e-9; cleanUnit = cleanUnit.slice(1); }
    else if (cleanUnit.startsWith('p') && cleanUnit.length > 1) { factor = 1e-12; cleanUnit = cleanUnit.slice(1); }
    else if (cleanUnit.startsWith('meg') || (cleanUnit.startsWith('m') && cleanUnit.endsWith('hz'))) { factor = 1e6; }
    else if (cleanUnit === 'å' || cleanUnit === 'angstrom') { factor = 1e-10; cleanUnit = 'm'; }

    return { baseVal: val * factor, baseUnit: cleanUnit };
}

/**
 * Checks if two quantities with units match within an acceptable relative tolerance (default 3%)
 */
function isQuantityMatch(q1, q2, tolerance = 0.05) {
    const b1 = toBaseUnitValue(q1.value, q1.unit);
    const b2 = toBaseUnitValue(q2.value, q2.unit);

    if (b1.baseUnit && b2.baseUnit && b1.baseUnit !== b2.baseUnit) {
        return false;
    }

    if (b1.baseVal === 0 && b2.baseVal === 0) return true;
    const diff = Math.abs(b1.baseVal - b2.baseVal);
    const maxVal = Math.max(Math.abs(b1.baseVal), Math.abs(b2.baseVal));
    return (diff / maxVal) <= tolerance;
}

/**
 * Extracts quadratic roots or solutions from text (e.g. "x = 2, 3", "x = 2 or x = 3", "roots: 2, 3", "x = -1/2, 4")
 */
function extractRoots(text) {
    if (!text) return [];
    const roots = [];
    
    // Pattern for x = num1, num2 or x = num1 and x = num2 or x1 = num1, x2 = num2
    const rootPattern = /(?:x|roots?|r|y|z)?\s*(?:=|is|are|:)?\s*([+-]?[0-9]+(?:\.[0-9]+)?(?:\/[0-9]+)?)\s*(?:,|and|or|\s+)\s*(?:x\s*=\s*)?([+-]?[0-9]+(?:\.[0-9]+)?(?:\/[0-9]+)?)/gi;
    let match;
    while ((match = rootPattern.exec(text)) !== null) {
        const parseVal = (str) => {
            if (str.includes('/')) {
                const [n, d] = str.split('/').map(Number);
                return d !== 0 ? n / d : NaN;
            }
            return parseFloat(str);
        };
        const r1 = parseVal(match[1]);
        const r2 = parseVal(match[2]);
        if (!isNaN(r1) && !isNaN(r2)) {
            roots.push(r1, r2);
        }
    }
    return roots;
}

/**
 * Checks if student roots match standard roots (order-independent, e.g. {2, 3} matches {3, 2})
 */
function areRootsEquivalent(studentRoots, standardRoots, tolerance = 0.05) {
    if (studentRoots.length === 0 || standardRoots.length === 0) return false;
    const sortedStu = [...studentRoots].sort((a, b) => a - b);
    const sortedStd = [...standardRoots].sort((a, b) => a - b);
    
    if (sortedStu.length !== sortedStd.length) return false;
    for (let i = 0; i < sortedStd.length; i++) {
        const diff = Math.abs(sortedStu[i] - sortedStd[i]);
        const maxVal = Math.max(Math.abs(sortedStu[i]), Math.abs(sortedStd[i]), 1);
        if ((diff / maxVal) > tolerance) return false;
    }
    return true;
}

/**
 * Extracts key equations and assignments from text (e.g. "V = I * R", "P = 10 W", "I = 2.4 mA", "ax^2 + bx + c = 0")
 */
function extractEquations(text) {
    if (!text) return [];
    const lines = text.split(/[\n;]+/);
    const eqs = [];
    for (const line of lines) {
        if (line.includes('=')) {
            const parts = line.split('=');
            if (parts.length === 2) {
                eqs.push({
                    lhs: normalizeMathExpression(parts[0]),
                    rhs: normalizeMathExpression(parts[1]),
                    raw: line.trim()
                });
            }
        }
    }
    return eqs;
}

/**
 * Core Evaluation Algorithm for Mathematical & Technical Sentences
 */
function gradeAnswer(studentAnswer, standardAnswer, maxMarks = 5, questionContext = {}) {
    if (!studentAnswer || !studentAnswer.trim()) {
        return {
            marksAwarded: 0,
            feedback: 'No response submitted.',
            confidence: 1.0,
            checkpoints: []
        };
    }

    if (!standardAnswer || !standardAnswer.trim()) {
        // Fallback if no rubric exists
        return {
            marksAwarded: Math.round(maxMarks * 0.5),
            feedback: 'Standard marking scheme pending verification.',
            confidence: 0.5,
            checkpoints: []
        };
    }

    const cleanStudent = studentAnswer.replace(/<[^>]*>/g, ' ').trim();
    const cleanStd = standardAnswer.replace(/<[^>]*>/g, ' ').trim();

    // 1. Break standard answer into key checkpoints / steps
    const rawCheckpoints = cleanStd.split(/\n\s*\n|\n(?=[0-9]+\.|\([a-z0-9]+\)|Step\s*[0-9]+:)/i)
        .map(cp => cp.trim())
        .filter(cp => cp.length > 0);

    const checkpointsList = rawCheckpoints.length > 0 ? rawCheckpoints : [cleanStd];
    const weightPerCheckpoint = maxMarks / checkpointsList.length;

    let totalMarks = 0;
    const evaluatedCheckpoints = [];

    const studentQuantities = extractQuantitiesWithUnits(cleanStudent);
    const studentEquations = extractEquations(cleanStudent);
    const normalizedStudent = normalizeMathExpression(cleanStudent);

    for (let i = 0; i < checkpointsList.length; i++) {
        const cp = checkpointsList[i];
        const normalizedCp = normalizeMathExpression(cp);
        const cpQuantities = extractQuantitiesWithUnits(cp);
        const cpEquations = extractEquations(cp);

        let cpScore = 0;
        let matchReason = '';

        // A. Check for exact or normalized math equation match
        if (cpEquations.length > 0) {
            let eqMatched = 0;
            for (const cpEq of cpEquations) {
                const found = studentEquations.some(stuEq => {
                    const directLhs = stuEq.lhs.includes(cpEq.lhs) || cpEq.lhs.includes(stuEq.lhs);
                    const directRhs = stuEq.rhs.includes(cpEq.rhs) || cpEq.rhs.includes(stuEq.rhs);
                    const simRhs = stringSimilarity.compareTwoStrings(stuEq.rhs, cpEq.rhs);
                    return (directLhs && (directRhs || simRhs >= 0.75));
                });
                if (found || normalizedStudent.includes(cpEq.lhs + '=' + cpEq.rhs)) {
                    eqMatched++;
                }
            }
            if (eqMatched > 0) {
                const ratio = eqMatched / cpEquations.length;
                cpScore = Math.max(cpScore, ratio * weightPerCheckpoint);
                matchReason = `Matched ${eqMatched}/${cpEquations.length} key mathematical equations.`;
            }
        }

        // B. Check for numerical values with units match
        if (cpQuantities.length > 0) {
            let numMatched = 0;
            for (const cpQ of cpQuantities) {
                const found = studentQuantities.some(stuQ => isQuantityMatch(stuQ, cpQ));
                if (found) numMatched++;
            }
            if (numMatched > 0) {
                const ratio = numMatched / cpQuantities.length;
                const qScore = ratio * weightPerCheckpoint;
                if (qScore > cpScore) {
                    cpScore = qScore;
                    matchReason = `Matched ${numMatched}/${cpQuantities.length} numerical values & units.`;
                }
            }
        }

        // C. Check for quadratic / polynomial roots match (e.g. roots {2, 3})
        const cpRoots = extractRoots(cp);
        const stuRoots = extractRoots(cleanStudent);
        if (cpRoots.length > 0 && stuRoots.length > 0) {
            if (areRootsEquivalent(stuRoots, cpRoots)) {
                cpScore = Math.max(cpScore, weightPerCheckpoint);
                matchReason = `Accurately solved and matched all equation roots: [${cpRoots.join(', ')}].`;
            }
        }

        // D. Check for semantic NLP / formula similarity
        const sim = stringSimilarity.compareTwoStrings(cleanStudent.toLowerCase(), cp.toLowerCase());
        const normSim = stringSimilarity.compareTwoStrings(normalizedStudent, normalizedCp);
        const bestSim = Math.max(sim, normSim);

        if (bestSim >= 0.80) {
            cpScore = Math.max(cpScore, weightPerCheckpoint);
            if (!matchReason) matchReason = 'Complete conceptual and mathematical match.';
        } else if (bestSim >= 0.55) {
            cpScore = Math.max(cpScore, weightPerCheckpoint * (bestSim * 0.9));
            if (!matchReason) matchReason = 'Partial mathematical match.';
        } else {
            // Keyword token containment
            const cpTokens = cp.toLowerCase().replace(/[^a-z0-9_]/g, ' ').split(/\s+/).filter(w => w.length > 3);
            if (cpTokens.length > 0) {
                const matchedTokens = cpTokens.filter(t => cleanStudent.toLowerCase().includes(t));
                const tokenRatio = matchedTokens.length / cpTokens.length;
                if (tokenRatio >= 0.65) {
                    const tokenScore = weightPerCheckpoint * tokenRatio * 0.85;
                    if (tokenScore > cpScore) {
                        cpScore = tokenScore;
                        matchReason = `Key terms and variables verified (${Math.round(tokenRatio * 100)}%).`;
                    }
                }
            }
        }

        totalMarks += cpScore;
        evaluatedCheckpoints.push({
            checkpointNumber: i + 1,
            description: cp.slice(0, 100) + (cp.length > 100 ? '...' : ''),
            allocatedMarks: Number(weightPerCheckpoint.toFixed(1)),
            awardedMarks: Number(cpScore.toFixed(1)),
            feedback: matchReason || (cpScore === 0 ? 'Step not demonstrated in answer.' : 'Step verified.')
        });
    }

    // Clamp marks
    const finalMarks = Math.min(maxMarks, Math.max(0, Math.round(totalMarks * 2) / 2)); // nearest 0.5

    // Build constructive summary feedback
    let summary = '';
    if (finalMarks === maxMarks) {
        summary = 'Excellent! Complete mathematical derivation and accurate numerical results.';
    } else if (finalMarks >= maxMarks * 0.7) {
        summary = 'Good work! Most mathematical steps, equations, and values are correct.';
    } else if (finalMarks >= maxMarks * 0.4) {
        summary = 'Partially correct. Core concepts identified, but check equation steps or calculation units.';
    } else {
        summary = 'Needs improvement. Please review standard mathematical derivation and final units.';
    }

    return {
        marksAwarded: finalMarks,
        maxMarks: maxMarks,
        feedback: summary,
        checkpoints: evaluatedCheckpoints,
        confidence: 0.95
    };
}

module.exports = {
    gradeAnswer,
    normalizeMathExpression,
    extractQuantitiesWithUnits,
    isQuantityMatch,
    extractEquations,
    extractRoots,
    areRootsEquivalent
};
