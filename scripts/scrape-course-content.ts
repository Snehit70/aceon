/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'secret_token.txt');
const GRAPHQL_ENDPOINT = 'https://open-nptel-nk7eaoz6ha-el.a.run.app/graphql';
const DELAY_MS = 1000; // 1 second delay to be safe

// --- Types ---
interface CourseOutlineItem {
  id: number;
  title: string;
  children?: CourseOutlineItem[];
  has_video?: boolean;
  type?: string;
  [key: string]: any;
}

interface LessonData {
  id: string;
  title: string;
  video: string;
  transcriptVttUrl?: string;
}

// --- Helper Functions ---
function getToken(): string {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('secret_token.txt not found');
  }
  return fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchGraphQL(query: string, variables: any, token: string, operationName: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'seek_id_token': token,
      'seek_namespace': variables.namespace, // Assuming namespace is always needed
      // 'exam_session': ... // Might need this if session is required for lessons too?
      // Using generic headers for now, might need to enhance
      'Origin': 'https://seek.onlinedegree.iitm.ac.in',
      'Referer': 'https://seek.onlinedegree.iitm.ac.in/',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0'
    },
    body: JSON.stringify({
      operationName,
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

// --- Queries ---
const QUERY_COURSE = `
  query course($namespace: String!) {
    course(namespace: $namespace) {
      courseOutlineWithChildrenOrder
      title
      __typename
    }
  }
`;

const QUERY_LESSON = `
  query lesson($id_: String!, $namespace: String!) {
    lesson(id_: $id_, namespace: $namespace) {
      id
      title
      video
      transcriptVttUrl
      __typename
    }
  }
`;

// --- Main ---
async function main() {
  const targetNamespace = process.argv[2] || 'ns_25t1_ma1001';
  console.log(`🚀 Starting scrape for ${targetNamespace}`);

  const token = getToken();

  // 1. Fetch Course Outline
  console.log('📚 Fetching course outline...');
  const courseData = await fetchGraphQL(QUERY_COURSE, { namespace: targetNamespace }, token, 'course');
  
  if (!courseData.course) {
    console.error('❌ Course not found');
    return;
  }

  const outline: CourseOutlineItem[] = JSON.parse(courseData.course.courseOutlineWithChildrenOrder);
  console.log(`✅ Outline parsed. Title: ${courseData.course.title}`);

  // 2. Extract Video Lessons
  const videoLessons: { id: number; title: string }[] = [];
  
  function traverse(items: CourseOutlineItem[]) {
    for (const item of items) {
      if (item.has_video && item.type === 'lesson') {
        videoLessons.push({ id: item.id, title: item.title });
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  traverse(outline);

  console.log(`📹 Found ${videoLessons.length} video lessons.`);

  // 3. Fetch Details for each Lesson
  const enrichedLessons: Record<string, LessonData> = {};
  
  // Load existing data if available (Resume capability)
  const filename = `data/data_course_${targetNamespace}.json`;
  if (fs.existsSync(filename)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      if (existingData.lessons) {
        Object.assign(enrichedLessons, existingData.lessons);
        console.log(`🔄 Resuming... Loaded ${Object.keys(enrichedLessons).length} existing lessons.`);
      }
    } catch (err) {
      console.warn('⚠️ Could not parse existing file, starting fresh.');
    }
  }

  let saveCounter = 0;

  for (let i = 0; i < videoLessons.length; i++) {
    const lesson = videoLessons[i];
    
    // Skip if already fetched
    if (enrichedLessons[lesson.id]) {
        continue;
    }

    console.log(`[${i + 1}/${videoLessons.length}] Fetching details for lesson ${lesson.id}: ${lesson.title}`);
    
    try {
      const lessonDetails = await fetchGraphQL(QUERY_LESSON, { 
        id_: String(lesson.id), 
        namespace: targetNamespace 
      }, token, 'lesson');

      if (lessonDetails.lesson) {
        enrichedLessons[lesson.id] = lessonDetails.lesson;
        saveCounter++;
      }
      
      // Checkpoint every 5 lessons
      if (saveCounter >= 5) {
        const partialData = {
            course: courseData.course,
            lessons: enrichedLessons,
            scrapedAt: new Date().toISOString()
        };
        fs.writeFileSync(filename, JSON.stringify(partialData, null, 2));
        console.log(`💾 Checkpoint saved (${Object.keys(enrichedLessons).length} lessons)`);
        saveCounter = 0;
      }
      
      await sleep(DELAY_MS); // Rate limit protection
    } catch (err) {
      console.error(`❌ Failed to fetch lesson ${lesson.id}:`, err);
    }
  }

  const finalData = {
    course: courseData.course,
    lessons: enrichedLessons,
    scrapedAt: new Date().toISOString()
  };

  fs.writeFileSync(filename, JSON.stringify(finalData, null, 2));
  console.log(`💾 Saved complete course data to ${filename}`);
}

main().catch(console.error);
