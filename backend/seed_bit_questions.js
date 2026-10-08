/**
 * Bhilai Institute of Technology (BIT) - 1 Nov 2026 Curriculum Seeder
 * Seeds comprehensive questions, standard answers, marking rubrics, and assignments for:
 * 1. Physics (PHYS 1038)
 * 2. Basic Electrical and Electronics Engineering (ECEG-1013)
 * 3. Programming for Engineers / MATLAB (MECH 2078)
 */

const { query, execute } = require('./db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

const bitQuestionsData = [
    // -------------------------------------------------------------
    // 1. PHYSICS (PHYS 1038)
    // -------------------------------------------------------------
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Electron trapped in a one-dimensional potential box of length 10 nm makes a transition from 3rd excited state to 2nd excited state. Determine the wavelength of the corresponding electromagnetic radiation emitted.',
        standardAnswer: `1. Energy of nth level in 1D box: E_n = (n^2 * h^2) / (8 * m * L^2)
2. State identification: 3rd excited state corresponds to n = 4; 2nd excited state corresponds to n = 3.
3. Energy difference: Delta E = E_4 - E_3 = (4^2 - 3^2) * (h^2) / (8 * m * L^2) = 7 * h^2 / (8 * m * L^2)
4. Values substitution: h = 6.63e-34 J.s, m = 9.1e-31 kg, L = 10 nm = 10e-9 m = 1e-8 m
Delta E = 7 * (6.63e-34)^2 / (8 * 9.1e-31 * 1e-16) = 4.22e-21 Joules (or 0.0264 eV)
5. Wavelength calculation: lambda = (h * c) / Delta E = (6.63e-34 * 3e8) / 4.22e-21 = 4.71e-5 m = 47.1 um (Infrared region).`
    },
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'State the conditions for a well-behaved quantum mechanical wave function psi(x).',
        standardAnswer: `A physically acceptable (well-behaved) wave function psi(x) must satisfy the following boundary and continuity conditions:
1. Single-valued: psi(x) must have only one unique value at any given point in space.
2. Continuous: psi(x) and its first spatial derivative d(psi)/dx must be continuous everywhere.
3. Finite / Square-Integrable: psi(x) must approach zero as x -> +- infinity so that total probability integral from -inf to +inf |psi(x)|^2 dx = 1 (Normalizability).
4. Non-zero: psi(x) must not be identically zero everywhere.`
    },
    {
        subject: 'Physics',
        subCategory: 'Crystallography',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Draw the planes (1 2 1) and (2 3 4) on a simple cubic lattice.',
        standardAnswer: `1. Miller Indices to Intercepts:
- Plane (1 2 1): Reciprocals of indices gives intercepts on x, y, z axes as (1/1, 1/2, 1/1) = (1a, 0.5a, 1a).
- Plane (2 3 4): Reciprocals gives intercepts as (1/2, 1/3, 1/4) = (0.5a, 0.33a, 0.25a).
2. Sketch steps: Draw a unit cube of side 'a', mark the intercept points on the coordinate axes, and connect the intercept coordinates to form the triangular crystal plane within the cubic lattice.`
    },
    {
        subject: 'Physics',
        subCategory: 'Optics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Differentiate between Fraunhofer and Fresnel class of diffraction.',
        standardAnswer: `1. Source and Screen Distance: In Fresnel diffraction, source and screen are at finite distances from the obstacle. In Fraunhofer diffraction, source and screen are effectively at infinite distances.
2. Incident Wavefront: Fresnel uses spherical or cylindrical wavefronts; Fraunhofer uses plane wavefronts.
3. Lenses: No lenses required in Fresnel diffraction; Convex lenses are required in Fraunhofer diffraction to focus parallel rays.
4. Center of Pattern: In Fresnel, center may be bright or dark depending on distance; in Fraunhofer, central maxima is always bright.`
    },
    {
        subject: 'Physics',
        subCategory: 'Electrodynamics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Show that the vector F = (6xy + z^3)i + (3x^2 - z)j + (3xz^2 - y)k is irrotational.',
        standardAnswer: `A vector field F is irrotational if its curl is zero (curl F = del x F = 0).
Computing components of curl F = del x F:
i component: d/dy(3xz^2 - y) - d/dz(3x^2 - z) = -1 - (-1) = 0
j component: d/dz(6xy + z^3) - d/dx(3xz^2 - y) = 3z^2 - 3z^2 = 0
k component: d/dx(3x^2 - z) - d/dy(6xy + z^3) = 6x - 6x = 0
Since curl F = 0i + 0j + 0k = 0, the vector field F is strictly irrotational.`
    },
    {
        subject: 'Physics',
        subCategory: 'Lasers',
        type: 'essay',
        maxMarks: 10,
        questionText: 'One of the most used and safest lasers is the He-Ne laser. Discuss in detail the construction and working of He-Ne LASER.',
        standardAnswer: `1. Construction: Consists of a quartz discharge tube filled with Helium (He) and Neon (Ne) gases in 10:1 ratio at low pressure (~1 torr). Optical cavity formed by two parallel mirrors (one 100% reflective, one 99% partially transmissive).
2. Pumping Mechanism: Electric discharge / electron collision excites He atoms to metastable states 2^1S and 2^3S (20.61 eV and 19.81 eV).
3. Resonant Energy Transfer: He atoms collide with ground state Ne atoms, transferring energy non-radiatively to Ne 3s and 2s levels having matching energy levels.
4. Population Inversion & Lasing Action: Population inversion achieved between Ne 3s/2s levels and lower 2p levels. Stimulated emission transition from 3s2 -> 2p4 emits coherent red laser beam at wavelength lambda = 632.8 nm.
5. De-excitation: Atoms in 2p level undergo spontaneous transition to 1s level and depopulate back to ground state via tube wall collisions.`
    },
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'State the uncertainty principle. Write its different forms (in terms of different conjugate variables) and describe any one application of the uncertainty principle.',
        standardAnswer: `1. Statement: It is fundamentally impossible to simultaneously determine with infinite precision both the exact position and momentum of a subatomic particle.
2. Mathematical Forms (Conjugate Variables):
- Position and Linear Momentum: Delta x * Delta p_x >= h_bar / 2 (or h / 4*pi)
- Energy and Time: Delta E * Delta t >= h_bar / 2
- Angular Position and Angular Momentum: Delta theta * Delta L_z >= h_bar / 2
3. Application (Non-existence of electron inside nucleus): Radius of nucleus ~ 1e-14 m -> Delta x = 1e-14 m. By uncertainty principle, minimum momentum Delta p >= h_bar / (2 * Delta x) = 5.27e-21 kg.m/s. Corresponding relativistic energy E >= c * Delta p ~ 9.8 MeV. Since beta particles emitted have energies < 4 MeV, free electrons cannot reside inside the nucleus.`
    },
    {
        subject: 'Physics',
        subCategory: 'Crystallography',
        type: 'essay',
        maxMarks: 10,
        questionText: 'What is Atomic Packing Fraction (APF)? Obtain APF for FCC crystal.',
        standardAnswer: `1. Definition: Atomic Packing Fraction (APF) is the ratio of the volume occupied by constituent atoms in a unit cell to the total volume of the unit cell: APF = (N_atoms * V_atom) / V_unit_cell.
2. FCC Geometry Derivation:
- Number of effective atoms per FCC unit cell: N = (8 corners * 1/8) + (6 face centers * 1/2) = 1 + 3 = 4 atoms.
- Relationship between lattice parameter 'a' and atomic radius 'r': Face diagonal = 4r = a * sqrt(2) => a = (4r) / sqrt(2) = 2*sqrt(2)*r.
- Volume of atoms: V_atoms = 4 * (4/3 * pi * r^3) = (16/3) * pi * r^3.
- Volume of unit cell: V_cell = a^3 = (2*sqrt(2)*r)^3 = 16*sqrt(2) * r^3.
- APF Calculation: APF = [(16/3) * pi * r^3] / [16*sqrt(2) * r^3] = pi / (3 * sqrt(2)) = 0.7404 = 74%.`
    },
    {
        subject: 'Physics',
        subCategory: 'Electrodynamics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'What is displacement current? Derive the modified Ampere’s law with Maxwell’s correction to it.',
        standardAnswer: `1. Displacement Current: Maxwell proposed that a time-varying electric field produces a magnetic field, equivalent to a current termed displacement current density: J_d = epsilon_0 * (dE / dt).
2. Inconsistency of Ampere's Law: Ampere's law curl B = mu_0 * J violates continuity equation for time-varying fields because div(curl B) = 0, but div(J) = -d(rho)/dt != 0.
3. Maxwell's Correction Derivation:
- By Gauss's Law: div E = rho / epsilon_0 => rho = epsilon_0 * div E.
- Differentiating with respect to time: d(rho)/dt = epsilon_0 * div(dE/dt).
- From continuity equation: div J + d(rho)/dt = 0 => div J + div(epsilon_0 * dE/dt) = 0 => div[ J + epsilon_0 * dE/dt ] = 0.
- Defining total current J_total = J_c + J_d = J + epsilon_0 * (dE / dt).
4. Modified Ampere-Maxwell Law: curl B = mu_0 * (J + epsilon_0 * (dE / dt)). Integral form: oint B.dl = mu_0 * (I_c + epsilon_0 * d(Phi_E)/dt).`
    },

    // -------------------------------------------------------------
    // 2. BASIC ELECTRICAL AND ELECTRONICS ENGINEERING (ECEG-1013)
    // -------------------------------------------------------------
    {
        subject: 'Basic Electronics',
        subCategory: 'Semiconductor Devices',
        type: 'essay',
        maxMarks: 4,
        questionText: 'What is an intrinsic semiconductor, and how does it differ from an extrinsic semiconductor?',
        standardAnswer: `1. Intrinsic Semiconductor: Pure semiconductor crystal (e.g. pure Si or Ge) with no intentional impurities. Charge carrier concentrations are equal: n = p = n_i. Conductivity is low at room temperature and determined solely by thermally generated electron-hole pairs.
2. Extrinsic Semiconductor: Doped semiconductor formed by adding pentavalent (n-type, donor, n >> p) or trivalent (p-type, acceptor, p >> n) impurities.
3. Key Differences:
- Doping: Intrinsic has 0% impurity; Extrinsic has controlled dopants (~1 in 10^6).
- Majority Carriers: Intrinsic has equal electrons and holes; Extrinsic has predominant majority carriers.
- Fermi Level: Intrinsic Fermi level lies at the middle of band gap; Extrinsic Fermi level shifts towards conduction band (n-type) or valence band (p-type).`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Circuit Theory',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Determine the current I in the circuit shown with E1 = 24 V, E2 = 4 V, R = 2 kOhm. Assume the diodes are silicon (threshold 0.7 V) and forward resistance of diodes is zero.',
        standardAnswer: `1. Diode State Analysis: E1 (24 V) applies positive potential to anode of D1 and cathode of D2.
- Diode D1 is Forward Biased (ON state with voltage drop V_D = 0.7 V).
- Diode D2 is Reverse Biased (OFF / Open Circuit).
2. KVL Equation around active loop:
E1 - I*R - V_D1 - E2 = 0
24 V - I * (2000 ohm) - 0.7 V - 4 V = 0
3. Current Computation:
I * 2000 = 24 - 4 - 0.7 = 19.3 V
I = 19.3 / 2000 A = 0.00965 A = 9.65 mA.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Circuit Theory',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Differentiate Kirchhoff’s current law (KCL) and voltage law (KVL) using an example.',
        standardAnswer: `1. Kirchhoff’s Current Law (KCL):
- Principle: Conservation of electric charge.
- Statement: Algebraic sum of currents entering and leaving any node/junction is zero: sum(I_in) = sum(I_out).
- Example: At node A with branches I1 entering, I2 and I3 leaving: I1 = I2 + I3.
2. Kirchhoff’s Voltage Law (KVL):
- Principle: Conservation of energy.
- Statement: Algebraic sum of all voltages (EMFs and IR drops) around any closed loop is zero: sum(V) = 0.
- Example: In a series loop with battery V_s and resistors R1, R2: V_s - I*R1 - I*R2 = 0.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Digital Logic',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Convert the following: (a) (100101.001)_2 = (?)_16 = (?)_10 = (?)_8 (b) (1110101)_Gray = (?)_Binary = (?)_10',
        standardAnswer: `Part (a) Binary (100101.001)_2:
1. Hexadecimal: Group in 4s -> (0010 0101 . 0010)_2 = (25.2)_16
2. Decimal: 32 + 4 + 1 + 0.125 = (37.125)_10
3. Octal: Group in 3s -> (100 101 . 001)_2 = (45.1)_8

Part (b) Gray Code (1110101)_Gray to Binary:
MSB = 1.
B2 = 1 XOR 1 = 0
B3 = 0 XOR 1 = 1
B4 = 1 XOR 0 = 1
B5 = 1 XOR 1 = 0
B6 = 0 XOR 0 = 0
B7 = 0 XOR 1 = 1
Binary = (1011001)_2
Decimal = 64 + 16 + 8 + 1 = (89)_10.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Circuit Theory',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Derive the expression for the maximum power transferred to the load in a circuit. Under what condition does maximum power transfer occur to the load?',
        standardAnswer: `1. Condition: Maximum power transfer occurs from source to load when Load Resistance equals Thevenin Source Resistance: R_L = R_th.
2. Derivation:
- Current in circuit: I = V_th / (R_th + R_L)
- Power delivered to load: P_L = I^2 * R_L = [ V_th^2 * R_L ] / (R_th + R_L)^2
- Differentiating P_L with respect to R_L and equating to 0:
dP_L / dR_L = V_th^2 * [ (R_th + R_L)^2 - 2*R_L*(R_th + R_L) ] / (R_th + R_L)^4 = 0
=> (R_th + R_L) - 2*R_L = 0 => R_L = R_th.
3. Maximum Power Expression:
P_max = [ V_th^2 * R_th ] / (2 * R_th)^2 = V_th^2 / (4 * R_th).`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Analog Electronics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'In a bridge full wave rectifier circuit, assume Load resistance RL= 400 Ohm, transformer turn ratio = 8:1 (with primary 230V), forward resistance Rf of each diode is 1 Ohm. Determine: (i) Maximum current Im (ii) Average or DC current (iii) RMS current (iv) Output DC voltage (v) AC and DC power.',
        standardAnswer: `1. Secondary Voltage: V_rms = 230 / 8 = 28.75 V. Peak voltage V_m = V_rms * sqrt(2) = 28.75 * 1.414 = 40.66 V.
2. (i) Peak Current (Im): Two diodes conduct simultaneously:
I_m = V_m / (2*R_f + R_L) = 40.66 / (2*1 + 400) = 40.66 / 402 = 0.1011 A = 101.1 mA.
3. (ii) DC / Average Current (Idc):
I_dc = (2 * I_m) / pi = (2 * 0.1011) / 3.1416 = 0.0644 A = 64.4 mA.
4. (iii) RMS Current (Irms):
I_rms = I_m / sqrt(2) = 0.1011 / 1.414 = 0.0715 A = 71.5 mA.
5. (iv) Output DC Voltage (Vdc):
V_dc = I_dc * R_L = 0.0644 A * 400 ohm = 25.76 V.
6. (v) DC & AC Power:
- DC Power: P_dc = I_dc^2 * R_L = (0.0644)^2 * 400 = 1.66 Watts.
- AC Input Power: P_ac = I_rms^2 * (2*R_f + R_L) = (0.0715)^2 * 402 = 2.05 Watts.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Digital Logic',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Design NOT, AND and OR Logic Gates using NAND Universal Logic Gate.',
        standardAnswer: `1. NOT Gate using NAND:
Connect both inputs of a 2-input NAND gate together to signal A.
Expression: Output Y = (A . A)' = A'.

2. AND Gate using NAND:
Pass inputs A and B through a NAND gate, then invert the output with a second NAND gate configured as NOT.
Expression: Y = [ (A . B)' ]' = A . B (requires 2 NAND gates).

3. OR Gate using NAND:
Invert input A using NAND-NOT to get A'. Invert input B using NAND-NOT to get B'. Feed A' and B' into a third NAND gate.
Expression by De Morgan's Law: Y = (A' . B')' = A'' + B'' = A + B (requires 3 NAND gates).`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Transformers & Machines',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Attempt both parts: (a) Explain the concept of turns ratio in a transformer and its significance. (b) A 100 kVA, 6000/400V, 50 Hz single phase transformer has 100 turns in the secondary. Find (i) Number of turns in primary coil (ii) Maximum flux in the core.',
        standardAnswer: `Part (a) Turns Ratio:
Turns ratio k = N2 / N1 = V2 / V1 = I1 / I2.
- Step-Up Transformer: N2 > N1 (k > 1), Output voltage V2 > V1.
- Step-Down Transformer: N2 < N1 (k < 1), Output voltage V2 < V1.

Part (b) Calculations:
Given: Rating = 100 kVA, V1 = 6000 V, V2 = 400 V, f = 50 Hz, N2 = 100 turns.
(i) Primary turns N1:
N1 / N2 = V1 / V2 => N1 = N2 * (V1 / V2) = 100 * (6000 / 400) = 1500 turns.
(ii) Maximum flux Phi_m in core:
EMF equation: E2 = 4.44 * f * N2 * Phi_m
400 = 4.44 * 50 * 100 * Phi_m = 22200 * Phi_m
Phi_m = 400 / 22200 = 0.01802 Wb = 18.02 milliWebers.`
    },

    // -------------------------------------------------------------
    // 3. PROGRAMMING FOR ENGINEERS / MATLAB (MECH 2078)
    // -------------------------------------------------------------
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Linear Algebra',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Write a MATLAB script to create a current matrix for a system of linear equations with resistance matrix R = [10, 5, 3; 4, 12, 2; 6, 3, 15] and voltage matrix V = [30; 24; 42] to compute the current values.',
        standardAnswer: `% MATLAB Script for Current Vector Computation
R = [10, 5, 3; 4, 12, 2; 6, 3, 15];
V = [30; 24; 42];

% Compute current vector I using matrix left division (Gaussian elimination)
I = R \\ V;

% Display the current values
disp('Computed Current Values (Amperes):');
disp(I);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Basics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Write a MATLAB script to calculate and display the kinetic energy of a moving object given mass = 1,000 kg and speed = 20 m/s (Formula: K = 1/2 * mass * Vel^2).',
        standardAnswer: `% MATLAB Script to Compute Kinetic Energy
