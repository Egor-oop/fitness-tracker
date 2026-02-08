import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { GenerateWorkoutRequest, WorkoutProgram } from "./types.ts";
import { buildPrompt } from "./prompt-builder.ts";
import { validateExerciseUids, EXERCISES_DB } from "./exercises-db.ts";

const WORKOUT_SCHEMA = {
  type: "object",
  properties: {
    program_name: { type: "string" },
    split_type: {
      type: "string",
      enum: ["fullbody", "upper_lower", "push_pull_legs", "front_back"],
    },
    weeks: { type: "integer", minimum: 1, maximum: 12 },
    workouts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "integer", minimum: 1, maximum: 7 },
          name: { type: "string" },
          focus: { type: "string" },
          estimated_duration_minutes: {
            type: "integer",
            minimum: 30,
            maximum: 120,
          },
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                uid: { type: "string" },
                sets: { type: "integer", minimum: 1, maximum: 10 },
                reps: { type: "string" },
                rest_seconds: { type: "integer", minimum: 30, maximum: 300 },
                tempo: { type: "string" },
                notes: { type: "string" },
              },
              required: ["uid", "sets", "reps", "rest_seconds"],
            },
          },
        },
        required: [
          "day",
          "name",
          "focus",
          "exercises",
          "estimated_duration_minutes",
        ],
      },
    },
    notes: { type: "string" },
  },
  required: ["program_name", "split_type", "weeks", "workouts"],
};

// deno-lint-ignore no-explicit-any
async function saveProgramToDatabase(
  supabase: any,
  userId: string,
  program: WorkoutProgram,
  request: GenerateWorkoutRequest
): Promise<string> {
  // 1. Insert program
  const { data: programRecord, error: programError } = await supabase
    .from("workout_programs")
    .insert({
      user_id: userId,
      program_name: program.program_name,
      split_type: program.split_type,
      weeks: program.weeks,
      notes: program.notes ?? null,
      requested_days: request.days,
      preferences: request.preferences ?? null,
    })
    .select("id")
    .single();

  if (programError) throw new Error(`Failed to save program: ${programError.message}`);

  // 2. Insert workouts
  const workoutInserts = program.workouts.map((w) => ({
    program_id: programRecord.id,
    day: w.day,
    name: w.name,
    focus: w.focus,
    estimated_duration_minutes: w.estimated_duration_minutes,
    position: w.day,
  }));

  const { data: workoutRecords, error: workoutError } = await supabase
    .from("workouts")
    .insert(workoutInserts)
    .select("id")
    .order("day");

  if (workoutError) throw new Error(`Failed to save workouts: ${workoutError.message}`);

  // 3. Insert exercises
  // deno-lint-ignore no-explicit-any
  const exerciseInserts: any[] = [];

  for (let i = 0; i < program.workouts.length; i++) {
    const workout = program.workouts[i];
    const workoutRecord = workoutRecords[i];

    for (let j = 0; j < workout.exercises.length; j++) {
      const ex = workout.exercises[j];
      exerciseInserts.push({
        workout_id: workoutRecord.id,
        exercise_uid: ex.uid,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        tempo: ex.tempo ?? null,
        notes: ex.notes ?? null,
        position: j + 1,
      });
    }
  }

  const { error: exerciseError } = await supabase
    .from("workout_exercises")
    .insert(exerciseInserts);

  if (exerciseError) throw new Error(`Failed to save exercises: ${exerciseError.message}`);

  return programRecord.id;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const body: GenerateWorkoutRequest = await req.json();

    if (!body.days || body.days < 1 || body.days > 7) {
      return new Response(
        JSON.stringify({ error: "days must be between 1 and 7" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body.split_type) {
      return new Response(
        JSON.stringify({ error: "split_type is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: WORKOUT_SCHEMA,
      },
    });

    const prompt = buildPrompt(body.days, body.split_type, body.preferences);

    console.log("Generating workout program...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const programData: WorkoutProgram = JSON.parse(response.text());

    validateExerciseUids(programData.workouts);

    // Save to database
    console.log("Saving program to database...");
    const programId = await saveProgramToDatabase(
      supabaseAdmin,
      user.id,
      programData,
      body
    );

    const enrichedProgram = enrichProgramWithDetails(programData);

    console.log("Workout program generated and saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: programId,
          ...enrichedProgram,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating workout:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function enrichProgramWithDetails(program: WorkoutProgram) {
  return {
    ...program,
    workouts: program.workouts.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        details: EXERCISES_DB[exercise.uid] || null,
      })),
    })),
  };
}
