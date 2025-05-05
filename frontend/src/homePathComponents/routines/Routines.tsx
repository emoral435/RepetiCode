import { useParams } from "react-router-dom";
import { Suspense, use } from "react";
import { useTheme } from "../../context/ThemeContext";
import type { RoutineDoc } from "../../lib/routines";

interface RoutineProps {
  dataPromise: Promise<RoutineDoc>;
}

const Routine: React.FC<RoutineProps> = ({ dataPromise }) => {
  const routine = use(dataPromise);
  const { cssThemes } = useTheme();

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-4xl flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-left"
      >
        {/* Header */}
        <div className="w-full text-center">
          <h1 className="text-4xl font-extrabold drop-shadow-lg">{routine.RoutineName}</h1>
          <p className="text-sm text-gray-200 mt-1">Created: {routine.CreatedAt.slice(0, 10)}</p>
        </div>

        {/* Workouts */}
        {routine.Workouts.length === 0 ? (
          <p className="text-center text-lg text-gray-200">No workouts added to this routine yet.</p>
        ) : (
          routine.Workouts.map((workout, wIdx) => (
            <div
              key={wIdx}
              style={{ background: cssThemes.colors.background }}
              className="w-full border-4 rounded-2xl p-4 shadow-md space-y-4"
            >
              <h2 className="text-2xl font-semibold">{workout.WorkoutName}</h2>

              {workout.Exercises.map((exercise, eIdx) => (
                <div
                  key={eIdx}
                  className="bg-gray-100 rounded-xl p-4 shadow-inner space-y-2 text-black"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <h3 className="text-lg font-bold">{exercise.ExerciseName}</h3>
                    <p className="text-sm text-gray-700">Muscle Group: {exercise.MuscleGroup}</p>
                  </div>

                  <table className="w-full text-sm border mt-2">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2">Set</th>
                        <th className="p-2">Reps</th>
                        <th className="p-2">Weight</th>
                        <th className="p-2">Drop Set?</th>
                        <th className="p-2">Warm-up?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.Sets.map((set, sIdx) => (
                        <tr key={sIdx} className="border-t">
                          <td className="p-2">{sIdx + 1}</td>
                          <td className="p-2">{set.Reps}</td>
                          <td className="p-2">{set.Weight} lbs</td>
                          <td className="p-2">{set.IsDropSet ? "Yes" : "No"}</td>
                          <td className="p-2">{set.IsWarmUp ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

const loadWorkoutRoutines = async (slug: string | undefined): Promise<RoutineDoc> => {
  // TODO Replace with actual fetch logic later
  return {
    RoutineName: "Temporary Data–Would say leg day, but then we know we would never get to that...",
    UID: "user123",
    CreatedAt: "2025-05-04T00:00:00Z",
    RefId: slug ?? "",
    Workouts: [],
  };
};

const RoutineHandler = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="w-full">
      <Suspense fallback={<div className="flex justify-center">Loading routine...</div>}>
        <Routine dataPromise={loadWorkoutRoutines(slug)} />
      </Suspense>
    </div>
  );
};

export default RoutineHandler;
