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
    // 3. PHYSICS (PHYS 1038) - 11 QUESTIONS (OFFICIAL STANDARD ANSWER KEY RUBRICS)
    // =========================================================================
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q1. Electron trapped in a one-dimensional potential box of length 10 nm, makes a transition from 3rd excited state to 2nd excited state, Determine the wavelength of the corresponding electromagnetic radiation emitted (4 Marks, CO3)',
        standardAnswer: `1. [1] For a particle in a 1-D box, E_n = n²h²/(8mL²). The 3rd excited state is n = 4 and the 2nd excited state is n = 3.
2. [1] Energy difference: ΔE = (4² − 3²)h²/(8mL²) = 7h²/(8mL²).
3. [1] Substitution: h²/(8mL²) = (6.6×10⁻³⁴)² / (8 × 9.1×10⁻³¹ × (10×10⁻⁹)²) = 5.98×10⁻²² J, so ΔE = 7 × 5.98×10⁻²² = 4.19×10⁻²¹ J.
4. [1] λ = hc/ΔE = (6.6×10⁻³⁴ × 3×10⁸)/(4.19×10⁻²¹) ≈ 4.73×10⁻⁵ m ≈ 47.3 μm (infrared region).`
    },
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q2. State the conditions for a well-behaved quantum mechanical wave function. (4 Marks, CO1)',
        standardAnswer: `1. [1] ψ must be single-valued: one definite value of ψ at each point in space.
2. [1] ψ must be finite everywhere, so that it can be normalised and ∫|ψ|²dV = 1 (square-integrable, ψ → 0 as x → ±∞).
3. [1] ψ must be continuous everywhere, with no sudden jumps.
4. [1] The first derivative dψ/dx must be continuous (smooth) wherever the potential is finite, so that the Schrödinger equation can be satisfied.`
    },
    {
        subject: 'Physics',
        subCategory: 'Crystallography',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q3. Draw the planes (1 2 1) and (2 3 4) on a simple cubic lattice. (4 Marks, CO3)',
        standardAnswer: `1. [1] (121): take reciprocals of the Miller indices, 1/1 : 1/2 : 1/1, giving intercepts x = 1a, y = ½a, z = 1a.
2. [1] Draw the (121) plane on a cubic unit cell with axes x, y, z, joining the three intercept points (1,0,0), (0,½,0) and (0,0,1), correctly labelled.
3. [1] (234): reciprocals 1/2 : 1/3 : 1/4, giving intercepts x = ½a, y = ⅓a, z = ¼a.
4. [1] Draw the (234) plane on a second cubic cell, joining (½,0,0), (0,⅓,0) and (0,0,¼), correctly labelled.`
    },
    {
        subject: 'Physics',
        subCategory: 'Optics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q4. Differentiate between Fraunhoffer’s and Fresnel’s class of diffraction. (4 Marks, CO1)',
        standardAnswer: `1. [1] Source and screen distance: in Fresnel diffraction the source or screen (or both) are at a finite distance from the obstacle. In Fraunhofer diffraction both are effectively at infinity.
2. [1] Wavefront: Fresnel uses spherical or cylindrical wavefronts. Fraunhofer uses plane wavefronts (parallel beam).
3. [1] Experimental set-up: Fresnel needs no lenses. Fraunhofer needs a collimating lens and a focusing lens.
4. [1] Analysis: Fresnel diffraction is mathematically complex (half-period zones, path difference varies non-linearly). Fraunhofer is simpler (path difference is linear in the angle). An example of each may be given, e.g. a straight edge or circular aperture for Fresnel, and a single slit or grating for Fraunhofer.`
    },
    {
        subject: 'Physics',
        subCategory: 'Vector Calculus & Electrodynamics',
        type: 'essay',
        maxMarks: 4,
        questionText: 'Q5. Show that the vector F = (6xy + z³)i + (3x² − z)j + (3xz² − y)k is irrotational. (4 Marks, CO2)',
        standardAnswer: `1. [1] A vector field is irrotational if ∇ × F = 0. Write curl as the determinant with rows (i, j, k), (∂/∂x, ∂/∂y, ∂/∂z), (Fx, Fy, Fz).
2. [1] i-component: ∂Fz/∂y − ∂Fy/∂z = (−1) − (−1) = 0.
3. [1] j-component: ∂Fx/∂z − ∂Fz/∂x = 3z² − 3z² = 0.
4. [1] k-component: ∂Fy/∂x − ∂Fx/∂y = 6x − 6x = 0. Hence ∇ × F = 0 and F is irrotational.`
    },
    {
        subject: 'Physics',
        subCategory: 'Lasers',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q6. One of the most used and safest lasers is the He-Ne laser. Discuss in detail the construction and working of He-Ne LASER. (10 Marks, CO1)',
        standardAnswer: `Construction (4 marks)
1. [1] A long, narrow glass discharge tube (about 30 to 80 cm long, a few mm in bore) acts as the active medium container.
2. [1] It is filled with a mixture of helium and neon in the ratio about 10 : 1 at a low total pressure (about 1 torr). Neon is the active (lasing) atom and helium is the pumping (helper) atom.
3. [1] Two electrodes (anode and cathode) at the ends are connected to a high-voltage DC supply (about 1 to 2 kV) to produce the electric discharge, which is the pumping source.
4. [1] Optical resonator: two parallel mirrors at the ends. One is fully reflecting (about 100 %) and the other partially transmitting (about 98 to 99 %), which provides feedback and the output. Brewster windows may be used to obtain polarised output.

Working (6 marks)
5. [1] The discharge accelerates electrons, which collide with He atoms and excite them to the metastable states 2³S (19.8 eV) and 2¹S (20.6 eV). These states are long-lived, so He atoms accumulate there.
6. [1] The Ne levels 2s (about 20.66 eV) and 3s (about 20.66 eV and nearby) have almost the same energy as the He metastable states. He atoms transfer energy to Ne by resonant (inelastic) collisions, with the helium returning to the ground state.
7. [1] Population inversion: the Ne 3s and 2s levels become highly populated while the lower 3p and 2p levels remain nearly empty. Pumping is therefore indirect (collisional energy transfer).
8. [1] Lasing transitions: 3s → 2p gives the red line at 632.8 nm (the most used). 3s → 3p gives 3.39 μm and 2s → 2p gives 1.15 μm (both infrared).
9. [1] Neon atoms in the lower level decay quickly by spontaneous emission to the 1s level, and then to the ground state by collisions with the tube wall. This keeps the lower level empty and the inversion maintained.
10. [1] Photons emitted by stimulated emission travel back and forth between the mirrors and are amplified. The coherent, highly directional, monochromatic beam leaves through the partially reflecting mirror (typical power 1 to 50 mW, continuous wave).`
    },
    {
        subject: 'Physics',
        subCategory: 'Quantum Mechanics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q7. State the uncertainty principle. Write its different forms (in terms of different conjugate variables) and describe any one application of the uncertainty principle. (3+3+4 = 10 Marks, CO3)',
        standardAnswer: `Statement (3 marks)
1. [1] It is impossible to determine simultaneously and with perfect accuracy both members of a pair of conjugate (canonically related) variables of a particle.
2. [1] The product of the uncertainties of the two variables can never be smaller than a fixed lower limit of the order of h/4π (that is, ħ/2).
3. [1] The origin lies in the wave nature of matter (the wave packet) and the disturbance caused by the act of measurement, not in the imperfection of the instruments.

Different forms (3 marks)
4. [1] Position and momentum: Δx · Δp ≥ ħ/2 (≈ h/4π).
5. [1] Energy and time: ΔE · Δt ≥ ħ/2.
6. [1] Angular momentum and angular position: ΔL · Δθ ≥ ħ/2. (Number and phase, ΔN · Δφ ≥ ½, is also acceptable.)

Any one application (4 marks)
Application: non-existence of electrons inside the nucleus.
7. [1] The nuclear radius is about 10⁻¹⁴ m, so if an electron were confined there, Δx ≈ 10⁻¹⁴ m.
8. [1] Then Δp ≥ ħ/(2Δx) ≈ 1.05×10⁻³⁴ / (2×10⁻¹⁴) ≈ 5.3×10⁻²¹ kg·m/s.
9. [1] The corresponding kinetic energy (relativistic, E ≈ pc) is about 5.3×10⁻²¹ × 3×10⁸ ≈ 1.6×10⁻¹² J ≈ 10 MeV.
10. [1] The beta-particle energies observed from nuclei are only 2 to 3 MeV, much lower than 10 MeV. So electrons cannot be permanently present inside the nucleus; they are created at the time of beta decay. (Accepted alternatives: natural line width, zero-point energy of the harmonic oscillator, or the minimum energy of a particle in a box, each credited with the same four steps.)`
    },
    {
        subject: 'Physics',
        subCategory: 'Crystallography',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q8. What is Atomic Packing Fraction (APF)? Obtain APF for FCC crystal. (10 Marks, CO4)',
        standardAnswer: `1. [1] Definition: APF is the ratio of the volume occupied by the atoms (hard spheres) in a unit cell to the total volume of the unit cell.
2. [1] Formula: APF = (number of atoms per cell × volume of one atom) / (volume of unit cell).
3. [1] In FCC, atoms are located at the 8 corners (each shared by 8 cells) and at the 6 face centres (each shared by 2 cells).
4. [1] Effective number of atoms per cell: n = 8 × (1/8) + 6 × (1/2) = 1 + 3 = 4.
5. [1] Atoms touch along the face diagonal. A diagram of the face of the cube showing the touching atoms should be drawn.
6. [1] Face diagonal = √2·a = 4r (the corner atom contributes r, the face-centre atom 2r, and the other corner r).
7. [1] Therefore a = 4r/√2 = 2√2·r.
8. [1] Volume of the atoms in the cell = 4 × (4/3)πr³ = (16/3)πr³.
9. [1] Volume of the unit cell = a³ = (2√2·r)³ = 16√2·r³.
10. [1] APF = (16πr³/3) / (16√2·r³) = π/(3√2) ≈ 0.74, so 74 % of the volume is filled and 26 % is void (FCC is a close-packed structure).`
    },
    {
        subject: 'Physics',
        subCategory: 'Electrodynamics',
        type: 'essay',
        maxMarks: 10,
        questionText: 'Q9. The concept of displacement current is an important one in Electrodynamics. What is displacement current? Derive the modified Ampere’s law with Maxwell’s correction to it. (4+6 = 10 Marks, CO2) \nOR \nDerive the current continuity equation and discuss how relaxation time influences the establishment of steady-state current flow in conductive materials. (10 Marks)',
        standardAnswer: `Main question: Displacement current and Maxwell's correction (10 marks)
What is displacement current? (4 marks)
1. [1] Displacement current is the current-like term I_d = ε₀ dΦ_E/dt (density J_d = ∂D/∂t = ε₀ ∂E/∂t) that arises from a time-varying electric field.
2. [1] It is not due to the flow of charges; it exists even in vacuum or in a dielectric where no free charge moves.
3. [1] Example: when a capacitor is charged, the conduction current flows in the wires but not across the gap between the plates. The changing electric field between the plates carries the displacement current, which equals the conduction current and makes the total current continuous.
4. [1] It produces a magnetic field just like a conduction current. It was introduced by Maxwell to remove the inconsistency in Ampère's law (see below).
Derivation of the modified Ampère's law (6 marks)
5. [1] Ampère's law in differential form: ∇ × B = μ₀J.
6. [1] Take the divergence of both sides: ∇·(∇ × B) = 0, which gives μ₀(∇·J) = 0, so ∇·J = 0. This contradicts the continuity equation ∇·J = −∂ρ/∂t for time-varying fields.
7. [1] Use Gauss's law ∇·E = ρ/ε₀, so ρ = ε₀∇·E and ∂ρ/∂t = ε₀ ∇·(∂E/∂t).
8. [1] Substitute into the continuity equation: ∇·J = −ε₀ ∇·(∂E/∂t), which means ∇·(J + ε₀ ∂E/∂t) = 0.
9. [1] Maxwell's correction: replace J by J + J_d, with J_d = ε₀ ∂E/∂t. The modified law is ∇ × B = μ₀(J + ε₀ ∂E/∂t).
10. [1] Integral form: ∮B·dl = μ₀(I_c + ε₀ dΦ_E/dt) = μ₀(I_c + I_d). The divergence is now consistent with the continuity equation.

OR: Current continuity equation and relaxation time (10 marks)
1. [1] Consider a closed surface S enclosing volume V with charge q = ∫ρ dV.
2. [1] The current flowing out through S is ∮J·dA, which equals the rate of decrease of charge inside: ∮J·dA = −dq/dt = −(d/dt)∫ρ dV.
3. [1] Apply the divergence theorem: ∮J·dA = ∫(∇·J) dV.
4. [1] Hence ∫(∇·J) dV = −∫(∂ρ/∂t) dV for any volume.
5. [1] Continuity equation: ∇·J + ∂ρ/∂t = 0 (the statement of charge conservation). For steady current, ∂ρ/∂t = 0, so ∇·J = 0.
6. [1] For a conductor, Ohm's law gives J = σE, and Gauss's law gives ∇·E = ρ/ε. Then ∇·J = σρ/ε.
7. [1] Substituting: ∂ρ/∂t + (σ/ε)ρ = 0.
8. [1] Solution: ρ(t) = ρ₀ e^(−t/τ), with relaxation time τ = ε/σ. This is the time for the free charge density to fall to 1/e of its initial value.
9. [1] For good conductors τ is extremely small (about 10⁻¹⁹ to 10⁻¹⁸ s for copper), so any charge imbalance vanishes almost instantly, moving to the surface. The interior stays neutral and the current is steady (∇·J = 0).
10. [1] For poor conductors or insulators τ is large (seconds to hours), so charge decays slowly and steady-state flow takes a long time to establish. Steady state is reached after a few multiples of τ.`
    },
    {
        subject: 'Physics',
        subCategory: 'Semiconductor Optics & X-Ray Diffraction',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q10. Attempt both parts:\na. Describe the construction and working of a solar cell, explaining the IV characteristics. (10 Marks, CO3)\nb. A first order reflection from the plane of NaCl is obtained at an angle 2θ = 20° with the incident beam. If d_121 = 2.82 Å, calculate the wavelength of the X-ray used and also determine the lattice parameter. (10 Marks, CO3)',
        standardAnswer: `(a) Construction, working and I-V characteristics of a solar cell (10 marks)
1. [1] A solar cell is a p-n junction diode that converts light energy directly into electrical energy (photovoltaic effect).
2. [1] Construction: a thin, heavily doped n-type layer (emitter, about 0.3 to 1 μm) sits over a thicker p-type silicon base, forming a p-n junction with a depletion region and a built-in electric field.
3. [1] A metal grid contact on top (so light can enter) and a full metal back contact collect the current. An anti-reflection coating (e.g. SiNx) on top reduces reflection losses. A labelled diagram should be drawn.
4. [1] Working: photons with energy hν ≥ Eg (1.1 eV for Si) are absorbed in or near the depletion region and generate electron-hole pairs.
5. [1] The built-in field sweeps electrons towards the n-side and holes towards the p-side, producing a photovoltage across the junction (open-circuit voltage).
6. [1] When an external load is connected, the photogenerated carriers flow through it as the photocurrent I_L, opposite in direction to the diode forward current.
7. [1] I-V relation: I = I_L − I₀[exp(eV/ηkT) − 1], where I₀ is the reverse saturation current. The curve lies in the fourth quadrant (sketch it with axes labelled).
8. [1] Short-circuit current I_sc = I_L (at V = 0) and open-circuit voltage V_oc = (ηkT/e) ln(I_L/I₀ + 1) (at I = 0) are marked on the curve.
9. [1] The maximum power point (V_m, I_m) gives P_max = V_m·I_m.
10. [1] Fill factor FF = V_m·I_m / (V_oc·I_sc) and efficiency η = P_max/P_in. Under illumination the curve shifts down in proportion to the light intensity; in the dark it is the ordinary diode curve.

(b) Wavelength of the X-ray and lattice parameter (10 marks)
11. [1] Bragg's law: 2d sinθ = nλ.
12. [1] The beam is deflected by 2θ = 20°, so the glancing angle is θ = 10°.
13. [1] First order: n = 1. Given d₁₂₁ = 2.82 Å.
14. [1] Rearrange: λ = 2d sinθ / n.
15. [1] Substitute: λ = 2 × 2.82 × sin 10° = 2 × 2.82 × 0.1736.
16. [1] Wavelength λ ≈ 0.98 Å (about 9.8×10⁻¹¹ m).
17. [1] For a cubic crystal d_hkl = a / √(h² + k² + l²).
18. [1] For (121): h² + k² + l² = 1 + 4 + 1 = 6, so d₁₂₁ = a/√6.
19. [1] Rearrange: a = d₁₂₁ × √6 = 2.82 × 2.449.
20. [1] Lattice parameter a ≈ 6.91 Å. (Use the data as given. Marks are for method and values consistent with d₁₂₁ = 2.82 Å, even though the standard NaCl value is 5.64 Å.)`
    },
    {
        subject: 'Physics',
        subCategory: 'Dielectrics & Electromagnetic Waves',
        type: 'essay',
        maxMarks: 20,
        questionText: 'Q11. Attempt either the main question or the OR option:\na. Show that the relation between dielectric constant, a macroscopic parameter, and polarizability, a microscopic parameter, is given by ε_r = (1 + 2Nα/3ε₀) / (1 - Nα/3ε₀) where the symbols have their usual meanings. (10 Marks, CO1)\nb. Assuming that all the energy from a 1000 W lamp is radiated uniformly, Calculate the average values of the intensities of electric and magnetic fields of radiation at a distance of 2m from the lamp. (10 Marks, CO3)\nOR\na. Analyze and differentiate between polar and non-polar dielectric materials. Explain the different kinds of polarizations that can take place within a given dielectric material. (10 Marks, CO1)\nb. The atomic weight and density of Na are 23 and 1.83 gm/cm³ respectively. The electronic polarizability of the atoms is 2.39 × 10⁻⁴⁰ F-m². If Na solid has cubical symmetry, what will be its relative dielectric constant. (10 Marks, CO3)',
        standardAnswer: `Main question (20 marks)
(a) Relation between dielectric constant and polarisability (10 marks)
1. [1] Polarisation P is the dipole moment per unit volume: P = Np, where N is the number of atoms per unit volume and the induced dipole moment is p = αE_i.
2. [1] So P = NαE_i, where E_i is the internal (local) field acting on an atom. It is not the same as the applied field E.
3. [1] Lorentz internal field: E_i = E₀ + E₁ + E₂ + E₃, where E₀ is the applied field, E₁ = −P/ε₀ is the depolarising field of the outer surfaces (E₀ + E₁ = E, the macroscopic field), E₂ = P/(3ε₀) is the field from the charges on the surface of the imaginary Lorentz sphere, and E₃ = 0 for a cubic lattice (dipoles inside the sphere cancel).
4. [1] For a cubic lattice (or isotropic medium): E_i = E + P/(3ε₀).
5. [1] Substitute in P = NαE_i: P = Nα(E + P/3ε₀).
6. [1] Rearrange: P(1 − Nα/3ε₀) = NαE, so P = NαE / (1 − Nα/3ε₀).
7. [1] By definition of susceptibility, P = ε₀(ε_r − 1)E.
8. [1] Equate the two: ε₀(ε_r − 1) = Nα / (1 − Nα/3ε₀).
9. [1] Then ε_r − 1 = (Nα/ε₀) / (1 − Nα/3ε₀) and ε_r = [1 − Nα/3ε₀ + Nα/ε₀] / (1 − Nα/3ε₀).
10. [1] Simplifying: ε_r = (1 + 2Nα/3ε₀) / (1 − Nα/3ε₀), the Clausius-Mossotti relation, linking macroscopic ε_r to microscopic α.

(b) Field intensities at 2 m from a 1000 W lamp (10 marks)
11. [1] Radiation is uniform in all directions, so the intensity at r is I = P/(4πr²).
12. [1] I = 1000 / (4π × 2²) = 1000 / 50.27 ≈ 19.9 W/m².
13. [1] The average intensity of an EM wave is I = ½ε₀cE₀² = ε₀cE_rms².
14. [1] Electric field: E_rms = √(I/ε₀c) = √(19.9 / (8.85×10⁻¹² × 3×10⁸)) = √(19.9/2.655×10⁻³) ≈ 86.6 V/m.
15. [1] The corresponding peak value is E₀ = √2 × 86.6 ≈ 122 V/m.
16. [1] Magnetic field: B = E/c, so B_rms = 86.6 / (3×10⁸).
17. [1] B_rms ≈ 2.89×10⁻⁷ T.
18. [1] The peak value is B₀ ≈ 4.08×10⁻⁷ T.
19. [1] Check: I = E_rms·B_rms/μ₀ = 86.6 × 2.89×10⁻⁷ / (4π×10⁻⁷) ≈ 19.9 W/m². (Either rms or peak values are accepted if stated clearly.)
20. [1] Units stated correctly (E in V/m, B in tesla) and the final answers clearly stated.

OR option (20 marks)
(a) Polar and non-polar dielectrics, and kinds of polarisation (10 marks)
1. [1] Non-polar dielectrics: molecules have their positive and negative charge centres coinciding, so there is no permanent dipole moment (e.g. H₂, N₂, CH₄, Ar).
2. [1] In a non-polar dielectric, dipoles are induced only when an electric field is applied, and they vanish when the field is removed.
3. [1] Polar dielectrics: molecules have non-coinciding charge centres, so they carry a permanent dipole moment (e.g. H₂O, HCl, NH₃, CO).
4. [1] Without a field the permanent dipoles are randomly oriented by thermal motion and the net moment is zero. In a field they tend to align.
5. [1] Difference: polarisation of a polar dielectric depends on temperature (decreasing as T rises, Curie law), while that of a non-polar dielectric is practically independent of temperature. Polar dielectrics also have much larger dielectric constants.
6. [1] Electronic polarisation: displacement of the electron cloud relative to the nucleus. It occurs in all dielectrics and is independent of temperature, with α_e = 4πε₀R³ (frequency range up to about 10¹⁵ Hz).
7. [1] Ionic polarisation: relative displacement of positive and negative ions in ionic crystals (e.g. NaCl). It is independent of temperature (up to about 10¹³ Hz).
8. [1] Orientational (dipolar) polarisation: alignment of permanent dipoles along the field in polar dielectrics. It depends on temperature (α_o = p²/3kT) and exists at low frequencies (up to about 10⁶ Hz).
9. [1] Space-charge (interfacial) polarisation: accumulation of charges at interfaces, grain boundaries or electrodes in non-homogeneous dielectrics. It is seen at low frequencies (up to about 10³ Hz).
10. [1] Total polarisability α = α_e + α_i + α_o + (space charge). Diagrams of each, and the fall in the contributions as frequency rises, should be given.

(b) Dielectric constant of sodium (10 marks)
11. [1] Number of atoms per unit volume: N = ρN_A/M.
12. [1] ρ = 1.83 g/cm³ = 1.83×10³ kg/m³ (or work in g/cm³ and convert), M = 23 g/mol.
13. [1] N = (1.83 × 6.023×10²³)/23 = 4.79×10²² per cm³.
14. [1] Convert to SI: N = 4.79×10²⁸ atoms/m³.
15. [1] For a cubic lattice, use the Clausius-Mossotti relation (ε_r − 1)/(ε_r + 2) = Nα/3ε₀, or equivalently ε_r = (1 + 2Nα/3ε₀)/(1 − Nα/3ε₀).
16. [1] Compute Nα = 4.79×10²⁸ × 2.39×10⁻⁴⁰ = 1.145×10⁻¹¹ F/m.
17. [1] Compute 3ε₀ = 3 × 8.85×10⁻¹² = 2.655×10⁻¹¹ F/m.
18. [1] Nα/3ε₀ = 1.145×10⁻¹¹ / 2.655×10⁻¹¹ ≈ 0.431.
19. [1] Substitute: ε_r = (1 + 2 × 0.431) / (1 − 0.431) = 1.862 / 0.569.
20. [1] Relative dielectric constant ε_r ≈ 3.28 (dimensionless).`
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
                             VALUES ($1, $2, $3)`,
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
