import fs from "fs";

const token = fs.readFileSync("secret_token.txt", "utf-8").trim();

async function probe() {
  const urls = [
    "https://ds.study.iitm.ac.in/student_dashboard/student_courses",
    "https://ds.study.iitm.ac.in/api/student_dashboard/student_courses",
    "https://seek-ode-prod.el.r.appspot.com/backendapi/student/courses", // Guess based on previous scrapes
    "https://seek-ode-prod.el.r.appspot.com/backendapi/student_dashboard"
  ];

  for (const url of urls) {
    console.log(`Trying ${url}...`);
    try {
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log("Success! Response preview:");
        console.log(text.substring(0, 500));
        // Save if successful
        if (text.startsWith("{") || text.startsWith("[")) {
            fs.writeFileSync("data_probe_courses.json", text);
            console.log("Saved to data_probe_courses.json");
            break; // Stop after first success
        }
      }
    } catch (e: any) {
      console.error("Error:", e.message);
    }
  }
}

probe();
