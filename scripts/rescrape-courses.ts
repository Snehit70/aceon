
import fs from 'fs';
import path from 'path';

const API_BASE = "https://project-b-backend-3uoftpsktq-el.a.run.app";
const TOKEN_FILE = path.join(process.cwd(), 'token.txt');

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Origin": "https://acegrade.in",
    "Referer": "https://acegrade.in/",
    "Accept": "application/json",
};

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

async function fetchCourse(courseId: string) {
    const token = getToken();
    if (!token) {
        console.error("❌ No token found in token.txt");
        process.exit(1);
    }

    const url = `${API_BASE}/backendapi/course/${courseId}`;
    console.log(`📡 Fetching ${courseId}...`);

    const res = await fetch(url, {
        method: "GET",
        headers: { ...HEADERS, "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error(`❌ Failed: ${res.status} ${res.statusText}`);
        return null;
    }

    const data = await res.json();
    console.log(`✅ Received ${data.week_wise?.length || 0} weeks`);
    return data;
}

async function main() {
    const targetCourses = process.argv.slice(2);
    
    if (targetCourses.length === 0) {
        console.log("Usage: bun scripts/rescrape-courses.ts ma1001 [ma1002] [cs1001] ...");
        console.log("\nThis will re-scrape specific courses and save to data_course:_[code].json");
        process.exit(0);
    }

    console.log(`🚀 Re-scraping ${targetCourses.length} course(s): ${targetCourses.join(", ")}\n`);

    for (const code of targetCourses) {
        const courseId = `ns_24t3_${code.toLowerCase()}`;
        const data = await fetchCourse(courseId);
        
        if (data) {
            const filename = `data_course:_${code.toLowerCase()}.json`;
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`💾 Saved to ${filename}`);
            
            if (data.week_wise) {
                console.log(`   Weeks found: ${data.week_wise.length}`);
                data.week_wise.forEach((w: { title: string; videos: unknown[] }, i: number) => {
                    console.log(`     ${i+1}. ${w.title}: ${w.videos?.length || 0} videos`);
                });
            }
        }
        
        console.log("");
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("✨ Scraping complete! Now run: bun scripts/reseed-courses.ts " + targetCourses.join(" "));
}

main();
