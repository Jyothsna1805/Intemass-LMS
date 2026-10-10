/**
 * Bhilai Institute of Technology (BIT) - 1 Nov 2026 Curriculum Seeder
 * Comprehensive Question Bank & Assignments for:
 * 1. Basic Electrical and Electronics Engineering (ECEG-1013) - 11 Questions (Complete Sections A, B, C)
 * 2. Programming for Engineers / MATLAB (MECH 2078) - 11 Questions (Complete Sections A, B, C)
 * 3. Physics (PHYS 1038) - 11 Questions (Complete Sections A, B, C)
 */

const { query, execute } = require('./db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

const bitQuestionsData = [
    // =========================================================================
    // 1. BASIC ELECTRICAL AND ELECTRONICS ENGINEERING (ECEG-1013) - 11 QUESTIONS
    // =========================================================================
    {
        subject: 'Basic Electronics',
        subCategory: 'Semiconductor Devices',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q1. What is an intrinsic semiconductor, and how does it differ from an extrinsic semiconductor? (CO1 - 4 Marks)',
        standardAnswer: `1. Intrinsic Semiconductor: Pure semiconductor crystal (e.g., pure Si or Ge) with no intentional impurities. Charge carrier concentrations are equal: n = p = n_i. Electrical conductivity is low at room temperature and determined solely by thermally generated electron-hole pairs.
2. Extrinsic Semiconductor: Doped semiconductor formed by adding pentavalent (n-type donor impurities, n >> p) or trivalent (p-type acceptor impurities, p >> n) atoms.
3. Key Differences:
- Doping Level: Intrinsic has 0% impurity; Extrinsic has controlled dopants (~1 atom per 10^6 Si atoms).
- Majority Carriers: Intrinsic has equal electrons and holes; Extrinsic has predominant majority carriers (electrons in n-type, holes in p-type).
- Fermi Level Position: In intrinsic, Fermi level E_F lies at exact center of bandgap; in extrinsic, E_F shifts near conduction band (n-type) or valence band (p-type).
- Conductivity: Extrinsic exhibits significantly higher electrical conductivity at room temperature.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Circuit Theory',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q2. Determine the current I in the circuit shown with E1 = 24 V, E2 = 4 V, R = 2 kOhm. Assume the diodes to be silicon (V_D = 0.7 V) and forward resistance of diodes to be zero. (CO1 - 4 Marks)',
        standardAnswer: `1. Diode Bias Analysis:
- Voltage source E1 (24 V) applies positive potential to anode of D1 and cathode of D2.
- Diode D1 is Forward Biased (ON state, modeled with barrier potential V_D1 = 0.7 V).
- Diode D2 is Reverse Biased (OFF state, open-circuited, conducts zero current).
2. KVL Loop Equation:
E1 - I * R - V_D1 - E2 = 0
24 V - I * (2000 Ohm) - 0.7 V - 4 V = 0
3. Solution for Current I:
I * 2000 = 24 - 4 - 0.7 = 19.3 V
I = 19.3 / 2000 A = 0.00965 A = 9.65 mA.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Circuit Theory',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q3. Differentiate Kirchhoff’s current law (KCL) and voltage law (KVL) using an example. (CO3 - 4 Marks)',
        standardAnswer: `1. Kirchhoff’s Current Law (KCL):
- Physical Principle: Conservation of electric charge.
- Statement: The algebraic sum of currents entering and exiting any electrical node/junction is zero: sum(I_in) = sum(I_out).
- Example: At a junction node with incoming current I1 = 5 A and branching outgoing currents I2, I3: I1 = I2 + I3 => 5 A = 2 A + 3 A.

2. Kirchhoff’s Voltage Law (KVL):
- Physical Principle: Conservation of energy.
- Statement: The algebraic sum of all potential differences (EMFs and IR voltage drops) around any closed loop is zero: sum(V) = 0.
- Example: In a series loop with source V_s = 12 V and series resistors R1 = 4 Ohm, R2 = 2 Ohm carrying current I = 2 A: V_s - I*R1 - I*R2 = 12 - (2*4) - (2*2) = 0 V.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Digital Logic',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q4. Convert the following: (a) (100101.001)_2 = (?)_16 = (?)_10 = (?)_8  (b) (1110101)_Gray code = (?)_Binary = (?)_10 (CO2 - 4 Marks)',
        standardAnswer: `Part (a) Binary (100101.001)_2 Conversion:
1. Hexadecimal: Group binary bits into nibbles of 4 (pad with zeros): (0010 0101 . 0010)_2 = (25.2)_16
2. Decimal: (1*32) + (0*16) + (0*8) + (1*4) + (0*2) + (1*1) + (0*0.5) + (0*0.25) + (1*0.125) = (37.125)_10
3. Octal: Group binary bits into sets of 3: (100 101 . 001)_2 = (45.1)_8

Part (b) Gray Code (1110101)_Gray to Binary and Decimal:
1. Gray to Binary algorithm:
- MSB: B6 = G6 = 1
- B5 = B6 XOR G5 = 1 XOR 1 = 0
- B4 = B5 XOR G4 = 0 XOR 1 = 1
- B3 = B4 XOR G3 = 1 XOR 0 = 1
- B2 = B3 XOR G2 = 1 XOR 1 = 0
- B1 = B2 XOR G1 = 0 XOR 0 = 0
- B0 = B1 XOR G0 = 0 XOR 1 = 1
Binary Output = (1011001)_2
2. Decimal Conversion: (1*64) + (0*32) + (1*16) + (1*8) + (0*4) + (0*2) + (1*1) = (89)_10.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Network Theorems',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q5. Derive the expression for the maximum power transferred to the load in a circuit. Under what condition does maximum power transfer occur to the load? (CO4 - 4 Marks)',
        standardAnswer: `1. Condition: Maximum power transfer from an AC/DC source to a load resistor occurs when Load Resistance equals Thevenin Source Resistance: R_L = R_th.
2. Derivation:
- Consider Thevenin equivalent circuit with open-circuit voltage V_th and internal resistance R_th connected to load R_L.
- Load Current: I = V_th / (R_th + R_L)
- Power delivered to Load: P_L = I^2 * R_L = [ V_th^2 * R_L ] / (R_th + R_L)^2
- For maximum power, differentiate P_L with respect to R_L and equate to 0:
dP_L / dR_L = V_th^2 * [ (R_th + R_L)^2 - 2*R_L*(R_th + R_L) ] / (R_th + R_L)^4 = 0
=> (R_th + R_L) - 2*R_L = 0 => R_L = R_th (Condition proved).
3. Maximum Power Expression:
Substituting R_L = R_th into power equation:
P_max = [ V_th^2 * R_th ] / (2 * R_th)^2 = V_th^2 / (4 * R_th).`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Rectifiers & Power Supplies',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q6. In a bridge full wave rectifier circuit, assume Load resistance RL= 400 Ohm, transformer turn ratio = 8:1 (with primary 230 V, 50 Hz), forward resistance Rf of each diode is 1 Ohm. Determine: (i) Maximum current Im (ii) Average or DC current (iii) RMS or AC current (iv) Output DC voltage (v) AC and DC power. (CO1 - 10 Marks)',
        standardAnswer: `1. Secondary Voltage:
Secondary RMS Voltage V_rms = 230 / 8 = 28.75 V.
Secondary Peak Voltage V_m = V_rms * sqrt(2) = 28.75 * 1.4142 = 40.66 V.

2. (i) Maximum Current (Im):
In a bridge rectifier, two diodes conduct in series during each half cycle:
I_m = V_m / (2*R_f + R_L) = 40.66 / (2*1 + 400) = 40.66 / 402 = 0.1011 A = 101.1 mA.

3. (ii) Average or DC Current (Idc):
I_dc = (2 * I_m) / pi = (2 * 0.1011) / 3.14159 = 0.0644 A = 64.4 mA.

4. (iii) RMS Current (Irms):
I_rms = I_m / sqrt(2) = 0.1011 / 1.4142 = 0.0715 A = 71.5 mA.

5. (iv) Output DC Voltage (Vdc):
V_dc = I_dc * R_L = 0.0644 A * 400 Ohm = 25.76 V.

6. (v) AC Input Power and DC Output Power:
- DC Power Delivered: P_dc = I_dc^2 * R_L = (0.0644)^2 * 400 = 1.66 Watts.
- Total AC Power Supplied: P_ac = I_rms^2 * (2*R_f + R_L) = (0.0715)^2 * 402 = 2.055 Watts.
- Rectification Efficiency eta = P_dc / P_ac = 1.66 / 2.055 = 80.78%.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Network Theorems',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q7. Using Superposition theorem, find the voltage across resistance R3= 4.7 kOhm and current through R4= 3.3 kOhm for the given circuit with sources V1 = 12 V and V2 = 6 V, R1 = 1 kOhm, R2 = 2.2 kOhm. (CO3 - 10 Marks)',
        standardAnswer: `Superposition Theorem Step-by-Step Solution:
1. Case 1: Active Source V1 = 12 V (Deactivate V2 by replacing with short circuit):
- Parallel combination of branches across R3: R_p1 = (R2 || R3) = (2.2k * 4.7k) / (2.2k + 4.7k) = 1.498 kOhm.
- Total resistance seen by V1: R_total1 = R1 + R_p1 = 1k + 1.498k = 2.498 kOhm.
- Total current from V1: I_s1 = 12 / 2.498k = 4.804 mA.
- Voltage across R3 due to V1: V3' = I_s1 * R_p1 = 4.804 mA * 1.498 kOhm = 7.196 V.
- Current through R4 due to V1: I4' = 0 A (or branch current as per schematic connection).

2. Case 2: Active Source V2 = 6 V (Deactivate V1 by replacing with short circuit):
- Parallel combination of (R1 || R3) = (1k * 4.7k) / (1k + 4.7k) = 0.824 kOhm.
- Total resistance seen by V2: R_total2 = R2 + 0.824k = 2.2k + 0.824k = 3.024 kOhm.
- Current from V2: I_s2 = 6 / 3.024k = 1.984 mA.
- Voltage across R3 due to V2: V3'' = - (I_s2 * 0.824 kOhm) = -1.635 V.
- Current through R4 due to V2: I4'' = 1.818 mA.

3. Total Superposition Algebraic Sum:
- Total Voltage across R3: V_R3 = V3' + V3'' = 7.196 V - 1.635 V = 5.561 V.
- Total Current through R4: I_R4 = I4' + I4'' = 1.818 mA.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Digital Logic',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q8. Design NOT, AND and OR Logic Gates using NAND Universal Logic Gate. (CO2 - 10 Marks)',
        standardAnswer: `Implementation of Basic Gates using Universal NAND Gates:

1. NOT Gate from NAND:
- Implementation: Tie both inputs of a 2-input NAND gate together to receive single input signal A.
- Boolean Proof: Output Y = (A . A)' = A'.
- Number of NAND Gates required = 1.

2. AND Gate from NAND:
- Implementation: Connect inputs A and B to the first NAND gate to produce (A . B)'. Feed this output to both inputs of a second NAND gate acting as an inverter.
- Boolean Proof: Y = [ (A . B)' ]' = A . B.
- Number of NAND Gates required = 2.

3. OR Gate from NAND:
- Implementation: Use one NAND gate as an inverter on input A to obtain A'. Use a second NAND gate as an inverter on input B to obtain B'. Feed A' and B' into a third NAND gate.
- Boolean Proof by De Morgan's Law:
Y = (A' . B')' = (A')' + (B')' = A + B.
- Number of NAND Gates required = 3.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Transformers',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q9. Attempt both the parts: (a) Explain the concept of turns ratio in a transformer and its significance in determining the output voltage. Draw the sketch diagram of step-up and step-down transformer. (b) A 100 kVA, 6000/400V, 50 Hz single phase transformer has 100 turns in the secondary. Find (i) Number of turns in the primary coil (ii) Maximum flux in the core. (CO4 - 5+5=10 Marks)',
        standardAnswer: `Part (a) Transformer Turns Ratio & Operation:
1. Definition: Turns ratio k = N2 / N1 = V2 / V1 = I1 / I2.
- Step-Up Transformer: Secondary turns N2 > Primary turns N1 (k > 1), Output voltage V2 > V1. Used in power generation stations.
- Step-Down Transformer: Secondary turns N2 < Primary turns N1 (k < 1), Output voltage V2 < V1. Used in domestic distribution and adapters.
2. Sketch Description: Primary winding connected to AC source V1 on left core limb; secondary winding connected to load on right core limb with magnetic flux Phi linking both.

Part (b) Numerical Calculations:
Given: S = 100 kVA, V1 = 6000 V, V2 = 400 V, f = 50 Hz, N2 = 100 turns.
1. (i) Primary Turns N1:
Transformation ratio: N1 / N2 = V1 / V2
N1 = N2 * (V1 / V2) = 100 * (6000 / 400) = 100 * 15 = 1500 turns.

2. (ii) Maximum Flux in Core (Phi_m):
Transformer EMF Equation: E2 = 4.44 * f * N2 * Phi_m
400 = 4.44 * 50 * 100 * Phi_m = 22200 * Phi_m
Phi_m = 400 / 22200 = 0.01802 Wb = 18.02 milliWebers.`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'Digital Logic & Adders',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q10. Attempt both the parts: (a) Minimize the function using K-map: F(A, B, C, D) = sum m(1,3,5,6,7, 10, 12, 15) + d(2, 4, 13) (10 Marks). (b) Derive the Boolean expressions for the sum (S) and carry-out (Cout) outputs of a full adder in terms of its inputs. Also draw the logic circuit diagram for full adder. (CO2 - 10+10=20 Marks)',
        standardAnswer: `Part (a) K-Map Minimization for F(A,B,C,D):
1. Plotting 4-Variable K-Map (AB rows, CD columns) with minterms {1,3,5,6,7,10,12,15} and don't cares {2,4,13}:
- Quad 1 (m1, m3, m5, m7): grouped to yield A'D.
- Quad 2 (m5, m7, d13, m15): grouped to yield BD.
- Group 3 (m6, m7, d2, m3): grouped to yield A'C.
- Group 4 (m12, d13): combined with adjacent cells to yield AB C'.
2. Minimal Sum-of-Products (SOP) Expression:
F(A, B, C, D) = A'D + BD + A'C + AB C' (or simplified: A'D + A'C + BC' + BD).

Part (b) Full Adder Derivation & Circuit:
1. Truth Table with inputs A, B, Cin:
- Sum S = 1 for minterms m(1, 2, 4, 7).
- Carry Cout = 1 for minterms m(3, 5, 6, 7).
2. Boolean Derivations:
- Sum S = A XOR B XOR Cin = (A'B'Cin + A'BCin' + AB'Cin' + ABCin).
- Carry Cout = A*B + B*Cin + A*Cin = A*B + Cin*(A XOR B).
3. Logic Circuit Implementation:
- Half Adder 1: Inputs A, B produce S1 = A XOR B and C1 = A . B.
- Half Adder 2: Inputs S1 and Cin produce final Sum S = S1 XOR Cin = A XOR B XOR Cin and C2 = S1 . Cin.
- Final Carry: Cout = C1 OR C2 = (A . B) + Cin.(A XOR B).`
    },
    {
        subject: 'Basic Electronics',
        subCategory: 'AC Circuits & Electrical Machines',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q11. Attempt both the parts: (a) Design and analyze the operation of DC machine with neat sketch diagram. (10 Marks) (b) A 230 V, 50 Hz sinusoidal supply is connected with resistance of 25 Ohm, inductance of 0.5 H, and capacitance of 100 uF in series. Determine the (i) total impedance of circuit (ii) voltage across each element (iii) current in the circuit and (iv) phase angle. (CO4 - 10+10=20 Marks) \nOR \nAttempt both parts: (a) Define the principle of operation of DC generator and role of components. (b) An 8-pole generator has 40 slots, 10 conductors/slot, flux/pole = 0.050 Wb. Determine: (i) Generated EMF for LAP connected at 1000 rpm (ii) Speed for WAVE wound to produce same EMF.',
        standardAnswer: `Option 1 Solution:
Part (a) DC Machine Design & Construction:
1. Stator Components: Yoke (outer magnetic frame), Field poles with Pole shoes, Field windings (producing main working flux).
2. Rotor Components: Armature core (laminated high-permeability steel slots), Armature winding (insulated copper coils), Commutator (split copper segments to convert AC to DC), Carbon brushes.
3. Operation: Based on Faraday’s Law of Electromagnetic Induction (Generator mode: e = B*l*v) and Lorentz Force (Motor mode: F = B*I*l).

Part (b) Series RLC Circuit Calculations:
Given: V = 230 V, f = 50 Hz, R = 25 Ohm, L = 0.5 H, C = 100 uF = 100e-6 F.
1. Reactance Calculations:
- Inductive Reactance: X_L = 2 * pi * f * L = 2 * 3.1416 * 50 * 0.5 = 157.08 Ohm.
- Capacitive Reactance: X_C = 1 / (2 * pi * f * C) = 1 / (2 * 3.1416 * 50 * 100e-6) = 31.83 Ohm.
- Net Reactance: X = X_L - X_C = 157.08 - 31.83 = 125.25 Ohm (Inductive).
2. (i) Total Impedance Z:
Z = sqrt(R^2 + X^2) = sqrt(25^2 + 125.25^2) = sqrt(625 + 15687.56) = 127.72 Ohm.
3. (iii) Circuit Current I:
I = V / Z = 230 / 127.72 = 1.801 Amperes.
4. (ii) Voltages Across Elements:
- Resistor Voltage: V_R = I * R = 1.801 * 25 = 45.03 V.
- Inductor Voltage: V_L = I * X_L = 1.801 * 157.08 = 282.90 V.
- Capacitor Voltage: V_C = I * X_C = 1.801 * 31.83 = 57.33 V.
5. (iv) Phase Angle phi:
phi = arctan(X / R) = arctan(125.25 / 25) = arctan(5.01) = 78.71 degrees (Lagging).

---
Option 2 (OR) Solution:
Part (b) 8-Pole DC Generator Calculations:
Given: Poles P = 8, Total conductors Z = 40 slots * 10 = 400 conductors, Flux Phi = 0.050 Wb, Speed N = 1000 rpm.
General EMF Equation: E_g = (Phi * Z * N * P) / (60 * A)
1. (i) LAP Connected (Parallel paths A = P = 8):
E_g(LAP) = (0.050 * 400 * 1000 * 8) / (60 * 8) = (20000) / 60 = 333.33 Volts.
2. (ii) WAVE Connected (Parallel paths A = 2):
To produce same EMF E_g = 333.33 V:
333.33 = (0.050 * 400 * N_wave * 8) / (60 * 2) = (160 * N_wave) / 120 = 1.3333 * N_wave
N_wave = 333.33 / 1.3333 = 250 rpm.`
    },

    // =========================================================================
    // 2. PROGRAMMING FOR ENGINEERS / MATLAB (MECH 2078) - 11 QUESTIONS
    // =========================================================================
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Linear Algebra',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q1. Write a MATLAB script to create a current matrix for a system of linear equations with resistance matrix R = [10, 5, 3; 4, 12, 2; 6, 3, 15] and voltage matrix V = [30; 24; 42] to compute current values. (CO2 - 4 Marks)',
        standardAnswer: `% MATLAB Script for Circuit Current Computation
R = [10, 5, 3; 4, 12, 2; 6, 3, 15]; % Resistance Matrix (Ohms)
V = [30; 24; 42];                    % Voltage Vector (Volts)

% Solve R * I = V using matrix left division
I = R \\ V;

% Display computed current values
disp('Computed Current Values (Amperes):');
disp(I);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Basics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q2. Write a MATLAB script to calculate and display the kinetic energy of a moving object given mass = 1,000 kg and speed = 20 m/s (Formula: K = 1/2 * mass * Vel^2). (CO2 - 4 Marks)',
        standardAnswer: `% MATLAB Script for Kinetic Energy Calculation
mass = 1000;      % Mass in kg
velocity = 20;    % Velocity in m/s

% Compute kinetic energy
K = 0.5 * mass * (velocity^2);

fprintf('The Kinetic Energy of the object is: %.2f Joules (%.2f kJ)\\n', K, K / 1000);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Graphics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q3. Explain the difference between plot, scatter, and bar functions in MATLAB. When would you choose each type of plot? (CO1 - 4 Marks)',
        standardAnswer: `1. plot(x, y): Generates a continuous 2D line graph connecting data points sequentially. Ideal for continuous mathematical functions, time-series signals, and waveforms.
2. scatter(x, y): Renders discrete coordinate points without connecting lines. Ideal for identifying data distributions, bivariate correlations, and cluster patterns.
3. bar(x, y): Displays vertical rectangular bars proportional to values. Ideal for categorical comparisons, discrete frequencies, and histogram summaries.`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Control Flow',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q4. Explain the syntax of ‘switch’ and ‘while’ control with an example for each. (CO1 - 4 Marks)',
        standardAnswer: `1. switch Statement:
Syntax:
switch expression
    case val1, statements1;
    case val2, statements2;
    otherwise, default_statements;
end

Example:
num = 2;
switch num
    case 1, disp('One');
    case 2, disp('Two');
    otherwise, disp('Other');
end

2. while Loop:
Syntax:
while condition
    loop_statements;
    counter_update;
end

Example:
k = 1;
while k <= 5
    fprintf('%d ', k);
    k = k + 1;
end`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Strings',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q5. What is the difference between a character array and a string in MATLAB? Write a line of code to find the length of ‘char1’ and ‘str1’ and display the output. (CO1 - 4 Marks)',
        standardAnswer: `1. Differences:
- Character Array: Enclosed in single quotes (e.g., 'Hello'). Stored as a 1xN array of characters where length equals number of individual characters.
- String: Enclosed in double quotes (e.g., "Hello"). Stored as a string scalar object (1x1 string array) capable of holding multi-word text.
2. MATLAB Code:
char1 = 'Hello BIT';
str1 = "Hello BIT";
len_char = length(char1);    % Returns 9
len_str = strlength(str1);   % Returns 9
fprintf('Length of character array: %d\\nLength of string: %d\\n', len_char, len_str);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Conditional Programs',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q6. Write a MATLAB program that converts a temperature value based on the unit selected by the user (Celsius to Fahrenheit, Kelvin, or Rankine). Formulas: T(F) = (T(C)*9/5)+32, Kelvin = C + 273.15, Rankine = (C + 273.15)*9/5. (CO2 - 10 Marks)',
        standardAnswer: `% Temperature Unit Conversion Program in MATLAB
tempC = input('Enter temperature in Celsius: ');
fprintf('Select conversion target:\\n1. Fahrenheit\\n2. Kelvin\\n3. Rankine\\n');
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
        disp('Invalid selection.');
end`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Algorithms',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q7. Write a MATLAB program to calculate the total number of currency notes required for a given amount using the highest denomination as first priority from [500, 100, 50, 20, 10, 5, 2, 1] (e.g., for amount = 540). (CO3 - 10 Marks)',
        standardAnswer: `% MATLAB Currency Notes Greedy Denomination Program
amount = 540;
denominations = [500, 100, 50, 20, 10, 5, 2, 1];
rem_amount = amount;

fprintf('Currency note breakdown for Rs. %d:\\n', amount);
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
        subCategory: 'MATLAB Decision Statements',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q8. Write a MATLAB program to input electricity units and calculate total electricity bill based on conditions: first 50 units @ Rs 0.50, next 100 units @ Rs 0.75, next 100 units @ Rs 1.20, units above 250 @ Rs 1.50, plus 20% surcharge. (CO4 - 10 Marks)',
        standardAnswer: `% MATLAB Electricity Bill Calculator
units = input('Enter total electricity units consumed: ');
bill = 0;

if units <= 50
    bill = units * 0.50;
elseif units <= 150
    bill = (50 * 0.50) + (units - 50) * 0.75;
elseif units <= 250
    bill = (50 * 0.50) + (100 * 0.75) + (units - 150) * 1.20;
else
    bill = (50 * 0.50) + (100 * 0.75) + (100 * 1.20) + (units - 250) * 1.50;
end

% Apply 20% surcharge
total_bill = bill + (0.20 * bill);
fprintf('Base Bill: Rs. %.2f\\nTotal Bill with 20%% Surcharge: Rs. %.2f\\n', bill, total_bill);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Functions & Recursion',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q9. Write a MATLAB function named projectile_Range(V0, theta) using R = V0^2 * sin(2*theta) / g with angle validation (0 to 90 deg). Call function with V0 = 20 m/s, theta = 45 deg. OR Explain recursion in MATLAB and write a recursive function for factorial. (CO3 - 10 Marks)',
        standardAnswer: `% Function Definition
function R = projectile_Range(V0, theta)
    g = 9.81; % Acceleration due to gravity in m/s^2
    if theta < 0 || theta > 90
        error('Launch angle theta must be in range [0, 90] degrees.');
    end
    theta_rad = deg2rad(theta);
    R = (V0^2 * sin(2 * theta_rad)) / g;
end

% Calling the function
V0 = 20; theta = 45;
R = projectile_Range(V0, theta);
fprintf('Calculated Projectile Range: %.2f meters\\n', R);

% Alternative: Recursive Factorial Function
function f = fact_recursive(n)
    if n <= 1
        f = 1; % Base Case
    else
        f = n * fact_recursive(n - 1); % Recursive Call
    end
end`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Scripts & Control Flow',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q10. Attempt both parts: (a) Write a MATLAB script to print even numbers between 1 and 200 (5 Marks). (b) Write a script that uses input(...) to request a percentage grade and converts it to a letter grade (>=90: A, 80-90: B, 70-80: C, 60-70: D, <60: F) (15 Marks). (CO3 - 5+15=20 Marks)',
        standardAnswer: `% Part (a) Even Numbers Printer (1 to 200)
fprintf('Even numbers between 1 and 200:\\n');
for i = 2:2:200
    fprintf('%d ', i);
end
fprintf('\\n');

% Part (b) Grade Converter Script
pct = input('Enter numerical percentage grade (0-100): ');

if pct >= 90
    grade = 'A';
elseif pct >= 80
    grade = 'B';
elseif pct >= 70
    grade = 'C';
elseif pct >= 60
    grade = 'D';
else
    grade = 'F';
end
fprintf('Letter Grade Awarded: %s\\n', grade);`
    },
    {
        subject: 'Basic Programming',
        subCategory: 'MATLAB Arrays & Structures',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q11. Attempt both parts: (a) Write a MATLAB script using nested loops to display a structured number matrix (15 Marks). (b) Write what will be displayed for vector operations on a = 0:2:6: (i) b1 = [a, a], (ii) b2 = [a a], (iii) c = [a ; a], (iv) d = [a\' ; a] (5 Marks). (CO4 - 15+5=20 Marks) \nOR \nWrite a MATLAB program creating a structured array to store student records (Name, Roll, 5 subject marks, Total) and identify students scoring above class average. (20 Marks)',
        standardAnswer: `% Part (a) Nested Loop Matrix Display
N = 5;
M = zeros(N, N);
for r = 1:N
    for c = 1:N
        M(r, c) = r * c;
    end
end
disp('Generated Matrix:');
disp(M);

% Part (b) Output of vector expressions with a = [0, 2, 4, 6]:
% (i) b1 = [a, a]  -> [0, 2, 4, 6, 0, 2, 4, 6] (1x8 row vector)
% (ii) b2 = [a a]  -> [0, 2, 4, 6, 0, 2, 4, 6] (1x8 row vector)
% (iii) c = [a ; a] -> [0 2 4 6; 0 2 4 6] (2x4 matrix)
% (iv) d = [a\' ; a] -> Error (dimension mismatch: 4x1 cannot concatenate vertically with 1x4)

% --- Alternative (OR): Student Structured Array ---
students(1) = struct('Name', 'Aarav', 'Roll', 101, 'Marks', [85 92 78 88 91]);
students(2) = struct('Name', 'Ishita', 'Roll', 102, 'Marks', [90 87 93 85 89]);
students(3) = struct('Name', 'Riya', 'Roll', 103, 'Marks', [88 91 95 90 86]);
students(4) = struct('Name', 'Arjun', 'Roll', 104, 'Marks', [80 84 79 77 82]);
students(5) = struct('Name', 'Kavya', 'Roll', 105, 'Marks', [89 92 94 90 88]);

total_class = 0;
for i = 1:length(students)
    students(i).Total = sum(students(i).Marks);
    total_class = total_class + students(i).Total;
end
class_avg = total_class / length(students);
fprintf('Class Average Total Marks: %.2f\\n', class_avg);
fprintf('Students Scoring Above Average:\\n');
for i = 1:length(students)
    if students(i).Total > class_avg
        fprintf('- %s (Roll %d): %d Marks\\n', students(i).Name, students(i).Roll, students(i).Total);
    end
end`
    },

    // =========================================================================
    // 3. PHYSICS (PHYS 1038) - 11 QUESTIONS
    // =========================================================================
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q1. Electron trapped in a one-dimensional potential box of length 10 nm makes a transition from 3rd excited state to 2nd excited state. Determine the wavelength of the corresponding electromagnetic radiation emitted. (CO3 - 4 Marks)',
        standardAnswer: `1. Energy Level Equation for 1D Infinite Potential Well:
E_n = (n^2 * h^2) / (8 * m * L^2)
2. State Identification:
- 3rd excited state corresponds to principal quantum number n = 4.
- 2nd excited state corresponds to principal quantum number n = 3.
3. Transition Energy Difference Delta E:
Delta E = E_4 - E_3 = (4^2 - 3^2) * [ h^2 / (8 * m * L^2) ] = 7 * h^2 / (8 * m * L^2)
4. Value Substitutions:
h = 6.63e-34 J.s, m = 9.1e-31 kg, L = 10 nm = 10e-9 m = 1e-8 m.
Delta E = 7 * (6.63e-34)^2 / (8 * 9.1e-31 * 1e-16) = 4.22e-21 Joules (0.0264 eV).
5. Wavelength Calculation:
lambda = (h * c) / Delta E = (6.63e-34 * 3e8) / 4.22e-21 = 4.71e-5 meters = 47.1 um (Infrared radiation).`
    },
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q2. State the conditions for a well-behaved quantum mechanical wave function psi(x). (CO1 - 4 Marks)',
        standardAnswer: `A physically acceptable (well-behaved) wave function psi(x) must satisfy the following fundamental boundary conditions:
1. Single-valued: psi(x) must possess only one unique value at each spatial coordinate to ensure unique probability density.
2. Continuous: psi(x) and its first spatial derivative d(psi)/dx must be continuous everywhere across space.
3. Square-Integrable / Finite: The integral of |psi(x)|^2 dx over all space from -infinity to +infinity must equal 1 (Normalizability condition).
4. Non-zero: psi(x) must not be identically zero everywhere in the active region.`
    },
    {
        subject: 'Physics',
        subCategory: 'Crystallography',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q3. Draw the planes (1 2 1) and (2 3 4) on a simple cubic lattice. (CO3 - 4 Marks)',
        standardAnswer: `1. Determining Axis Intercepts via Miller Indices:
- Plane (1 2 1): Intercepts on x, y, z axes are (1/1, 1/2, 1/1) -> (1a, 0.5a, 1a).
- Plane (2 3 4): Intercepts on x, y, z axes are (1/2, 1/3, 1/4) -> (0.5a, 0.333a, 0.25a).
2. Sketch Description:
Draw a unit cube of lattice parameter 'a'. Mark the intercept coordinates on the three Cartesian axes originating from the reference origin, and join the points to form the corresponding triangular lattice plane.`
    },
    {
        subject: 'Physics',
        subCategory: 'Optics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q4. Differentiate between Fraunhofer and Fresnel class of diffraction. (CO1 - 4 Marks)',
        standardAnswer: `1. Source and Screen Distance: In Fresnel diffraction, the light source and screen are at finite distances from the diffracting aperture. In Fraunhofer diffraction, source and screen are effectively at infinite distances.
2. Incident Wavefront Geometry: Fresnel uses spherical or cylindrical wavefronts; Fraunhofer uses plane wavefronts.
3. Focusing Optics: Fresnel requires no lenses; Fraunhofer requires convex lenses to collimate and focus parallel rays.
4. Central Fringe: In Fresnel diffraction, the central point may be bright or dark; in Fraunhofer diffraction, the central maximum is always bright.`
    },
    {
        subject: 'Physics',
        subCategory: 'Vector Calculus & Electrodynamics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q5. Show that the vector F = (6xy + z^3)i + (3x^2 - z)j + (3xz^2 - y)k is irrotational. (CO2 - 4 Marks)',
        standardAnswer: `A vector field F is irrotational if its curl is identically zero: curl F = del x F = 0.
Computing curl components:
- i-component: d/dy(3xz^2 - y) - d/dz(3x^2 - z) = -1 - (-1) = 0
- j-component: d/dz(6xy + z^3) - d/dx(3xz^2 - y) = 3z^2 - 3z^2 = 0
- k-component: d/dx(3x^2 - z) - d/dy(6xy + z^3) = 6x - 6x = 0
Since curl F = 0i + 0j + 0k = 0, the vector field F is strictly irrotational.`
    },
    {
        subject: 'Physics',
        subCategory: 'Lasers',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q6. One of the most used and safest lasers is the He-Ne laser. Discuss in detail the construction and working of He-Ne LASER. (CO1 - 10 Marks)',
        standardAnswer: `1. Construction:
- Discharge tube made of fused quartz filled with Helium (He) and Neon (Ne) in 10:1 ratio at total pressure of ~1 torr.
- Resonant optical cavity formed by two parallel dielectric mirrors (one 100% reflective, one 99% partially transmissive).
- DC electrical discharge used for pumping.

2. Working & Energy Transfer Mechanism:
- Electrical discharge accelerates electrons, which collide with He atoms exciting them to metastable states 2^1S (20.61 eV) and 2^3S (19.81 eV).
- Resonant Energy Transfer: Excited He atoms collide with ground-state Ne atoms, transferring energy non-radiatively to matching Ne levels (3s and 2s).
- Population Inversion is created between Ne 3s / 2s levels and lower 2p levels.
- Stimulated Emission: Transition from Ne 3s2 to 2p4 emits coherent red laser light at wavelength lambda = 632.8 nm (0.6328 um).
- De-excitation: Atoms in 2p undergo spontaneous decay to 1s, followed by non-radiative collision with tube walls to return to ground state.`
    },
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q7. State the uncertainty principle. Write its different forms (in terms of different conjugate variables) and describe any one application of the uncertainty principle. (CO3 - 10 Marks)',
        standardAnswer: `1. Heisenberg’s Uncertainty Principle Statement:
It is fundamentally impossible to simultaneously determine both the exact position and linear momentum of a microscopic particle with arbitrary precision.

2. Conjugate Variable Forms:
- Position & Linear Momentum: Delta x * Delta p_x >= h_bar / 2 (or h / (4*pi))
- Energy & Time: Delta E * Delta t >= h_bar / 2
- Angular Position & Angular Momentum: Delta theta * Delta L_z >= h_bar / 2

3. Application (Non-existence of electron in nucleus):
- Nuclear radius R ~ 1e-14 m => Uncertainty in position Delta x = 1e-14 m.
- Minimum momentum uncertainty: Delta p >= h_bar / (2 * Delta x) = 1.054e-34 / (2 * 1e-14) = 5.27e-21 kg.m/s.
- Relativistic Energy E ~ c * Delta p = (3e8 * 5.27e-21) = 1.58e-12 J = 9.8 MeV.
- Since beta-decay electrons possess energies < 4 MeV, free electrons cannot reside inside the nucleus.`
    },
    {
        subject: 'Physics',
        subCategory: 'Crystallography',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q8. What is Atomic Packing Fraction (APF)? Obtain APF for FCC crystal. (CO4 - 10 Marks)',
        standardAnswer: `1. Definition:
Atomic Packing Fraction (APF) is the ratio of the volume occupied by all constituent atoms in a unit cell to the total volume of the unit cell:
APF = (N_atoms * V_atom) / V_unit_cell.

2. FCC Unit Cell Derivation:
- Effective number of atoms per FCC cell: N = (8 corner atoms * 1/8) + (6 face-centered atoms * 1/2) = 1 + 3 = 4 atoms.
- Relation between lattice parameter 'a' and atomic radius 'r':
Along the face diagonal: 4r = a * sqrt(2) => a = 4r / sqrt(2) = 2 * sqrt(2) * r.
- Volume of Atoms: V_atoms = 4 * (4/3 * pi * r^3) = (16/3) * pi * r^3.
- Volume of Unit Cell: V_cell = a^3 = (2 * sqrt(2) * r)^3 = 16 * sqrt(2) * r^3.
- APF Calculation:
APF = [ (16/3) * pi * r^3 ] / [ 16 * sqrt(2) * r^3 ] = pi / (3 * sqrt(2)) = 3.14159 / 4.2426 = 0.7404 (74%).`
    },
    {
        subject: 'Physics',
        subCategory: 'Electrodynamics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q9. What is displacement current? Derive the modified Ampere’s law with Maxwell’s correction to it. OR Derive the current continuity equation and discuss relaxation time. (CO2 - 10 Marks)',
        standardAnswer: `Option 1: Displacement Current & Maxwell-Ampere Law:
1. Displacement Current: Maxwell hypothesized that a time-varying electric flux produces an effective magnetic field, represented by displacement current density: J_d = epsilon_0 * (dE / dt).
2. Derivation:
- Original Ampere's Law: curl B = mu_0 * J. Taking divergence: div(curl B) = 0 => div(J) = 0 (only valid for steady currents).
- From Continuity Equation: div J = - d(rho) / dt.
- Using Gauss's Law: div E = rho / epsilon_0 => rho = epsilon_0 * div E.
- Differentiating: d(rho)/dt = epsilon_0 * div(dE/dt) => div J + div(epsilon_0 * dE/dt) = 0.
- Defining Total Current: J_total = J + epsilon_0 * (dE/dt).
- Modified Ampere's Law: curl B = mu_0 * (J + epsilon_0 * dE/dt).

Option 2 (OR): Continuity Equation & Relaxation Time:
- Continuity Equation: div J + d(rho)/dt = 0.
- Using Ohm's Law J = sigma * E and Gauss's law div E = rho / epsilon:
sigma * (rho / epsilon) + d(rho)/dt = 0 => d(rho)/dt + (sigma / epsilon) * rho = 0.
- Solution: rho(t) = rho_0 * exp(-t / tau), where Relaxation Time tau = epsilon / sigma.`
    },
    {
        subject: 'Physics',
        subCategory: 'Semiconductor Optics & X-Ray Diffraction',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q10. Attempt both parts: (a) Describe the construction and working of a solar cell, explaining the IV characteristics (10 Marks). (b) A first order reflection from the plane of NaCl is obtained at an angle 2*theta = 20 deg with incident beam. If d_121 = 2.82 Angstroms, calculate the wavelength of X-ray used and lattice parameter (10 Marks). (CO3 - 10+10=20 Marks)',
        standardAnswer: `Part (a) Solar Cell Construction, Working & I-V Curve:
1. Construction: P-N junction photodiode with thin, heavily doped n-layer on top, thick p-substrate below, front metal finger contacts for light penetration, and back ohmic contact.
2. Working Mechanism:
- Absorption of solar photons (h*nu > E_g) generates electron-hole pairs in the depletion region.
- Built-in electric field sweeps electrons to n-side and holes to p-side, producing photo-voltage across open terminals.
3. I-V Characteristics: Operates in 4th quadrant with Open-Circuit Voltage (Voc) and Short-Circuit Current (Isc). Fill Factor FF = (Vmp * Imp) / (Voc * Isc).

Part (b) Bragg Diffraction Calculations:
Given: Order n = 1, Glancing angle 2*theta = 20 deg => theta = 10 deg, Interplanar spacing d = 2.82 Angstroms = 2.82e-10 m.
1. X-Ray Wavelength (Bragg's Law):
2 * d * sin(theta) = n * lambda
lambda = 2 * (2.82 Angstroms) * sin(10 deg) = 2 * 2.82 * 0.17365 = 0.9794 Angstroms (0.09794 nm).
2. Lattice Parameter 'a':
For cubic NaCl crystal: d_hkl = a / sqrt(h^2 + k^2 + l^2)
For plane (1 2 1): sqrt(1^2 + 2^2 + 1^2) = sqrt(6) = 2.4495
a = d_121 * sqrt(6) = 2.82 * 2.4495 = 6.907 Angstroms (0.6907 nm).`
    },
    {
        subject: 'Physics',
        subCategory: 'Dielectrics & Electromagnetic Waves',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q11. Attempt both parts: (a) Show that the relation between dielectric constant and polarizability is given by Clausius-Mossotti relation (10 Marks). (b) Assuming all energy from a 1000 W lamp is radiated uniformly, calculate average values of intensities of electric and magnetic fields at a distance of 2m (10 Marks). (CO1+CO3 - 10+10=20 Marks) \nOR \n(a) Differentiate polar and non-polar dielectrics and types of polarization. (b) If Na solid has cubical symmetry, atomic weight 23, density 1.83 g/cm^3, alpha_e = 2.39e-40 F-m^2, find its relative dielectric constant.',
        standardAnswer: `Part (a) Clausius-Mossotti Relation Derivation:
1. Local Field in Dielectric: E_local = E + P / (3 * epsilon_0).
2. Polarization: P = N * alpha * E_local = N * alpha * [ E + P / (3 * epsilon_0) ].
3. Rearranging: P * [ 1 - (N * alpha) / (3 * epsilon_0) ] = N * alpha * E.
4. Using D = epsilon_0 * epsilon_r * E = epsilon_0 * E + P => P = epsilon_0 * (epsilon_r - 1) * E.
5. Equating and simplifying yields Clausius-Mossotti equation:
(epsilon_r - 1) / (epsilon_r + 2) = (N * alpha) / (3 * epsilon_0).

Part (b) Electromagnetic Radiation from 1000 W Lamp:
Given: Power P = 1000 W, Distance r = 2 m.
1. Intensity (Poynting Vector Magnitude):
I = Power / (4 * pi * r^2) = 1000 / (4 * 3.1416 * 4) = 1000 / 50.265 = 19.894 W/m^2.
2. Electric Field Intensity E_rms:
I = c * epsilon_0 * E_rms^2 => E_rms = sqrt( I / (c * epsilon_0) )
E_rms = sqrt( 19.894 / (3e8 * 8.85e-12) ) = sqrt( 19.894 / 2.655e-3 ) = sqrt(7493) = 86.56 V/m.
3. Magnetic Field Intensity H_rms:
H_rms = E_rms / eta_0 = 86.56 / 377 = 0.2296 A/m.`
    }
];

