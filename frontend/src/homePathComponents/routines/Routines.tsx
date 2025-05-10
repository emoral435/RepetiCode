import { useParams } from "react-router-dom";
import { Suspense, use, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTheme } from "../../context/ThemeContext";
import type { RoutineDoc, WorkoutDoc, ExerciseDoc, SetDoc } from "../../lib/routines";
import { getAuth } from "firebase/auth";
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

interface RoutineProps {
  dataPromise: Promise<RoutineDoc>;
  slug: string | undefined;
}

const Routine: React.FC<RoutineProps> = ({ dataPromise, slug }) => {
  const originalRoutine = use(dataPromise);
  const { cssThemes } = useTheme();
  const [routine, setRoutine] = useState<RoutineDoc>(structuredClone(originalRoutine));
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateSet = (wIdx: number, eIdx: number, sIdx: number, key: keyof SetDoc, value: string | number | boolean) => {
    const updated = { ...routine };
    const set = updated.Workouts[wIdx].Exercises[eIdx].Sets[sIdx];

    if (key === "Reps" || key === "Weight") {
      set[key] = Number(value);
    } else {
      set[key] = value as boolean;
    }

    setRoutine(updated);
  };

  const updateWorkoutName = (wIdx: number, name: string) => {
    const updated = { ...routine };
    updated.Workouts[wIdx].WorkoutName = name;
    setRoutine(updated);
  };

  const addWorkout = () => {
    const newWorkout: WorkoutDoc = {
      WorkoutName: "New Workout",
      Exercises: [],
    };
    const updated = { ...routine };
    updated.Workouts.push(newWorkout);
    setRoutine(updated);
  };

  const removeWorkout = (wIdx: number) => {
    const updated = { ...routine };
    updated.Workouts.splice(wIdx, 1);
    setRoutine(updated);
  };

  const addExercise = (wIdx: number) => {
    const newExercise: ExerciseDoc = {
      MuscleGroup: 0,
      ExerciseName: "New Exercise",
      Sets: [{ Reps: 10, Weight: 0, IsDropSet: false, IsWarmUp: false }],
    };
    const updated = { ...routine };
    updated.Workouts[wIdx].Exercises.push(newExercise);
    setRoutine(updated);
  };

  const removeExercise = (wIdx: number, eIdx: number) => {
    const updated = { ...routine };
    updated.Workouts[wIdx].Exercises.splice(eIdx, 1);
    setRoutine(updated);
  };

  const addSet = (wIdx: number, eIdx: number) => {
    const newSet: SetDoc = { Reps: 10, Weight: 0, IsDropSet: false, IsWarmUp: false };
    const updated = { ...routine };
    updated.Workouts[wIdx].Exercises[eIdx].Sets.push(newSet);
    setRoutine(updated);
  };

  const removeSet = (wIdx: number, eIdx: number, sIdx: number) => {
    const updated = { ...routine };
    updated.Workouts[wIdx].Exercises[eIdx].Sets.splice(sIdx, 1);
    setRoutine(updated);
  };

  const saveRoutine = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      const origin = window.location.origin;
      const res = await fetch(`${origin}/api/v1/user/routine/single/${slug}/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routine),
      });

      const resJSON = await res.json();
      if (Object.prototype.hasOwnProperty.call(resJSON, "error")) {
        throw Error(`response returned error: ${resJSON.error}`);
      }

      setSuccessMessage("Routine updated successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        const raw = error.message || "Unknown error occurred";
        setError(raw);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const muscleGroups = [
    "Chest", "Back", "Biceps", "Triceps", "Front Delts", "Side Delts", "Rear Delts",
    "Abs", "Quads", "Hamstrings", "Calves", "Forearms"
  ];

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-4xl flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-left"
      >
        <div className="w-full text-center">
          <input
            type="text"
            className="text-4xl font-extrabold bg-transparent border-b text-center w-full drop-shadow-lg"
            value={routine.RoutineName}
            onChange={(e) => setRoutine({ ...routine, RoutineName: e.target.value })}
          />
          <p className="text-sm text-gray-200 mt-1">Created: {routine.CreatedAt.slice(0, 10)}</p>
        </div>

        {routine.Workouts.length === 0 ? (
          <div className="text-center text-lg text-gray-200 space-y-2">
            <p>No workouts yet.</p>
            <button onClick={addWorkout} className="flex gap-4 text-green-400 transition transform hover:scale-105">
              <PlusCircleIcon width={20} />
              <p>Add Workout Day</p>
              <PlusCircleIcon width={20} />
            </button>
          </div>
        ) : (
          <>
            {routine.Workouts.map((workout, wIdx) => (
              <div
                key={wIdx}
                style={{ background: cssThemes.colors.background }}
                className="w-full border-4 rounded-2xl p-4 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-start sm:items-center">
                  <input
                    className="w-full text-2xl font-semibold bg-transparent border-b focus:outline-none"
                    value={workout.WorkoutName}
                    onChange={(e) => updateWorkoutName(wIdx, e.target.value)}
                  />
                  <button
                    className="sm:ml-4 text-sm text-red-400 flex align-middle items-center text-nowrap gap-2 transition transform hover:scale-105"
                    onClick={() => removeWorkout(wIdx)}
                  >
                    <TrashIcon width={15} />
                    <p>Remove Workout</p>
                  </button>
                </div>

                {workout.Exercises.length === 0 ? (
                  <div className="text-sm">
                    <p>No exercises added yet.</p>
                    <button onClick={() => addExercise(wIdx)} className="flex items-center gap-2">
                      <PlusCircleIcon width={15} />
                      <p>Add First Exercise</p>
                    </button>
                  </div>
                ) : (
                  workout.Exercises.map((exercise, eIdx) => (
                    <div key={eIdx} className="rounded-xl p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <input
                          className="text-lg font-bold bg-transparent border-b"
                          value={exercise.ExerciseName}
                          onChange={(e) => {
                            const updated = { ...routine };
                            updated.Workouts[wIdx].Exercises[eIdx].ExerciseName = e.target.value;
                            setRoutine(updated);
                          }}
                        />
                        <select
                          className="text-sm border rounded p-1"
                          value={exercise.MuscleGroup}
                          onChange={(e) => {
                            const updated = { ...routine };
                            updated.Workouts[wIdx].Exercises[eIdx].MuscleGroup = parseInt(e.target.value);
                            setRoutine(updated);
                          }}
                        >
                          {muscleGroups.map((label, idx) => (
                            <option key={idx} value={idx}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {exercise.Sets.length === 0 ? (
                        <div className="p-2 text-center">
                          <button
                            className="flex items-center gap-2"
                            onClick={() => addSet(wIdx, eIdx)}
                          >
                            <PlusCircleIcon width={15} />
                            Add First Set
                          </button>
                        </div>
                      ) : (
                        exercise.Sets.map((set, sIdx) => (
                          <div
                            key={sIdx}
                            className="border rounded-lg p-4 mb-4 space-y-2 shadow-sm"
                          >
                            <div className="font-semibold text-sm mb-1">Set {sIdx + 1}</div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                              <div className="flex flex-col">
                                <label className="text-xs">Reps</label>
                                <input
                                  type="number"
                                  className="border rounded p-1 w-24"
                                  value={set.Reps}
                                  onChange={(e) => updateSet(wIdx, eIdx, sIdx, "Reps", e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs">Weight</label>
                                <input
                                  type="number"
                                  className="border rounded p-1 w-24"
                                  value={set.Weight}
                                  onChange={(e) => updateSet(wIdx, eIdx, sIdx, "Weight", e.target.value)}
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <label className="text-xs">Drop Set?</label>
                                <input
                                  type="checkbox"
                                  checked={set.IsDropSet}
                                  onChange={(e) => updateSet(wIdx, eIdx, sIdx, "IsDropSet", e.target.checked)}
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <label className="text-xs">Warm-up?</label>
                                <input
                                  type="checkbox"
                                  checked={set.IsWarmUp}
                                  onChange={(e) => updateSet(wIdx, eIdx, sIdx, "IsWarmUp", e.target.checked)}
                                />
                              </div>
                              <div className="flex items-center">
                                <button
                                  className="text-sm text-red-600 flex items-center gap-2"
                                  onClick={() => removeSet(wIdx, eIdx, sIdx)}
                                >
                                  <TrashIcon width={15} />
                                  <p>Remove</p>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}


                      <section className="flex flex-col items-start">
                        <button
                          className="mt-2 text-sm flex items-center gap-2"
                          onClick={() => addSet(wIdx, eIdx)}
                        >
                          <PlusCircleIcon width={15} />
                          <p>Add Set</p>
                        </button>
                        <button
                          className="flex items-center text-sm text-red-500 gap-2"
                          onClick={() => removeExercise(wIdx, eIdx)}
                        >
                          <TrashIcon width={15} />
                          <p>Remove Exercise</p>
                        </button>
                      </section>
                      <button
                        className="text-sm mt-2 flex items-center gap-2"
                        onClick={() => addExercise(wIdx)}
                      >
                        <PlusCircleIcon width={15} />
                        <p>Add Another Exercise</p>
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
            <button onClick={addWorkout} className="flex items-center gap-4 text-green-400 transition transform hover:scale-105">
              <PlusCircleIcon width={20} />
              <p>Add Workout Day</p>
              <PlusCircleIcon width={20} />
            </button>
          </>
        )}

        {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          style={{ background: cssThemes.colors.secondary }}
          className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 flex gap-4 items-center"
          onClick={saveRoutine}
          disabled={saving}
        >
          <p>{saving ? "Saving..." : "Save Changes"}</p>
        </button>
      </section>
    </div>
  );
};

const loadWorkoutRoutines = async (slug: string | undefined): Promise<RoutineDoc> => {
  const auth = getAuth();
    const currentUser = auth.currentUser;
  
    try {
      const origin = window.location.origin;
      const idToken = await currentUser?.getIdToken();
      const res = await fetch(`${origin}/api/v1/user/routine/single/${slug}/${idToken}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const resJSON = await res.json();
      if (Object.prototype.hasOwnProperty.call(resJSON, "error")) {
        throw Error(`response returned error: ${resJSON.error}`);
      }
  
      return resJSON.data;
    } catch (error) {
      console.error(`error while trying to fetch user profile data: ${error}`);
      throw new Error(`error while trying to fetch user profile data: ${error}`);
    }
};

const RoutineHandler = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="w-full">
      <ErrorBoundary fallback={<div>Something went wrong...</div>}>
        <Suspense fallback={<div className="flex justify-center">Loading routine...</div>}>
          <Routine dataPromise={loadWorkoutRoutines(slug)} slug={slug} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default RoutineHandler;
