import { supabase } from "../lib/supabase";

export async function fetchVolumeOverTime(userId, period = "day") {
  const { data, error } = await supabase.rpc("get_volume_over_time", {
    target_user_id: userId,
    period,
  });

  if (error) {
    console.error("Error fetching volume data:", error);
    return [];
  }
  return data;
}

export async function fetchWorkoutFrequency(userId, period = "day") {
  const { data, error } = await supabase.rpc("get_workout_frequency", {
    target_user_id: userId,
    period,
  });

  if (error) {
    console.error("Error fetching workout frequency:", error);
    return [];
  }
  return data;
}
