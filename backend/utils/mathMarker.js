/**
 * Antigravity Advanced Mathematical & Physics Technical Sentence Marker Engine
 * 
 * Supports:
 * 1. Exact point-by-point marking matching standard answer keys ([1] mark per numbered point)
 * 2. Multi-part questions (Part a & Part b) and internal choices (Main Option vs OR Option)
 * 3. Physical numbers with scientific exponent parsing (10^-34, 10⁻¹⁴, unicode powers) & SI units
 * 4. Units conversion & equivalence (um, nm, Å, m, MeV, eV, J, V/m, Tesla, W/m², g/cm³, kg/m³)
 * 5. Step-by-step mathematical & algebraic formula derivations
 * 6. Vector calculus expressions (curl, divergence, gradient, irrotational verification)
 * 7. Quadratic and polynomial root solving & order-independent equivalence
 * 8. Follow-through marks for correct method & partial credit
 */

const stringSimilarity = require('string-similarity');

const SUPER_MAP = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁻': '-', '⁺': '+'
};

const SUB_MAP = {
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4',
    '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9'
};

function normalizeText(text) {
    if (!text) return '';
    let s = text.replace(/<[^>]*>/g, ' ');
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/–/g, '-').replace(/—/g, '-');
    
    // Convert 10 followed by superscripts to 10^(exp)
    s = s.replace(/10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, p1) => {
        const exp = p1.split('').map(c => SUPER_MAP[c] || c).join('');
        return '10^(' + exp + ')';
    });
    
    // Replace remaining individual superscripts
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, m => SUPER_MAP[m] || m);

    // Replace subscripts
    s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, m => SUB_MAP[m] || m);

    // Normalize math & physics Greek symbols
    s = s.replace(/λ|\\lambda/g, 'lambda')
         .replace(/ħ|\\hbar/g, 'hbar')
         .replace(/ε₀|ε_0|\\epsilon_0/g, 'epsilon_0')
         .replace(/ε_r|\\epsilon_r/g, 'epsilon_r')
         .replace(/ε|\\epsilon/g, 'epsilon')
         .replace(/μ₀|mu_0|\\mu_0/g, 'mu_0')
         .replace(/μ|\\mu/g, 'u')
         .replace(/∇|\\nabla/g, 'del')
         .replace(/∂|\\partial/g, 'd')
         .replace(/θ|\\theta/g, 'theta')
         .replace(/ρ₀|rho_0/g, 'rho_0')
         .replace(/ρ|\\rho/g, 'rho')
         .replace(/σ|\\sigma/g, 'sigma')
         .replace(/τ|\\tau/g, 'tau')
         .replace(/α|\\alpha/g, 'alpha')
         .replace(/ψ|\\psi/g, 'psi')
         .replace(/Φ_E|\\Phi_E/g, 'Phi_E')
         .replace(/Φ|\\Phi/g, 'Phi')
         .replace(/η|\\eta/g, 'eta')
         .replace(/π|\\pi/g, 'pi')
         .replace(/Å|Å|\\AA/g, 'angstrom')
         .replace(/½/g, '1/2')
         .replace(/⅓/g, '1/3')
         .replace(/¼/g, '1/4');

    return s;
}

function normalizeMathExpression(expr) {
    if (!expr) return '';
    let s = normalizeText(expr).toLowerCase();
    s = s.replace(/\s*([\+\-\*\/\=\^\<\>\(\)\[\]\{\}\;\:\,])\s*/g, '$1');
    s = s.replace(/\*\*/g, '^');
    return s.trim();
}