mass = 1000; % mass in kg
velocity = 20; % speed in m/s

% Formula: K = 0.5 * mass * velocity^2
kinetic_energy = 0.5 * mass * (velocity^2);

fprintf('The Kinetic Energy of the car is: %.2f Joules (%.2f kJ)\\n', kinetic_energy, kinetic_energy/1000);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Graphics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Explain the difference between plot, scatter, and bar functions in MATLAB. When would you choose each type of plot?',
        standardAnswer: `1. plot(x, y): Creates a 2D line plot connecting sequential data points with straight line segments. Used for continuous functions, time-series data, and mathematical waveforms.
2. scatter(x, y): Displays individual discrete data markers without connecting lines. Used to identify correlations, data distributions, clusters, and regression trends.
3. bar(x, y): Creates vertical rectangular bars proportional in height to the values. Used for discrete categorical comparisons, histogram frequencies, and survey results.`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Control Flow',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Explain the syntax of ‘switch’ and ‘while’ control with an example for each.',
        standardAnswer: `1. switch Statement Syntax:
switch switch_expression
    case case_expression_1
        statements_1;
    case case_expression_2
        statements_2;
    otherwise
        default_statements;
end

Example:
grade = 'A';
switch grade
    case 'A', disp('Excellent');
    case 'B', disp('Good');
    otherwise, disp('Pass');
end

2. while Loop Syntax:
while condition
    statements;
    update_variable;
end

Example:
count = 1;
while count <= 5
    disp(count);
    count = count + 1;
end`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Functions',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Write a MATLAB program that converts a temperature value based on the unit selected by the user (Celsius to Fahrenheit, Kelvin, or Rankine). Formulas: T(F) = T(C)*9/5 + 32, K = C + 273.15, Rankine = (C + 273.15) * 9/5.',
        standardAnswer: `% MATLAB Temperature Unit Converter
tempC = input('Enter temperature in Celsius: ');
fprintf('Select target conversion:\\n1. Fahrenheit\\n2. Kelvin\\n3. Rankine\\n');
choice = input('Enter choice (1-3): ');

switch choice
    case 1
        tempF = (tempC * 9/5) + 32;
        fprintf('%.2f °C = %.2f °F\\n', tempC, tempF);
    case 2
        tempK = tempC + 273.15;
        fprintf('%.2f °C = %.2f K\\n', tempC, tempK);
    case 3
        tempR = (tempC + 273.15) * 9/5;
        fprintf('%.2f °C = %.2f °R\\n', tempC, tempR);
    otherwise
        disp('Invalid choice selected.');
end`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Algorithms',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Write a MATLAB program to calculate the total number of currency notes required for a given amount (e.g. 540) using denominations 500, 100, 50, 20, 10, 5, 2, 1 with highest denomination first priority.',
        standardAnswer: `% Currency Notes Calculator in MATLAB
amount = 540;
denominations = [500, 100, 50, 20, 10, 5, 2, 1];
rem_amount = amount;

fprintf('Breakdown for Rs. %d:\\n', amount);
for i = 1:length(denominations)
    denom = denominations(i);
    if rem_amount >= denom
        notes = floor(rem_amount / denom);
        rem_amount = mod(rem_amount, denom);
        fprintf('%d note(s) of Rs. %d\\n', notes, denom);
    end
end`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Functions',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Write a MATLAB function named projectile_Range that calculates horizontal range R = V0^2 * sin(2*theta) / g where g = 9.81. Check if theta is within valid range (0 to 90 degrees). Call function with V0 = 20 m/s, theta = 45 degrees. Also write recursive factorial function.',
        standardAnswer: `% Function Definition
function R = projectile_Range(V0, theta)
    g = 9.81; % acceleration due to gravity in m/s^2
    if theta < 0 || theta > 90
        error('Launch angle theta must be between 0 and 90 degrees.');
    end
    theta_rad = deg2rad(theta);
    R = (V0^2 * sin(2 * theta_rad)) / g;
end

% Function Call in Script:
V0 = 20; theta = 45;
R = projectile_Range(V0, theta);
fprintf('Projectile Range for V0=20 m/s and theta=45 deg is: %.2f meters\\n', R);

% Recursive Factorial Function:
function f = fact(n)
    if n <= 1
        f = 1; % Base case
    else
        f = n * fact(n - 1); % Recursive step
    end
end`
    }
];

