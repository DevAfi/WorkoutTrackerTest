import { supabase } from "../lib/supabase";

export const createWorkoutActivity = async (
  sessionId,
  userId,
  options = {}
) => {
  try {
    const {
      xpEarned = 50,
      exerciseTitle = "Freestyle Workout",
      workoutDuration = null, // Will be calculated from session if null
    } = options;

    const { error } = await supabase.rpc("create_workout_activity", {
      p_user_id: userId,
      p_session_id: sessionId,
      p_xp_earned: xpEarned,
      p_exercise_title: exerciseTitle,
      p_workout_duration: workoutDuration,
    });

    if (error) {
      console.error("Error creating workout activity:", error);

      // Fallback to generic activity creation if the specific function doesn't exist yet
      return await createWorkoutActivityFallback(sessionId, userId, options);
    }

    console.log("Workout activity created successfully");
    return true;
  } catch (error) {
    console.error("Failed to create workout activity:", error);
    return false;
  }
};

// Fallback method using the generic create_user_activity function
const createWorkoutActivityFallback = async (
  sessionId,
  userId,
  options = {}
) => {
  try {
    const {
      xpEarned = 50,
      exerciseTitle = "Freestyle Workout",
      workoutDuration = 0,
    } = options;

    const { error } = await supabase.rpc("create_user_activity", {
      p_user_id: userId,
      p_activity_type: "workout_completed",
      p_activity_data: {
        xp_earned: xpEarned,
        exercise_title: exerciseTitle,
        workout_duration: workoutDuration,
        session_id: sessionId, // Include session_id directly in activity_data
      },
    });

    if (error) throw error;

    console.log("Workout activity created successfully (fallback)");
    return true;
  } catch (error) {
    console.error("Failed to create workout activity (fallback):", error);
    return false;
  }
};