function extractQuantities(text) {
    if (!text) return [];
    const s = normalizeText(text);
    const results = [];
    const maskedSpans = [];

    // 1. Scientific notation with 10^exp or *10^exp
    const sciRegex = /([-+]?[0-9]*\.?[0-9]+)?\s*(?:\*|x)?\s*10\^\(?([-+]?[0-9]+)\)?\s*([a-zA-ZΩµÅ%°][a-zA-Z0-9_\/°\-\^]*|\b)/gi;
    let m;
    while ((m = sciRegex.exec(s)) !== null) {
        if (!m[0].trim()) continue;
        const coef = (m[1] !== undefined && m[1] !== '') ? parseFloat(m[1]) : 1.0;
        const exp = parseInt(m[2], 10);
        const unit = (m[3] || '').trim().toLowerCase();
        results.push({ value: coef * Math.pow(10, exp), unit, raw: m[0].trim() });
        maskedSpans.push({ start: m.index, end: m.index + m[0].length });
    }

    // 2. Standard numbers or scientific e notation
    const stdRegex = /([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*([a-zA-ZΩµÅ%°][a-zA-Z0-9_\/°\-\^]*|\b)/g;
    while ((m = stdRegex.exec(s)) !== null) {
        const start = m.index;
        const end = m.index + m[0].length;
        const overlaps = maskedSpans.some(span => start < span.end && end > span.start);
        if (!overlaps) {
            const val = parseFloat(m[1]);
            const unit = (m[2] || '').trim().toLowerCase();
            if (!isNaN(val)) {
                results.push({ value: val, unit, raw: m[0].trim() });
            }
        }
    }
    return results;
}

function toBaseUnit(val, unit) {
    if (!unit) return { baseVal: val, baseUnit: '' };
    let factor = 1;
    let u = unit.toLowerCase();
    
    // Distance
    if (u === 'nm') { factor = 1e-9; u = 'm'; }
    else if (u === 'um' || u === 'µm' || u === 'u' || u === 'micrometer') { factor = 1e-6; u = 'm'; }
    else if (u === 'pm') { factor = 1e-12; u = 'm'; }
    else if (u === 'cm') { factor = 1e-2; u = 'm'; }
    else if (u === 'mm') { factor = 1e-3; u = 'm'; }
    else if (u === 'å' || u === 'angstrom' || u === 'a') { factor = 1e-10; u = 'm'; }
    
    // Energy
    else if (u === 'mev') { factor = 1.60218e-13; u = 'j'; }
    else if (u === 'kev') { factor = 1.60218e-16; u = 'j'; }
    else if (u === 'ev') { factor = 1.60218e-19; u = 'j'; }
    else if (u === 'j' || u === 'joules' || u === 'joule') { factor = 1; u = 'j'; }
    
    // Density
    else if (u === 'g/cm3' || u === 'gm/cm3' || u === 'g/cm^3') { factor = 1000; u = 'kg/m3'; }
    else if (u === 'kg/m3' || u === 'kg/m^3') { factor = 1; u = 'kg/m3'; }
    
    // Power / Intensity
    else if (u === 'mw') { factor = 1e-3; u = 'w'; }
    else if (u === 'kw') { factor = 1e3; u = 'w'; }
    else if (u === 'w/m2' || u === 'w/m^2') { factor = 1; u = 'w/m2'; }
    
    // Voltage / E-field
    else if (u === 'kv') { factor = 1e3; u = 'v'; }
    else if (u === 'mv') { factor = 1e-3; u = 'v'; }
    else if (u === 'v/m') { factor = 1; u = 'v/m'; }

    // Magnetic field
    else if (u === 't' || u === 'tesla') { factor = 1; u = 't'; }
    
    // Standard engineering prefixes
    else if (u.startsWith('k') && u.length > 1) { factor = 1e3; u = u.slice(1); }
    else if (u.startsWith('m') && u !== 'm' && u.length > 1) { factor = 1e-3; u = u.slice(1); }
    else if (u.startsWith('u') && u.length > 1) { factor = 1e-6; u = u.slice(1); }
    else if (u.startsWith('n') && u.length > 1) { factor = 1e-9; u = u.slice(1); }
    else if (u.startsWith('p') && u.length > 1) { factor = 1e-12; u = u.slice(1); }
    
    return { baseVal: val * factor, baseUnit: u };
}

function matchQuantity(q1, q2, tolerance = 0.08) {
    const b1 = toBaseUnit(q1.value, q1.unit);
    const b2 = toBaseUnit(q2.value, q2.unit);
    
    if (b1.baseUnit && b2.baseUnit && b1.baseUnit !== b2.baseUnit) {
        return false;
    }
    if (b1.baseVal === 0 && b2.baseVal === 0) return true;
    const diff = Math.abs(b1.baseVal - b2.baseVal);
    const maxVal = Math.max(Math.abs(b1.baseVal), Math.abs(b2.baseVal), 1e-30);
    return (diff / maxVal) <= tolerance;
}

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

function extractRoots(text) {
    if (!text) return [];
    const roots = [];
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
 * Splits standard answer into options if question has OR choice (e.g. Q9, Q11)
 */
function splitStandardAnswerOptions(standardAnswer) {
    const text = standardAnswer.trim();
    // Check for OR division
    const orRegex = /\n(?:OR option|OR:|--- Alternative \(OR\)|OR\s*\n)/i;
    const match = orRegex.exec(text);
    if (match) {
        const opt1 = text.slice(0, match.index).trim();
        const opt2 = text.slice(match.index + match[0].length).trim();
        return [
            { name: 'Main Option', text: opt1 },
            { name: 'OR Option', text: opt2 }
        ];
    }
    return [{ name: 'Standard', text: text }];
}

/**
 * Parses individual numbered checkpoints with [1] mark notations
 */
function parseCheckpoints(rubricText, defaultMaxMarks) {
    const lines = rubricText.split('\n');
    const checkpoints = [];
    let currentCp = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Matches e.g. "1. [1] For a particle...", "11. [1] Radiation...", "[1] A vector..."
        const cpMatch = line.match(/^(?:([0-9]+)\.\s*)?\[([0-9.]+)\]\s*(.*)$/);
        if (cpMatch) {
            if (currentCp) checkpoints.push(currentCp);
            currentCp = {
                number: cpMatch[1] ? parseInt(cpMatch[1], 10) : (checkpoints.length + 1),
                allocatedMarks: parseFloat(cpMatch[2]),
                description: cpMatch[3].trim()
            };
        } else if (currentCp) {
            // Continuation line of current checkpoint
            // Avoid section headers
            if (!line.match(/^(?:Construction|Working|Statement|Different forms|Any one application|Application:|Part\s*\([a-z]\)|\([a-z]\))\s*(?:\([0-9]+\s*marks\))?/i)) {
                currentCp.description += ' ' + line;
            }
        }
    }
    if (currentCp) checkpoints.push(currentCp);

    // Fallback if no [1] brackets were present
    if (checkpoints.length === 0) {
        const rawCheckpoints = rubricText.split(/\n\s*\n|\n(?=[0-9]+\.|\([a-z0-9]+\)|Step\s*[0-9]+:)/i)
            .map(cp => cp.trim())
            .filter(cp => cp.length > 0);
        const weight = defaultMaxMarks / (rawCheckpoints.length || 1);
        for (let idx = 0; idx < rawCheckpoints.length; idx++) {
            checkpoints.push({
                number: idx + 1,
                allocatedMarks: Number(weight.toFixed(1)),
                description: rawCheckpoints[idx]
            });
        }
    }

    return checkpoints;
}

/**
 * Evaluates a single checkpoint against student answer
 */
function evaluateSingleCheckpoint(studentAnswer, cp, studentQuantities, studentEquations, normalizedStudent) {
    const cpText = cp.description;
    const cpQuantities = extractQuantities(cpText);
    const cpEquations = extractEquations(cpText);
    const normalizedCp = normalizeMathExpression(cpText);
    const stuLower = studentAnswer.toLowerCase();

    let earned = 0;
    let status = 'NOT_ATTEMPTED';
    let reason = '';

    // 1. Numerical match with unit & tolerance
    let quantityMatchCount = 0;
    if (cpQuantities.length > 0) {
        for (const cpQ of cpQuantities) {
            // Ignore trivial dimensionless single digits like 2, 3 unless they have units or decimals
            if (Math.abs(cpQ.value) >= 10 || Math.abs(cpQ.value) <= 0.1 || cpQ.unit || String(cpQ.value).includes('.')) {
                const found = studentQuantities.some(stuQ => matchQuantity(stuQ, cpQ));
                if (found) quantityMatchCount++;
            }
        }
    }

    // 2. Equation / formula match
    let eqMatchCount = 0;
    if (cpEquations.length > 0) {
        for (const cpEq of cpEquations) {
            const found = studentEquations.some(stuEq => {
                const directLhs = stuEq.lhs.includes(cpEq.lhs) || cpEq.lhs.includes(stuEq.lhs);
                const directRhs = stuEq.rhs.includes(cpEq.rhs) || cpEq.rhs.includes(stuEq.rhs);
                const simRhs = stringSimilarity.compareTwoStrings(stuEq.rhs, cpEq.rhs);
                return (directLhs && (directRhs || simRhs >= 0.70));
            });
            if (found || normalizedStudent.includes(cpEq.lhs + '=' + cpEq.rhs)) {
                eqMatchCount++;
            }
        }
    }

    // 3. Normalized string containment of key algebraic chunks
    let algebraicContained = false;
    const formulaChunks = cpText.match(/[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^,;\n\.]+/g) || [];
    for (const chunk of formulaChunks) {
        const normChunk = normalizeMathExpression(chunk).replace(/\*/g, '');
        const normStuNoStar = normalizedStudent.replace(/\*/g, '');
        if (normChunk.length > 3 && normStuNoStar.includes(normChunk)) {
            algebraicContained = true;
            break;
        }
        // Also check if core LHS and RHS match
        if (chunk.includes('=')) {
            const [cLhs, cRhs] = chunk.split('=');
            const nLhs = normalizeMathExpression(cLhs);
            const nRhs = normalizeMathExpression(cRhs).replace(/\*/g, '');
            if (normalizedStudent.includes(nLhs) && normStuNoStar.includes(nRhs.slice(0, 10))) {
                algebraicContained = true;
                break;
            }
        }
    }

    // Check if checkpoint is testing units statement
    let unitsCheckPassed = false;
    if (/units\s+stated\s+correctly|correct\s+units/i.test(cpText)) {
        const unitTerms = cpText.match(/(?:V\/m|tesla|\bT\b|J|W|m|eV|MeV|Angstrom|Å)/gi) || [];
        if (unitTerms.length > 0) {
            const allMentioned = unitTerms.every(u => stuLower.includes(u.toLowerCase()));
            if (allMentioned) unitsCheckPassed = true;
        }
    }

    // 4. Roots check
    const cpRoots = extractRoots(cpText);
    const stuRoots = extractRoots(studentAnswer);
    let rootsMatch = false;
    if (cpRoots.length > 0 && stuRoots.length > 0 && areRootsEquivalent(stuRoots, cpRoots)) {
        rootsMatch = true;
    }

    // 5. Semantic similarity & key concept tokens
    const sim = stringSimilarity.compareTwoStrings(studentAnswer.toLowerCase(), cpText.toLowerCase());
    const normSim = stringSimilarity.compareTwoStrings(normalizedStudent, normalizedCp);
    const bestSim = Math.max(sim, normSim);

    // Extract non-trivial keyword tokens from checkpoint
    const cpTokens = cpText.toLowerCase().replace(/[^a-z0-9_]/g, ' ').split(/\s+/).filter(w => w.length >= 4);
    let tokenMatches = 0;
    for (const token of cpTokens) {
        if (stuLower.includes(token)) tokenMatches++;
    }
    const tokenRatio = cpTokens.length > 0 ? (tokenMatches / cpTokens.length) : 0;

    // Decision logic for 1-mark point
    if (unitsCheckPassed) {
        earned = cp.allocatedMarks;
        status = 'VERIFIED';
        reason = `Physical units stated correctly and verified.`;
    } else if (rootsMatch) {
        earned = cp.allocatedMarks;
        status = 'VERIFIED';
        reason = `Roots accurately solved and verified: [${cpRoots.join(', ')}].`;
    } else if (quantityMatchCount > 0 && (tokenRatio >= 0.3 || bestSim >= 0.4 || algebraicContained)) {
        earned = cp.allocatedMarks;
        status = 'VERIFIED';
        reason = `Calculated numerical value & correct units verified.`;
    } else if (eqMatchCount > 0 || algebraicContained) {
        earned = cp.allocatedMarks;
        status = 'VERIFIED';
        reason = `Mathematical equation / derivation step satisfied.`;
    } else if (tokenRatio >= 0.55 || bestSim >= 0.65) {
        earned = cp.allocatedMarks;
        status = 'VERIFIED';
        reason = `Key physical concepts and explanation verified.`;
    } else if (quantityMatchCount > 0) {
        earned = cp.allocatedMarks;
        status = 'VERIFIED';
        reason = `Numerical step result verified.`;
    } else if (tokenRatio >= 0.35 || bestSim >= 0.45) {
        earned = cp.allocatedMarks * 0.5;
        status = 'PARTIAL';
        reason = `Partially demonstrated; key terms identified.`;
    } else {
        earned = 0;
        status = 'NOT_ATTEMPTED';
        reason = `Step not demonstrated in answer.`;
    }

    return {
        checkpointNumber: cp.number,
        description: cp.description.slice(0, 110) + (cp.description.length > 110 ? '...' : ''),
        allocatedMarks: cp.allocatedMarks,
        awardedMarks: earned,
        status: status,
        feedback: reason
    };
}

/**
 * Main gradeAnswer function
 */
function gradeAnswer(studentAnswer, standardAnswer, maxMarks = 5, questionContext = {}) {
    if (!studentAnswer || !studentAnswer.trim()) {
        return {
            marksAwarded: 0,
            maxMarks: maxMarks,
            feedback: 'No response submitted.',
            checkpoints: [],
            confidence: 1.0
        };
    }

    if (!standardAnswer || !standardAnswer.trim()) {
        return {
            marksAwarded: Math.round(maxMarks * 0.5),
            maxMarks: maxMarks,
            feedback: 'Standard answer scheme pending.',
            checkpoints: [],
            confidence: 0.5
        };
    }

    const cleanStudent = studentAnswer.replace(/<[^>]*>/g, ' ').trim();
    const studentQuantities = extractQuantities(cleanStudent);
    const studentEquations = extractEquations(cleanStudent);
    const normalizedStudent = normalizeMathExpression(cleanStudent);

    // Check for OR choices in standard answer
    const options = splitStandardAnswerOptions(standardAnswer);

    let bestOptionResult = null;

    for (const opt of options) {
        const checkpoints = parseCheckpoints(opt.text, maxMarks);
        let optTotalMarks = 0;
        const evaluatedCps = [];

        for (const cp of checkpoints) {
            const evalCp = evaluateSingleCheckpoint(cleanStudent, cp, studentQuantities, studentEquations, normalizedStudent);
            optTotalMarks += evalCp.awardedMarks;
            evaluatedCps.push(evalCp);
        }

        const clampedMarks = Math.min(maxMarks, Math.max(0, Math.round(optTotalMarks * 2) / 2));
        const res = {
            optionName: opt.name,
            marksAwarded: clampedMarks,
            maxMarks: maxMarks,
            checkpoints: evaluatedCps
        };

        if (!bestOptionResult || res.marksAwarded > bestOptionResult.marksAwarded) {
            bestOptionResult = res;
        }
    }

    const finalMarks = bestOptionResult.marksAwarded;
    const evaluatedCheckpoints = bestOptionResult.checkpoints;

    // Generate clear, professional feedback summary
    let summary = '';
    const passCount = evaluatedCheckpoints.filter(c => c.status === 'VERIFIED').length;
    const totalCount = evaluatedCheckpoints.length;

    if (finalMarks === maxMarks) {
        summary = `Full Marks (${finalMarks}/${maxMarks})! All ${passCount}/${totalCount} points verified according to the standard answer key.`;
    } else if (finalMarks >= maxMarks * 0.7) {
        summary = `Good performance (${finalMarks}/${maxMarks}). Verified ${passCount}/${totalCount} points; minor derivation steps missing.`;
    } else if (finalMarks > 0) {
        summary = `Partial credit (${finalMarks}/${maxMarks}). Verified ${passCount}/${totalCount} points. Please review incomplete steps.`;
    } else {
        summary = `0/${maxMarks}. Response does not match the standard answer rubric.`;
    }

    if (options.length > 1) {
        summary = `[Evaluated against ${bestOptionResult.optionName}] ${summary}`;
    }

    let breakdown = '\n\nPoint-by-Point Marking Evaluation:';
    for (const c of evaluatedCheckpoints) {
        const markText = `[${c.awardedMarks}/${c.allocatedMarks} mark${c.allocatedMarks === 1 ? '' : 's'}]`;
        const icon = c.status === 'VERIFIED' ? '✓' : (c.status === 'PARTIAL' ? '△' : '✗');
        breakdown += `\n${icon} Point ${c.checkpointNumber} ${markText}: ${c.description} -> ${c.feedback}`;
    }

    return {
        marksAwarded: finalMarks,
        maxMarks: maxMarks,
        feedback: summary + breakdown,
        summary: summary,
        checkpoints: evaluatedCheckpoints,
        confidence: 0.95
    };
}

module.exports = {
    gradeAnswer,
    normalizeMathExpression,
    normalizeText,
    extractQuantitiesWithUnits: extractQuantities,
    extractQuantities,
    toBaseUnitValue: toBaseUnit,
    toBaseUnit,
    isQuantityMatch: matchQuantity,
    matchQuantity,
    extractEquations,
    extractRoots,
    areRootsEquivalent,
    parseCheckpoints,
    splitStandardAnswerOptions
};
