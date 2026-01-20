import fs from 'fs';
import path from 'path';

const API_BASE = "https://project-b-backend-3uoftpsktq-el.a.run.app";
const TOKEN_FILE = path.join(process.cwd(), 'token.txt');

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

async function probe(endpoint: string, method: string = 'GET') {
    const token = getToken();
    if (!token) {
        console.error("No token found");
        process.exit(1);
    }

    const url = `${API_BASE}${endpoint}`;
    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "https://acegrade.in",
                "Referer": "https://acegrade.in/",
                "Accept": "application/json"
            }
        });

        const status = res.status;
        const type = res.headers.get("content-type");
        // const len = res.headers.get("content-length"); // Unused

        let preview = "";
        if (type?.includes("json")) {
            const json = await res.json();
            preview = JSON.stringify(json).slice(0, 100);
        } else {
            const text = await res.text();
            preview = text.slice(0, 100).replace(/\n/g, " ");
        }

        console.log(`${method} ${endpoint.padEnd(40)} : ${status} [${type || 'unknown'}] - ${preview}`);

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.log(`${method} ${endpoint.padEnd(40)} : ERROR ${message}`);
    }
}

async function main() {
    console.log("🔍 Probing API Endpoints on " + API_BASE);

    const endpoints = [
        "/",
        "/backendapi",
        "/authorize",
        "/course/userCoursesData",
        "/backendapi/courses",
        "/backendapi/user",
        "/backendapi/users",
        "/backendapi/me",
        "/backendapi/profile",
        "/backendapi/dashboard",
        "/backendapi/search",
        "/backendapi/config",
        "/backendapi/settings",
        "/backendapi/notifications",
        "/backendapi/announcements",
        // Known course structure probes
        "/backendapi/course/ns_24t3_cs1001",
        "/backendapi/course/ns_24t3_cs1001/assignments",
        "/backendapi/course/ns_24t3_cs1001/quizzes",
        "/backendapi/course/ns_24t3_cs1001/resources",
        "/backendapi/course/ns_24t3_cs1001/videos",
        "/backendapi/course/ns_24t3_cs1001/modules",
        // Common google cloud run paths
        "/health",
        "/status",
        "/version",
        // Firestore style (unlikely but checking)
        "/documents",
        "/databases"
    ];

    for (const ep of endpoints) {
        await probe(ep);
        await new Promise(r => setTimeout(r, 200));
    }
}

main();
