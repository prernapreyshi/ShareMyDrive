import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role);

            const currentPath = location.pathname;

            const isRedirectPage = ["/", "/login", "/signup"].includes(currentPath);

            if (data.role === "rider") {
              const riderRef = doc(db, "riders", currentUser.uid);
              const riderDoc = await getDoc(riderRef);
              if (isRedirectPage) {
                navigate(riderDoc.exists() ? "/rider-dashboard" : "/rider-details");
              }
            } else if (data.role === "driver") {
              const driverRef = doc(db, "drivers", currentUser.uid);
              const driverDoc = await getDoc(driverRef);
              if (isRedirectPage) {
                navigate(driverDoc.exists() ? "/driver-dashboard" : "/driver-details");
              }
            }
          } else {
            navigate("/select-role");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <UserContext.Provider value={{ user, role, logoutUser, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
