import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'secret_token.txt');
const GRAPHQL_ENDPOINT = 'https://open-nptel-nk7eaoz6ha-el.a.run.app/graphql';

async function main() {
  // 1. Read Token
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('❌ secret_token.txt not found!');
    process.exit(1);
  }
  const token = fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
  console.log('🔑 Token read successfully');

  // 2. Define Namespace and Session (from HAR)
  const NAMESPACE = process.argv[2] || 'ns_25t1_ma1001'; 
  const SESSION_ID = '76f787bc-2c84-4009-a85b-5f151acf334c'; // From HAR

  // 3. Construct Query
  const query = {
    operationName: 'course',
    variables: { namespace: NAMESPACE },
    query: `query course($namespace: String!) {
      course(namespace: $namespace) {
        courseOutlineWithChildrenOrder
        title
        blurb
        mainImageDumped
        forumUrl
        examMode
        examType
        isSeeyaWhitelisted
        isSelfPacedCourse
        organisationInfo
        __typename
      }
    }`
  };

  // 4. Send Request
  console.log(`📡 Fetching course data for: ${NAMESPACE}...`);
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'seek_id_token': token,
        'seek_namespace': NAMESPACE,
        'exam_session': SESSION_ID,
        'Origin': 'https://seek.onlinedegree.iitm.ac.in',
        'Referer': 'https://seek.onlinedegree.iitm.ac.in/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response body:', text);
      return;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      return;
    }

    if (!data.data || !data.data.course) {
      console.error('❌ No course data returned (possibly null).');
      console.log('Full response:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('✅ Success! Course data received.');
    console.log('Title:', data.data.course.title);
    
    // Parse the outline JSON string
    if (data.data.course.courseOutlineWithChildrenOrder) {
      const outline = JSON.parse(data.data.course.courseOutlineWithChildrenOrder);
      console.log(`📚 Outline contains ${outline.length} top-level items.`);
      if (outline.length > 0) {
        console.log('Sample item:', outline[0]?.title);
        // Save to file for inspection
        fs.writeFileSync('data_sample_course_ma1001.json', JSON.stringify(data, null, 2));
        console.log('💾 Saved to data_sample_course_ma1001.json');
      }
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();