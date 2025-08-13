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

export async function fetchVolumeByMuscleGroup(userId) {
  const { data, error } = await supabase.rpc("get_volume_by_muscle_group", {
    target_user_id: userId,
  });

  if (error) {
    console.error("Error fetching volume by muscle group:", error);
    return [];
  }
  return data;
}

export async function fetchWorkoutHeatmap(userId) {
  const { data, error } = await supabase.rpc("get_workout_frequency", {
    period: "day",
    target_user_id: userId,
  });

  if (error) {
    console.error("Error fetching workout frequency:", error);
    return [];
  }

  return data.map((item) => ({
    date: new Date(item.period_start).toISOString().split("T")[0],
    count: Number(item.workout_count),
  }));
}
