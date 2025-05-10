import { use, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getAuth } from "firebase/auth";
import type { RoutineDoc } from "../../lib/routines";
import { CpuChipIcon } from "@heroicons/react/24/outline";

interface WorkoutRoutinesProps {
  dataPromise: Promise<RoutineDoc[]>;
}

const loadWorkoutRoutines = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  try {
    const origin = window.location.origin;
    const idToken = await currentUser?.getIdToken();
    const uid = currentUser?.uid;
    const res = await fetch(origin + "/api/v1/user/routine/" + uid + "/" + idToken, {
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
    return { error: `error while trying to fetch user profile data: ${error}` };
  }
};

const extractFinalErrorMessage = (fullError: string) => {
  const lastErrorIndex = fullError.lastIndexOf("error ");
  if (lastErrorIndex === -1) return fullError;

  // Return everything after the last "error " and trim whitespace
  return fullError.slice(lastErrorIndex).trim();
};

const Workouts = ({ dataPromise }: WorkoutRoutinesProps) => {
  const routines = use(dataPromise);
  const { cssThemes } = useTheme();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [showPopup, setShowPopup] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(routines, "error")) {
      sessionStorage.setItem("message", `error while trying to get user profile data: ${routines}`);
      navigate("/login");
    }

    if (currentUser === null) {
      sessionStorage.setItem("message", `error while trying to get user profile data, as current user is null`);
      navigate("/login");
    }
  }, [currentUser, navigate, routines]);

  const handleCreateRoutine = async () => {
    setErrorMessage("");
    try {
      const origin = window.location.origin;
      const idToken = await currentUser?.getIdToken();
      const uid = currentUser?.uid;

      const res = await fetch(`${origin}/api/v1/user/routine/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RoutineName: routineName, UID: uid, IdToken: idToken }),
      });

      const data = await res.json();
      setShowPopup(false);

      if (data.error) {
        throw new Error(data.error);
      }

      window.location.reload();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const raw = error.message || "Unknown error occurred";
        setErrorMessage(extractFinalErrorMessage(raw));
      } else {
        setErrorMessage("An unknown error occurred");
      }
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <section
        style={{ background: cssThemes.colors.primary }}
        className="border-4 w-[90%] max-w-4xl flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-center"
      >
        <section
          style={{ background: cssThemes.colors.background }} 
          className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 relative border-4 rounded-2xl px-4 py-2"
        >
          <h1 className="text-4xl font-extrabold drop-shadow-lg flex justify-between items-center gap-4">
            <CpuChipIcon width={50} />
            <p>Workout Routines</p>
            <CpuChipIcon width={50} />
          </h1>

          <div className="relative flex flex-col items-center">
            <button
              onClick={() => {
                setShowPopup((prev) => !prev);
                setErrorMessage("");
              }}
              style={{ background: cssThemes.colors.secondary }}
              className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
            >
              + Create Routine
            </button>

            {showPopup && (
              <div
                style={{ background: cssThemes.colors.background }}
                className="absolute top-full mt-2 z-10 border-2 p-4 rounded-xl shadow-xl w-72"
              >
                <input
                  type="text"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="Enter routine name"
                  className="w-full p-2 rounded border"
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="px-3 py-1 text-sm border rounded hover:opacity-80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRoutine}
                    style={{ background: cssThemes.colors.secondary }}
                    className="px-3 py-1 text-sm rounded text-white font-semibold shadow hover:shadow-md"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {errorMessage && (
          <div className="text-red-600 text-center text-sm font-semibold w-full">
            {errorMessage}
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-6">
          {routines.map((routine) => (
            <Link
              key={routine.RefId}
              to={`/home/workouts/${routine.RefId}`}
              style={{ background: cssThemes.colors.background }}
              className="border-4 w-full max-w-md p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:scale-105 flex flex-col items-center text-center"
            >
              <h2 className="text-2xl font-bold">{routine.RoutineName}</h2>
              <p className="text-sm mt-1">Since: {routine.CreatedAt.slice(0, 10)}</p>
              <span
                style={{ background: cssThemes.colors.secondary }}
                className="mt-4 px-4 py-2 border-2 rounded-xl font-semibold shadow hover:shadow-md transition"
              >
                View Routine
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};



const WorkoutRoutines = () => {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="flex justify-center">Loading routines...</div>}>
        <Workouts dataPromise={loadWorkoutRoutines()} />
      </Suspense>
    </div>
  );
};

export default WorkoutRoutines;
