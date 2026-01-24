import fs from 'fs';
import path from 'path';

const API_BASE = "https://project-b-backend-3uoftpsktq-el.a.run.app";
const TOKEN_FILE = path.join(process.cwd(), 'token.txt');

// Headers configuration
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://acegrade.in",
    "Referer": "https://acegrade.in/",
    "Accept": "application/json",
};

// 1. Get Token
function getToken(): string | null {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    try {
        const content = fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
        if (content.startsWith('{')) {
            const data = JSON.parse(content);
            return data.stsTokenManager?.accessToken || null;
        }
        return content;
    } catch {
        return null;
    }
}

async function fetchEndpoint(endpoint: string, description: string, method: "GET" | "POST" = "GET", body?: Record<string, unknown>) {
    const token = getToken();
    if (!token) {
        console.error("❌ No token found. Please run extract_token.html in your browser first.");
        process.exit(1);
    }

    const url = `${API_BASE}${endpoint}`;
    console.log(`\n📡 Fetching ${description} [${method}]...`);
    console.log(`   URL: ${url}`);

    try {
        const options: RequestInit = {
            method,
            headers: {
                ...HEADERS,
                "Authorization": `Bearer ${token}`
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
            options.headers = {
                ...options.headers,
                "Content-Type": "application/json"
            };
        }

        const res = await fetch(url, options);

        if (!res.ok) {
            console.error(`   ❌ Failed: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log(`   Response: ${text.slice(0, 200)}...`);
            return null;
        }

        const data = await res.json();
        console.log(`   ✅ Success! Received ${JSON.stringify(data).length} bytes`);

        // Save raw response
        const filename = `data_${description.replace(/[\s\/]+/g, '_').toLowerCase()}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`   💾 Saved to ${filename}`);
        return data;

    } catch (e: unknown) {
        console.error(`   ⚠️ Error:`, e);
        return null;
    }
}

async function main() {
    console.log("🚀 Starting AceGrade Backend Scraper");

    // 1. Check Auth & User Info
    const authData = await fetchEndpoint('/authorize', 'Auth Info');

    if (!authData) {
        console.error("❌ Could not fetch auth info. Aborting.");
        return;
    }

    const { roll_no } = authData;
    console.log(`\n👤 User: ${authData.name} (${roll_no})`);

    // 2. Verify Single Course Fetch (to confirm pattern)
    // We know 'ns_24t3_cs2001' exists from previous context. Let's see if we can fetch it.
    // This helps us understand the URL structure.
    await fetchEndpoint('/backendapi/course/ns_24t3_cs2001', 'Verify Single Course');

    // 3. Brute Force Known IITM BS Course Codes
    // We know the pattern is ns_24t3_{code}
    // List based on standard IITM BS curriculum
    const courseCodes = [
        // Foundation Level (8 courses - 32 credits)
        'ma1001', // Mathematics for Data Science I
        'bsse2002',
        'bsms2002', 
        'bsda2001',
        'bscs3001',
        'bsgn3001'
    ];

    console.log(`\n🔍 Scraping targeted course: MA1001...`);

    const validCourses: { code: string; id: string; title: string }[] = [];

    for (const code of courseCodes) {
        const courseId = `ns_24t3_${code}`;
        // Skip if we already verified it manually above (optional optimization, but keep simple)

        const data = await fetchEndpoint(`/backendapi/course/${courseId}`, `Course: ${code.toUpperCase()}`);

        if (data) {
            validCourses.push({ code, id: courseId, title: data.title });
            // Save individual course file is already handled by fetchEndpoint
        }

        // Polite delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    // Save index of valid courses
    if (validCourses.length > 0) {
        fs.writeFileSync('data_courses_index.json', JSON.stringify(validCourses, null, 2));
        console.log(`\n✅ Found ${validCourses.length} valid courses. Index saved to data_courses_index.json`);

        // 4. Deep Probe for Assignments/Quizzes (on valid courses)
        console.log("\n🕵️ Probing for Assignments & Quizzes on found courses...");

        // We'll test on a known Diploma course (DBMS) as it's likely to have assignments
        const sampleCourse = validCourses.find(c => c.code === 'cs2001') || validCourses[0];
        console.log(`Testing extra endpoints on ${sampleCourse.id} (${sampleCourse.code})...`);

        const deepProbes = [
            `/backendapi/course/${sampleCourse.id}/assignments`,
            `/backendapi/course/${sampleCourse.id}/quizzes`,
            `/backendapi/course/${sampleCourse.id}/assessments`,
            `/backendapi/course/${sampleCourse.id}/scores`,
            `/backendapi/course/${sampleCourse.id}/grades`,
            `/backendapi/course/${sampleCourse.id}/stats`,
            `/backendapi/course/${sampleCourse.id}/activities`,
            // Try some specific patterns seen in other moodle-like systems
            `/backendapi/quiz/course/${sampleCourse.id}`,
            `/backendapi/assignment/course/${sampleCourse.id}`
        ];

        for (const ep of deepProbes) {
            await fetchEndpoint(ep, `Deep Probe ${ep.split('/').pop()}`);
            await new Promise(r => setTimeout(r, 500));
        }

    } else {
        console.log("\n❌ No additional valid courses found in this list.");
    }
}

main();
