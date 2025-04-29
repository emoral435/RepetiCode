import { useTheme } from "../../context/ThemeContext";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getAuth } from "firebase/auth";
import { use, useState } from "react";
import { Suspense } from "react";

interface UserDocumentPayloadSettings {
  UnitsPreference: 'Imperial' | 'Metric',
  SubscriptionTier: 'Free' | 'Pro' | null
}

interface UserDocumentPayloadMetrics {
  Weight: number,
  Height: number,
  JoinDate: string,
}

interface UserDocumentPayload {
  Metrics: UserDocumentPayloadMetrics,
  Settings: UserDocumentPayloadSettings,
  CurrentGoal: string,
}

interface UserData  {
  data: UserDocumentPayload,
  message: string, 
  displayName: string,
}

interface FlattenedUserData {
  displayName: string,
  CurrentGoal: string,
  Weight: number,
  Height: number,
  JoinDate: string,
  UnitsPreference: 'Imperial' | 'Metric',
  SubscriptionTier: 'Free' | 'Pro' | null,
}

const loadUserProfileData = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  try {
    const origin = window.location.origin;
    const idToken = await currentUser?.getIdToken();
    const uid = currentUser?.uid;
    const res = await fetch(origin + "/api/v1/user/" + uid + "/" + idToken, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await res.json();
    // if there was an error message within the JSON response
    if (Object.prototype.hasOwnProperty.call(data, "error")) {
      throw Error(`response returned error: ${data.error}`);
    }

    const displayName = currentUser?.displayName;
    return {...data, "displayName": displayName};
  } catch (error) {
    return { "error": `error while trying to fetch user profile data: ${error}` }
  }
}

const ProfileData = ({ dataPromise }: any) => {
  const userData: UserData = use(dataPromise);

  // if we encountered an error while trying to fetch user data, reroute to login screen again
  if (Object.prototype.hasOwnProperty.call(userData, "error") ||
    !Object.prototype.hasOwnProperty.call(userData, "displayName")) {
    sessionStorage.setItem("message", `error while trying to get user profile data: ${userData}`)
  }

  const userMetrics = userData.data.Metrics;
  const userSettings = userData.data.Settings;

  if (userMetrics.JoinDate.length >= 10) {
    userMetrics.JoinDate = userMetrics.JoinDate.slice(0, 10);
  }

  const { cssThemes } = useTheme();

  const [userProfile, setUserProfile] = useState<FlattenedUserData>({
    displayName: userData.displayName,
    CurrentGoal: userData.data.CurrentGoal,
    Weight: userMetrics.Weight,
    Height: userMetrics.Height,
    JoinDate: userMetrics.JoinDate,
    UnitsPreference: userSettings.UnitsPreference,
    SubscriptionTier: userSettings.SubscriptionTier,
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
      [field]: field === "Weight" || field === "Height"
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
              {editField === "UnitsPreference" ? (
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
                    onClick={() => saveEditing("UnitsPreference")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.UnitsPreference}</p>
                  <button
                    onClick={() => startEditing("UnitsPreference")}
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
                <p className="font-bold">{userProfile.SubscriptionTier}</p>
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
              {editField === "Weight" ? (
                <>
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  />
                  <button
                    onClick={() => saveEditing("Weight")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.Weight} {userProfile.UnitsPreference === "Imperial" ? "lbs" : "kg"}</p>
                  <button
                    onClick={() => startEditing("Weight")}
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
              {editField === "Height" ? (
                <>
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  />
                  <button
                    onClick={() => saveEditing("Height")}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.Height} {userProfile.UnitsPreference === "Imperial" ? "ft" : "m"}</p>
                  <button
                    onClick={() => startEditing("Height")}
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
              <p>{userProfile.JoinDate}</p>
            </div>
          </div>
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