async function seedBitCurriculum() {
    console.log('🚀 Seeding Bhilai Institute of Technology (BIT 1 Nov 2026) Question Bank...');

    try {
        let teacherId;
        if (process.env.DB_TYPE === 'postgres') {
            const tRes = await query("SELECT id FROM users WHERE role = 'teacher' LIMIT 1");
            teacherId = tRes.length > 0 ? tRes[0].id : 'f24a9b1c-b241-495c-8d7a-215ef9d1b8ef';
        } else {
            const tRes = await query("SELECT id FROM users WHERE role = 'teacher' LIMIT 1");
            teacherId = tRes.length > 0 ? tRes[0].id : generateId();
        }

        const insertedQuestionIdsBySubject = {
            'Physics': [],
            'Basic Electronics': [],
            'Basic Programming': []
        };

        for (const q of bitQuestionsData) {
            let existing;
            if (process.env.DB_TYPE === 'postgres') {
                existing = await query("SELECT id FROM questions WHERE question_text = $1", [q.questionText]);
            } else {
                existing = await query("SELECT id FROM questions WHERE question_text = ?", [q.questionText]);
            }

            let qId;
            if (existing && existing.length > 0) {
                qId = existing[0].id;
                // Update standard answer and metadata
                if (process.env.DB_TYPE === 'postgres') {
                    await execute("UPDATE questions SET standard_answer = $1, subject = $2, sub_category = $3, max_marks = $4 WHERE id = $5", [q.standardAnswer, q.subject, q.subCategory, q.maxMarks, qId]);
                } else {
                    await execute("UPDATE questions SET standard_answer = ?, subject = ?, sub_category = ?, max_marks = ? WHERE id = ?", [q.standardAnswer, q.subject, q.subCategory, q.maxMarks, qId]);
                }
            } else {
                qId = generateId();
                if (process.env.DB_TYPE === 'postgres') {
                    await execute(
                        "INSERT INTO questions(id, created_by, question_text, standard_answer, type, subject, sub_category, max_marks) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
                        [qId, teacherId, q.questionText, q.standardAnswer, q.type, q.subject, q.subCategory, q.maxMarks]
                    );
                } else {
                    await execute(
                        "INSERT INTO questions(id, created_by, question_text, standard_answer, type, subject, sub_category, max_marks) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
                        [qId, teacherId, q.questionText, q.standardAnswer, q.type, q.subject, q.subCategory, q.maxMarks]
                    );
                }
            }

            if (insertedQuestionIdsBySubject[q.subject]) {
                insertedQuestionIdsBySubject[q.subject].push(qId);
            }
        }

        console.log(`✅ Seeded ${bitQuestionsData.length} BIT examination questions across Physics, Electronics, and Programming.`);

        // Create Course Modules / Assignments for the 3 Subjects
        const assignmentsToCreate = [
            {
                title: 'BIT Nov 2026 - Physics (PHYS 1038) End Sem Exam',
                subject: 'Physics',
                subCategory: 'Quantum Mechanics',
                instructions: 'Attempt all mathematical derivations, numerical problems, and theory questions. State all units clearly.',
                questions: insertedQuestionIdsBySubject['Physics']
            },
            {
                title: 'BIT Nov 2026 - Basic Electrical & Electronics Engineering (ECEG-1013)',
                subject: 'Basic Electronics',
                subCategory: 'Semiconductor Devices',
                instructions: 'Solve diode circuits, rectifier parameters, logic gate designs, and transformer turns ratio.',
                questions: insertedQuestionIdsBySubject['Basic Electronics']
            },
            {
                title: 'BIT Nov 2026 - Programming for Engineers / MATLAB (MECH 2078)',
                subject: 'Basic Programming',
                subCategory: 'MATLAB Linear Algebra',
                instructions: 'Write clean MATLAB scripts, matrix equations, plotting commands, and projectile functions.',
                questions: insertedQuestionIdsBySubject['Basic Programming']
            }
        ];

        for (const a of assignmentsToCreate) {
            if (!a.questions || a.questions.length === 0) continue;

            let existingAssign;
            if (process.env.DB_TYPE === 'postgres') {
                existingAssign = await query("SELECT id FROM assignments WHERE title = $1", [a.title]);
            } else {
                existingAssign = await query("SELECT id FROM assignments WHERE title = ?", [a.title]);
            }

            let assignId;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

            if (!existingAssign || existingAssign.length === 0) {
                if (process.env.DB_TYPE === 'postgres') {
                    const res = await execute(
                        "INSERT INTO assignments(teacher_id, title, instructions, due_date, subject, sub_category) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
                        [teacherId, a.title, a.instructions, dueDate.toISOString(), a.subject, a.subCategory]
                    );
                    assignId = res.rows[0].id;
                } else {
                    assignId = generateId();
                    await execute(
                        "INSERT INTO assignments(id, teacher_id, title, instructions, due_date, subject, sub_category) VALUES(?, ?, ?, ?, ?, ?, ?)",
                        [assignId, teacherId, a.title, a.instructions, dueDate.toISOString(), a.subject, a.subCategory]
                    );
                }

                for (const qId of a.questions) {
                    if (process.env.DB_TYPE === 'postgres') {
                        await execute("INSERT INTO assignment_questions(assignment_id, question_id, max_points) VALUES($1, $2, $3)", [assignId, qId, 10]);
                    } else {
                        await execute("INSERT INTO assignment_questions(assignment_id, question_id, max_points) VALUES(?, ?, ?)", [assignId, qId, 10]);
                    }
                }
                console.log(`📘 Created Course Module: ${a.title}`);
            }
        }

        console.log('🎉 BIT 1 Nov 2026 Sample Subjects & Math Marker Setup Complete!');
    } catch (err) {
        console.error('Error seeding BIT curriculum:', err);
    }
}

if (require.main === module) {
    const dotenv = require('dotenv');
    const { initDb } = require('./db/database');
    dotenv.config();
    initDb().then(() => {
        return seedBitCurriculum();
    }).then(() => {
        console.log('Done!');
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { seedBitCurriculum, bitQuestionsData };
