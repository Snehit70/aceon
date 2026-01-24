import fs from "fs";

const token = fs.readFileSync("secret_token.txt", "utf-8").trim();
// Course ID from your URL
const courseId = "ns_25t3_cs2006"; 

async function probe() {
  const urls = [
    `https://seek-ode-prod.el.r.appspot.com/backendapi/course/${courseId}`,
    `https://seek.onlinedegree.iitm.ac.in/backendapi/course/${courseId}`,
    `https://seek-ode-prod.el.r.appspot.com/api/course/${courseId}`,
    `https://seek.onlinedegree.iitm.ac.in/api/course/${courseId}`
  ];

  for (const url of urls) {
    console.log(`Probing ${url}...`);
    try {
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log("Success! Response preview:");
        console.log(text.substring(0, 500));
        fs.writeFileSync("data_probe_seek.json", text);
        console.log("Saved to data_probe_seek.json");
        break;
      } else {
        console.log("Headers:", res.headers);
      }
    } catch (e: any) {
      console.error("Error:", e.message);
    }
  }
}

probe();