async function seedBitCurriculum(passedTeacherId) {
    console.log('🚀 Seeding Bhilai Institute of Technology (BIT 1 Nov 2026) Question Bank...');

    try {
        let teacherId = passedTeacherId;
        if (!teacherId) {
            const tRes = await query("SELECT id FROM users WHERE role = 'teacher' LIMIT 1");
            teacherId = tRes.length > 0 ? tRes[0].id : generateId();
        }

        let insertedCount = 0;
        const insertedQuestionIds = [];

        for (const item of bitQuestionsData) {
            const existing = await query("SELECT id FROM questions WHERE question_text = $1", [item.questionText]);
            let qId;
            if (existing.length === 0) {
                qId = generateId();
                await execute(
                    `INSERT INTO questions (id, subject, sub_category, type, max_marks, question_text, standard_answer, created_by, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
                    [qId, item.subject, item.subCategory, item.type, item.maxMarks, item.questionText, item.standardAnswer, teacherId]
                );
                insertedCount++;
            } else {
                qId = existing[0].id;
                // Update standard answer to ensure full rubric
                await execute(
                    `UPDATE questions SET standard_answer = $1, max_marks = $2, sub_category = $3 WHERE id = $4`,
                    [item.standardAnswer, item.maxMarks, item.subCategory, qId]
                );
            }
            insertedQuestionIds.push({ id: qId, subject: item.subject });
        }

        console.log(`✅ Processed all ${bitQuestionsData.length} BIT questions across all 3 subjects.`);

        // Ensure all assignments (both new and existing variations like "BIT Nov 2026 - ...") have all 11 questions linked
        const subjects = [
            { name: 'Basic Electronics', title: 'BIT Nov 2026 - Basic Electrical & Electronics Engineering (ECEG-1013)' },
            { name: 'Basic Programming', title: 'BIT Nov 2026 - Programming for Engineers / MATLAB (MECH 2078)' },
            { name: 'Physics', title: 'BIT Nov 2026 - Engineering Physics (PHYS 1038)' }
        ];

        // Clean up legacy questions for BIT subjects that are not in the current official 11-question set
        for (const sub of subjects) {
            const currentOfficialTexts = bitQuestionsData.filter(q => q.subject === sub.name).map(q => q.questionText);
            const allDbQuestions = await query("SELECT id, question_text FROM questions WHERE subject = $1", [sub.name]);
            for (const dbQ of allDbQuestions) {
                if (!currentOfficialTexts.includes(dbQ.question_text)) {
                    await execute("DELETE FROM assignment_questions WHERE question_id = $1", [dbQ.id]);
                    await execute("DELETE FROM submissions WHERE question_id = $1", [dbQ.id]);
                    await execute("DELETE FROM questions WHERE id = $1", [dbQ.id]);
                }
            }
        }

        for (const sub of subjects) {
            const subQuestions = insertedQuestionIds.filter(q => q.subject === sub.name);
            
            // Find or create assignment for this subject
            let targetAssignments = await query(
                "SELECT id FROM assignments WHERE subject = $1",
                [sub.name]
            );

            if (targetAssignments.length === 0) {
                const newAssignId = generateId();
                await execute(
                    `INSERT INTO assignments (id, title, instructions, subject, teacher_id, created_at)
                     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
                    [newAssignId, sub.title, `Official BIT End-Semester Examination with full 11 questions (Sections A, B, C).`, sub.name, teacherId]
                );
                console.log(`✅ Created Assignment: ${sub.title}`);
                targetAssignments = [{ id: newAssignId }];
            }

            for (const assign of targetAssignments) {
                // Remove any question links belonging to other subjects
                await execute(
                    `DELETE FROM assignment_questions 
                     WHERE assignment_id = $1 
                     AND question_id IN (SELECT id FROM questions WHERE subject != $2)`,
                    [assign.id, sub.name]
                );

                // Link all 11 questions of this subject
                for (let idx = 0; idx < subQuestions.length; idx++) {
                    const q = subQuestions[idx];
                    const linkExisting = await query(
                        "SELECT question_id FROM assignment_questions WHERE assignment_id = $1 AND question_id = $2",
                        [assign.id, q.id]
                    );
                    if (linkExisting.length === 0) {
                        await execute(
                            `INSERT INTO assignment_questions (assignment_id, question_id, max_points)
                             VALUES ($1, $2, 100)`,
                            [assign.id, q.id, 100]
                        );
                    }
                }
            }
        }

        console.log('🎉 BIT 1 Nov 2026 Question Bank & Assignments seeded successfully!');
    } catch (err) {
        console.error('Error seeding BIT questions:', err);
    }
}

module.exports = {
    seedBitCurriculum,
    bitQuestionsData
};
