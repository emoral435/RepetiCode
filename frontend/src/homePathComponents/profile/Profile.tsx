import { useTheme } from "../../context/ThemeContext";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getAuth, updateProfile } from "firebase/auth";
import { use, useEffect, useState } from "react";
import { Suspense } from "react";
import { useNavigate } from "react-router";
import { formatWeight, formatHeight } from "../../lib/weightConversions";

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

interface ProfileDataProps {
  dataPromise: Promise<UserDocumentPayload>;
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

    const resJSON = await res.json();
    // if there was an error message within the JSON response
    if (Object.prototype.hasOwnProperty.call(resJSON, "error")) {
      throw Error(`response returned error: ${resJSON.error}`);
    }

    // destructure response to just receive the data
    return resJSON.data;
  } catch (error) {
    console.error(`error while trying to fetch user profile data: ${error}`);
    return { "error": `error while trying to fetch user profile data: ${error}` }
  }
}

const ProfileData = ({ dataPromise }: ProfileDataProps) => {
  const userData: UserDocumentPayload = use(dataPromise);
  const [editField, setEditField] = useState<string | null>(null);
  const [prevUnit, setPrevUnit] = useState<"Imperial" | "Metric">("Metric");
  const [tempValue, setTempValue] = useState<string>("");
  const { cssThemes } = useTheme();
  const navigate = useNavigate();
  
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (userData.Metrics.JoinDate.length >= 10) {
    userData.Metrics.JoinDate = userData.Metrics.JoinDate.slice(0, 10);
  }
  
  const [userProfile, setUserProfile] = useState<UserDocumentPayload>({...userData});
  
  useEffect(() => {
    if (prevUnit !== userProfile.Settings.UnitsPreference) {
      userProfile.Metrics.Weight = formatWeight(prevUnit === "Imperial", 
        userProfile.Settings.UnitsPreference === "Imperial", 
        userProfile.Metrics.Weight);

        userProfile.Metrics.Height = formatHeight(prevUnit === "Imperial", 
          userProfile.Settings.UnitsPreference === "Imperial", 
          userProfile.Metrics.Height);

      setPrevUnit(userProfile.Settings.UnitsPreference);
    }
  }, [prevUnit, userProfile.Metrics, userProfile.Settings.UnitsPreference])

  useEffect(() => {
    // if we encountered an error while trying to fetch user data, reroute to login screen again
    if (Object.prototype.hasOwnProperty.call(userData, "error")) {
      sessionStorage.setItem("message", `error while trying to get user profile data: ${userData}`)
      navigate("/login");
    }
    
    // if the current user is not logged in, redirect back to login
    if (currentUser === null) {
      sessionStorage.setItem("message", `error while trying to get user profile data, as current user is null`)
      navigate("/login");
    }
  }, [currentUser, navigate, userData])

  const startEditing = (field: string) => {
    setEditField(field);

    if (field === "displayName") {
      setTempValue(currentUser?.displayName ?? "");
    } else if (field === "CurrentGoal") {
      setTempValue(userProfile.CurrentGoal);
    } else if (field === "Weight") {
      setTempValue(userProfile.Metrics.Weight.toString());
    } else if (field === "Height") {
      setTempValue(userProfile.Metrics.Height.toString());
    } else if (field === "UnitsPreference") {
      setTempValue(userProfile.Settings.UnitsPreference);
    }
  };

  const updateProfileSettingsFrontend = (field: string) => {
    setUserProfile((prev) => {
      const updated = { ...prev };

      if (field === "CurrentGoal") {
        updated.CurrentGoal = tempValue;
      } else if (field === "Weight") {
        updated.Metrics.Weight = parseFloat(tempValue);
      } else if (field === "Height") {
        updated.Metrics.Height = parseFloat(tempValue);
      } else if (field === "UnitsPreference") {
        updated.Settings.UnitsPreference = tempValue as "Imperial" | "Metric";
      }

      return updated;
    });

    setEditField(null);
    setTempValue("");
  };

  const saveEditing = async (field: string) => {
    try {
      const origin = window.location.origin;
      const idToken = await currentUser?.getIdToken();
      const uid = currentUser?.uid;

      const bodyRequest: Record<string, number | string> = {};

      if (["Weight", "Height"].includes(field)) {
        if (field === "Height") {
          bodyRequest[`Metrics.${field}`] = formatHeight(userProfile.Settings.UnitsPreference === "Imperial", false, parseFloat(tempValue));
        } else if (field === "Weight") {
          bodyRequest[`Metrics.${field}`] = formatWeight(userProfile.Settings.UnitsPreference === "Imperial", false, parseFloat(tempValue));
        }
      } else if (["UnitsPreference"].includes(field)) {
        bodyRequest[`Settings.${field}`] = tempValue;
      } else if (field === "CurrentGoal") {
        bodyRequest[field] = tempValue;
      } else if (field === "displayName") {
        if (currentUser) {
          await updateProfile(currentUser, {
            displayName: tempValue,
          });

          updateProfileSettingsFrontend(field);
          return;
        } else {
          throw Error("current user is null");
        }
      }

      const res = await fetch(`${origin}/api/v1/user/${uid}/${idToken}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyRequest),
      });

      const data = await res.json();

      if (Object.prototype.hasOwnProperty.call(data, "error")) {
        throw Error(`response returned error: ${data.error}`);
      }

      updateProfileSettingsFrontend(field);
    } catch (error) {
      console.error(`error while trying to update user profile data: ${error}`);
    }
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
                  onClick={async () => {
                    await saveEditing("displayName")
                  }}
                  style={{ background: cssThemes.colors.secondary }}
                  className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold">{currentUser?.displayName}</h2>
                <button
                  onClick={() => startEditing("displayName")}
                  style={{ background: cssThemes.colors.secondary }}
                  className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  Edit Display Name
                </button>
              </>
            )}
            {editField === "CurrentGoal" ? (
              <>
                <input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="border px-3 py-2 rounded-2xl w-full max-w-sm text-black"
                />
                <button
                  onClick={async () => {
                    await saveEditing("CurrentGoal")
                  }}
                  style={{ background: cssThemes.colors.secondary }}
                  className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold">Goal</h3>
                <p className="text-xl">{userProfile.CurrentGoal}</p>
                <button
                  onClick={() => startEditing("CurrentGoal")}
                  style={{ background: cssThemes.colors.secondary }}
                  className="border-2 px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  Edit Current Goal
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
                    onClick={async () => {
                      await saveEditing("UnitsPreference")
                    }}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.Settings.UnitsPreference}</p>
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
            {/* Subscription Tier - no edit for now */}
            <div
              style={{ background: cssThemes.colors.background }}
              className="w-full sm:w-[48%] border-4 p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center justify-center"
            >
              <p className="font-semibold">Subscription Tier</p>
                <p className="font-bold">{userProfile.Settings.SubscriptionTier}</p>
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
                    min={0}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  />
                  <button
                    onClick={async () => {
                      await saveEditing("Weight")
                    }}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.Metrics.Weight} {userProfile.Settings.UnitsPreference === "Imperial" ? "lbs" : "kg"}</p>
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
                    min={0}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="border px-2 py-1 rounded-2xl w-full text-black"
                  />
                  <button
                    onClick={async () => {
                      await saveEditing("Height")
                    }}
                    style={{ background: cssThemes.colors.secondary }}
                    className="mt-2 border px-2 py-1 rounded-lg shadow hover:shadow-md transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{userProfile.Metrics.Height} {userProfile.Settings.UnitsPreference === "Imperial" ? "ft" : "cm"}</p>
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
              <p>{userProfile.Metrics.JoinDate}</p>
            </div>
          </div>
        </section>
      </div>
  )
}

const Profile = () => {
  return (
    <Suspense fallback={<div className="flex justify-center">Loading...</div>}>
      <ProfileData dataPromise={loadUserProfileData()} />
    </Suspense>
  );
};

export default Profile;
