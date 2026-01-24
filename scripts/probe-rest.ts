import fs from "fs";

const token = fs.readFileSync("secret_token.txt", "utf-8").trim();
// Known good course ID
const url = "https://seek-ode-prod.el.r.appspot.com/backendapi/course/ns_24t3_cs1001";

async function probe() {
  console.log(`Probing REST API at ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    console.log(`Status: ${res.status}`);
    if (res.ok) {
        console.log("Success!");
    } else {
        console.log("Failed. Headers:", res.headers);
    }

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

probe();
