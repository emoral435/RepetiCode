import { useTheme } from "../../context/ThemeContext";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getAuth } from "firebase/auth";
import { use, useState } from "react";
import { Suspense } from "react";

type userRecord = {
  displayName: string,
  goal: string,
  weight: number,
  height: number,
  joinDate: Date,
  unitsPreference: 'Imperial' | 'Metric',
  workoutRoutines: number,
  subscriptionTier: 'Free' | 'Pro'
}

const loadUserProfileData = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  try {
    const origin = window.location.origin;
    const idToken = await currentUser?.getIdToken();
    const res = await fetch(origin + "/api/v1/user/" + idToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("We got here")
    const data = await res.json();
    // if there was an error message within the JSON response
    if (Object.prototype.hasOwnProperty.call(data, "error")) {
      throw Error(`response returned error: ${data.error}`);
    }

    return data;
  } catch (error) {
    console.log("HUH:" + error);
  }
}

const ProfileData = ({ dataPromise }: any) => {
  const data = use(dataPromise);
  console.log(data);

  const { cssThemes } = useTheme();

  const [userProfile, setUserProfile] = useState<userRecord>({
    displayName: "loading...",
    goal: "loading...",
    weight: 0,
    height: 0,
    joinDate: new Date(),
    unitsPreference: "Metric",
    workoutRoutines: 0,
    subscriptionTier: "Free",
  });

  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const startEditing = (field: keyof typeof userProfile) => {
    setEditField(field);
    setTempValue(userProfile[field]?.toString() ?? "");
  };

  const saveEditing = (field: keyof typeof userProfile) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: field === "weight" || field === "height"
        ? parseFloat(tempValue)
        : tempValue
    }));
    setEditField(null);
    setTempValue("");
  };

  return (
    <div
        style={{ color: cssThemes.colors.primaryTextColor }}
        className="w-full h-full flex justify-center items-center p-4"
      >
        <section
          style={{ background: cssThemes.colors.primary }}
          className="border-4 w-[90%] max-w-4xl flex flex-col items-center rounded-2xl shadow-xl p-8 gap-8 text-center"
        >
          {/* Header */}
          <section
            style={{ background: cssThemes.colors.background }}
            className="border-4 flex justify-center items-center gap-4 p-6 rounded-2xl shadow-2xl w-full"
          >
            <div className="inline-block transition-transform duration-700 hover:rotate-[360deg]">
              <UserCircleIcon width={50} />
            </div>
            <h1 className="text-4xl font-extrabold drop-shadow-lg">My Profile</h1>
            <div className="inline-block transition-transform duration-700 hover:rotate-[360deg]">
              <UserCircleIcon width={50} />
            </div>
          </section>
          {/* Display Name */}
          <section
            style={{ background: cssThemes.colors.background }}
            className="border-4 w-full flex flex-col gap-6 items-center p-6 rounded-2xl shadow-2xl"
          >
            {editField === "displayName" ? (
              <>
                <input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="border px-3 py-2 rounded-2xl w-full max-w-sm text-black"
                />
                <button
                  onClick={() => saveEditing("displayName")}
                  style={{ background: cssThemes.colors.secondary }}
                  className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold">{userProfile.displayName}</h2>
                <button
                  onClick={() => startEditing("displayName")}
                  style={{ background: cssThemes.colors.secondary }}
                  className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  Edit Display Name
                </button>
              </>
            )}
          </section>
          {/* Divider: User Settings */}
          <h3 className="text-2xl font-bold underline">User Settings</h3>
          <div className="w-full flex flex-wrap justify-between text-left text-lg gap-4">
            {/* Units Preference */}
            <div
              style={{ background: cssThemes.colors.background }}
              className="w-full sm:w-[48%] border-4 p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center justify-center"
            >
              <p className="font-semibold">Units Preference:</p>
              {editField === "unitsPreference" ? (
                <>
                  <select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  >
                    <option value="Imperial">Imperial (lbs, ft)</option>
                    <option value="Metric">Metric (kg, m)</option>
                  </select>
                  <button
                    onClick={() => saveEditing("unitsPreference")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.unitsPreference}</p>
                  <button
                    onClick={() => startEditing("unitsPreference")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            {/* Subscription Tier */}
            <div
              style={{ background: cssThemes.colors.background }}
              className="w-full sm:w-[48%] border-4 p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center justify-center"
            >
              <p className="font-semibold">Subscription Tier</p>
                <p className="font-bold">{userProfile.subscriptionTier}</p>
            </div>
          </div>
          {/* Divider: User Metrics */}
          <h3 className="text-2xl font-bold underline">User Metrics</h3>
          <div className="w-full flex flex-wrap justify-between text-left text-lg gap-4">
            {/* Weight */}
            <div
              style={{ background: cssThemes.colors.background }}
              className="w-full sm:w-[30%] border-4 p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center justify-center"
            >
              <p className="font-semibold">Weight</p>
              {editField === "weight" ? (
                <>
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  />
                  <button
                    onClick={() => saveEditing("weight")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.weight} {userProfile.unitsPreference === "Imperial" ? "lbs" : "kg"}</p>
                  <button
                    onClick={() => startEditing("weight")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            {/* Height */}
            <div
              style={{ background: cssThemes.colors.background }}
              className="w-full sm:w-[30%] border-4 p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center justify-center"
            >
              <p className="font-semibold">Height</p>
              {editField === "height" ? (
                <>
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  />
                  <button
                    onClick={() => saveEditing("height")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.height} {userProfile.unitsPreference === "Imperial" ? "ft" : "m"}</p>
                  <button
                    onClick={() => startEditing("height")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            {/* Join Date (no edit) */}
            <div
              style={{ background: cssThemes.colors.background }}
              className="w-full sm:w-[30%] border-4 p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center justify-center"
            >
              <p className="font-semibold">Join Date</p>
              <p>{userProfile.joinDate.toLocaleDateString()}</p>
            </div>
          </div>
          {/* Workout Routines */}
          <section
            style={{ background: cssThemes.colors.background }}
            className="border-4 w-full flex flex-col items-center p-6 gap-4 rounded-2xl shadow-2xl mt-6"
          >
            <h3 className="text-2xl font-bold">Workout Routines</h3>
            <p className="text-xl">TODO routines</p>
          </section>
        </section>
      </div>
  )
}

const Profile = () => {
  

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileData dataPromise={loadUserProfileData()} />
    </Suspense>
  );
};

export default Profile;
