import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

interface Video {
  title: string;
  duration?: number;
}

interface Week {
  title: string;
  videos: Video[];
}

interface CourseData {
  course_id: string;
  title: string;
  week_wise: Week[];
}

async function analyze() {
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith("data_course:_") && f.endsWith(".json"));
  
  console.log("| Course ID | Course Title | Weeks | Videos | Total Duration |");
  console.log("|---|---|---|---|---|");

  const summary = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
    try {
      const data: CourseData = JSON.parse(content);
      const weekCount = data.week_wise.length;
      const videoCount = data.week_wise.reduce((sum, w) => sum + w.videos.length, 0);
      const totalSeconds = data.week_wise.reduce((sum, w) => sum + w.videos.reduce((s, v) => s + (v.duration || 0), 0), 0);
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const durationStr = `${hours}h ${minutes}m`;

      console.log(`| ${data.course_id} | ${data.title} | ${weekCount} | ${videoCount} | ${durationStr} |`);
      
      summary.push({ code: data.course_id, weeks: weekCount, videos: videoCount });
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
    }
  }
}

analyze();
