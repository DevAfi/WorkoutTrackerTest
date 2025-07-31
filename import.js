const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ninjaApiKey = process.env.NINJA_API_KEY;

const muscles = [
  "abdominals",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "chest",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "lower_back",
  "middle_back",
  "neck",
  "quadriceps",
  "traps",
  "triceps",
];

async function importExercises() {
  for (const muscle of muscles) {
    let offset = 0;
    let totalAdded = 0;
    let emptyCount = 0;

    console.log(`\n🔍 Fetching exercises for: ${muscle}`);

    while (emptyCount < 2) {
      try {
        const res = await axios.get("https://api.api-ninjas.com/v1/exercises", {
          headers: { "X-Api-Key": ninjaApiKey },
          params: { muscle, offset },
        });

        const exercises = res.data;

        if (!exercises.length) {
          emptyCount++;
          offset += 10;
          continue;
        }

        emptyCount = 0;

        for (const ex of exercises) {
          const { name, muscle, equipment, instructions } = ex;

          const { error } = await supabase.from("exercises").insert([
            {
              name,
              category: muscle,
              equipment,
              instructions,
            },
          ]);

          if (error) {
            console.error(`❌ Error inserting "${name}":`, error.message);
          } else {
            //console.log(`✅ Inserted: ${name}`);
            totalAdded++;
          }
        }

        offset += 10;
      } catch (err) {
        console.error("💥 Request failed:", err.message);
        break;
      }
    }

    console.log(`✅ Done with ${muscle}: ${totalAdded} inserted.`);
  }
  console.log(totalAdded, "exercises added");

  console.log("🎉 All muscles fetched and inserted.");
}

importExercises();
