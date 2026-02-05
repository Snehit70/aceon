/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";

const token = fs.readFileSync("secret_token.txt", "utf-8").trim();
const endpoint = "https://open-nptel-nk7eaoz6ha-el.a.run.app/graphql";

async function probe() {
  const query = `
    query lesson($id_: String!, $namespace: String!) {
      lesson(id_: $id_, namespace: $namespace) {
        id
        title
        video
        transcriptVttUrl
        objectives
        lessonId
        __typename
      }
    }
  `;

  const variables = {
    id_: "2", // Example lesson ID
    namespace: "ns_25t3_cs2006" // Example course
  };

  console.log(`Probing GraphQL at ${endpoint}...`);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "seek_id_token": token,
        "Content-Type": "application/json",
        "Origin": "https://seek.onlinedegree.iitm.ac.in",
        "Referer": "https://seek.onlinedegree.iitm.ac.in/",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0"
      },
      body: JSON.stringify({ 
        operationName: "IntrospectionQuery",
        query: `
          query IntrospectionQuery {
            __schema {
              queryType { name fields { name description args { name type { name kind } } } }
              mutationType { name fields { name description } }
              types { kind name description }
            }
          }
        `
      })
    });
    
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
    } else {
      console.log("Schema Query Fields:");
      const fields = data.data.__schema.queryType.fields;
      fields.forEach((f: any) => console.log(`- ${f.name}: ${f.description || "(no description)"}`));
      
      fs.writeFileSync("data_graphql_schema.json", JSON.stringify(data, null, 2));
    }

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

probe();
