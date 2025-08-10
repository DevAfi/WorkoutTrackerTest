import { supabase } from "../lib/supabase";

export async function getWorkoutStats(userId) {
  console.log("get 1");
  const { data, error } = await supabase.rpc("get_user_workout_stats", {
    uuid: userId,
  });

  if (error) throw error;
  if (!data || data.length === 0) {
    return {
      totalVolume: 0,
      totalDurationSeconds: 0,
      totalReps: 0,
      totalSets: 0,
      totalWorkouts: 0,
    };
  }

  return data[0];
}
