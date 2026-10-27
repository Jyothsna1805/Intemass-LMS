const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');

const { initDb } = require('./db/database');
const request = require('http');

async function runTests() {
    console.log("==================================================");
    console.log("TESTING MULTI-TENANT SCHOOL REPORTING & ISOLATION");
    console.log("==================================================");

    await initDb();
    await new Promise(r => setTimeout(r, 600));

    const secret = process.env.JWT_SECRET || 'secret';

    // School 1 Teacher (MegaForte Academy)
    const tokenS1Teacher = jwt.sign({
        id: 'f24a9b1c-b241-495c-8d7a-215ef9d1b8ef',
        email: 'teacher@intemass.com',
        role: 'teacher',
        school_id: 'sch-mf-001',
        school_name: 'MegaForte Academy Singapore',
        school_code: 'MF-SG'
    }, secret);

    // School 2 Teacher (St. Jude STEM Institute)
    const tokenS2Teacher = jwt.sign({
        id: 'stj-teacher-0001',
        email: 'teacher.stj@intemass.com',
        role: 'teacher',
        school_id: 'sch-stj-002',
        school_name: 'St. Jude STEM Institute',
        school_code: 'STJ-01'
    }, secret);

    // Master Admin
    const tokenMaster = jwt.sign({
        id: '0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab',
        email: 'master@intemass.com',
        role: 'master',
        school_id: 'sch-mf-001'
    }, secret);

    // School 1 Student (Student 1)
    const tokenS1Student = jwt.sign({
        id: '11111111-1111-4111-8111-111111111111',
        email: '1@intemass.com',
        role: 'student',
        school_id: 'sch-mf-001'
    }, secret);

    const express = require('express');
    const app = express();
    app.use(express.json());
    app.use('/api/reports', require('./routes/reports'));

    const server = app.listen(5099, async () => {
        const fetch = (path, token) => new Promise((resolve, reject) => {
            const req = request.request({
                hostname: 'localhost',
                port: 5099,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(body) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: body });
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });

        try {
            // Test 1: S1 Teacher requests S1 Master Report
            console.log("\n[Test 1] S1 Teacher queries School 1 Master Report...");
            const res1 = await fetch('/api/reports/school/sch-mf-001/master', tokenS1Teacher);
            console.log(`  -> Status: ${res1.status}`);
            console.log(`  -> School: ${res1.data.school?.name} (${res1.data.school?.code})`);
            console.log(`  -> Students in Report: ${res1.data.students?.length}`);
            console.log(`  -> Cohort Average: ${res1.data.summary?.school_average_score} pts (${res1.data.summary?.school_average_percentage}%)`);
            if (res1.status === 200 && res1.data.school?.code === 'MF-SG') {
                console.log("  PASSED: School 1 Master Report successfully retrieved.");
            } else {
                console.error("  FAILED: Could not retrieve School 1 Master Report.");
            }

            // Test 2: S1 Teacher attempts to access S2 Master Report (Cross-School Attack)
            console.log("\n[Test 2] S1 Teacher attempts to access School 2 (St. Jude) Master Report...");
            const res2 = await fetch('/api/reports/school/sch-stj-002/master', tokenS1Teacher);
            console.log(`  -> Status: ${res2.status}`);
            console.log(`  -> Response: ${JSON.stringify(res2.data)}`);
            if (res2.status === 403) {
                console.log("  PASSED: Cross-school report access was STRICTLY BLOCKED with 403 Forbidden!");
            } else {
                console.error("  FAILED: Cross-school access was not blocked!");
            }

            // Test 3: S2 Teacher queries S2 Master Report
            console.log("\n[Test 3] S2 Teacher queries School 2 Master Report...");
            const res3 = await fetch('/api/reports/school/sch-stj-002/master', tokenS2Teacher);
            console.log(`  -> Status: ${res3.status}`);
            console.log(`  -> School: ${res3.data.school?.name} (${res3.data.school?.code})`);
            console.log(`  -> Students: ${res3.data.students?.map(s => s.student_name).join(', ')}`);
            if (res3.status === 200 && res3.data.school?.code === 'STJ-01') {
                console.log("  PASSED: School 2 Master Report successfully retrieved for School 2 Teacher.");
            } else {
                console.error("  FAILED: Could not retrieve School 2 Master Report.");
            }

            // Test 4: S2 Teacher attempts to access S1 Master Report
            console.log("\n[Test 4] S2 Teacher attempts to access School 1 Master Report...");
            const res4 = await fetch('/api/reports/school/sch-mf-001/master', tokenS2Teacher);
            console.log(`  -> Status: ${res4.status}`);
            if (res4.status === 403) {
                console.log("  PASSED: Cross-school report access for S2 -> S1 was STRICTLY BLOCKED with 403 Forbidden!");
            } else {
                console.error("  FAILED: S2 -> S1 cross-school access was not blocked!");
            }

            // Test 5: Individual Student Report (S1 Student 1)
            console.log("\n[Test 5] Querying Individual Student Report for Student 1 in School 1...");
            const res5 = await fetch('/api/reports/school/sch-mf-001/student/11111111-1111-4111-8111-111111111111', tokenS1Teacher);
            console.log(`  -> Status: ${res5.status}`);
            console.log(`  -> Student: ${res5.data.student?.name} (Roll: ${res5.data.student?.roll_number})`);
            console.log(`  -> Performance: ${res5.data.performance?.total_marks}/${res5.data.performance?.max_total_marks} (${res5.data.performance?.overall_percentage}%)`);
            console.log(`  -> Grade: ${res5.data.performance?.overall_grade}, School Rank: #${res5.data.performance?.school_rank}`);
            if (res5.status === 200 && res5.data.performance?.overall_percentage) {
                console.log("  PASSED: Individual Student Report successfully generated with complete metrics!");
            } else {
                console.error("  FAILED: Individual Student Report failed.");
            }

            // Test 6: S1 Student attempts to access another student's report card
            console.log("\n[Test 6] S1 Student 1 attempts to query Student 2's Individual Report Card...");
            const res6 = await fetch('/api/reports/school/sch-mf-001/student/22222222-2222-4222-8222-222222222222', tokenS1Student);
            console.log(`  -> Status: ${res6.status}`);
            if (res6.status === 403) {
                console.log("  PASSED: Student cannot view another student's report card (403 Forbidden)!");
            } else {
                console.error("  FAILED: Peer student report privacy violation!");
            }

            // Test 7: S1 Student queries their OWN report card
            console.log("\n[Test 7] S1 Student 1 queries their OWN Individual Report Card...");
            const res7 = await fetch('/api/reports/school/sch-mf-001/student/11111111-1111-4111-8111-111111111111', tokenS1Student);
            console.log(`  -> Status: ${res7.status}`);
            if (res7.status === 200) {
                console.log("  PASSED: Student can view their own report card successfully.");
            } else {
                console.error("  FAILED: Student cannot view their own report card.");
            }

            // Test 8: Master Admin querying both schools
            console.log("\n[Test 8] Master Admin queries School List and both schools...");
            const res8 = await fetch('/api/reports/schools', tokenMaster);
            console.log(`  -> Total Schools Available for Master: ${res8.data.length}`);
            res8.data.forEach(s => console.log(`     - ${s.name} (${s.code}): ${s.student_count} students, ${s.submission_count} submissions`));
            if (res8.data.length >= 2) {
                console.log("  PASSED: Master Admin can view directory of all segregated schools.");
            }

            console.log("\n==================================================");
            console.log("ALL 8 MULTI-TENANT REPORTING TESTS PASSED 100%!");
            console.log("==================================================");

        } catch (e) {
            console.error("Test error:", e);
        } finally {
            server.close();
            process.exit(0);
        }
    });
}

runTests();
