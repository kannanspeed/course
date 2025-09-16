import { useEffect, useState } from "react";
import "./App.css";
import { Auth } from "./components/auth";
import TaskManager from "./components/task-manager";
import { SimpleSubscription } from "./components/simple-subscription";
import { supabase } from "./supabase-client";
import { checkAdminStatus } from "./utils/admin";

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session);
    
    // Check admin status if user is logged in
    if (currentSession.data.session?.user?.email) {
      const adminStatus = await checkAdminStatus(currentSession.data.session.user.email);
      setIsAdmin(adminStatus);
    }
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        // Check admin status when auth state changes
        if (session?.user?.email) {
          const adminStatus = await checkAdminStatus(session.user.email);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        alert('Logout failed: ' + error.message);
      } else {
        // Force clear session state
        setSession(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
      // Force clear session state even if logout fails
      setSession(null);
      setIsAdmin(false);
    }
  };

  return (
    <>
      {session ? (
        <>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "1rem", 
            background: "#f8f9fa", 
            borderBottom: "1px solid #dee2e6" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontWeight: "500" }}>Welcome, {session.user.email}</span>
              {isAdmin && (
                <span style={{ 
                  background: "#ff6b6b", 
                  color: "white", 
                  padding: "0.25rem 0.5rem", 
                  borderRadius: "3px",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={logout}
                style={{ 
                  padding: "0.5rem 1rem", 
                  background: "#dc3545", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Log Out
              </button>
              <button 
                onClick={() => {
                  // Emergency logout - clear all state
                  setSession(null);
                  setIsAdmin(false);
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                style={{ 
                  padding: "0.5rem 1rem", 
                  background: "#6c757d", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem"
                }}
                title="Emergency logout if normal logout fails"
              >
                Force Logout
              </button>
            </div>
          </div>
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
            <SimpleSubscription session={session} />
            <TaskManager session={session} />
          </div>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
}

export default App;
