import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { API_ENDPOINTS } from "../config/api";
import type { BridgeStudentProfile } from "../types/bridgeCards";

interface BridgeAuthContextType {
  student: BridgeStudentProfile | null;
  token: string | null;
  login: (credentials: string, pin: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const BridgeAuthContext = createContext<BridgeAuthContextType | undefined>(
  undefined,
);

const TOKEN_KEY = "ze_bridge_token";
const STUDENT_KEY = "ze_bridge_student";

export const BridgeAuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<BridgeStudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from isolated localStorage items
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedStudentStr = localStorage.getItem(STUDENT_KEY);

      if (storedToken && storedStudentStr) {
        try {
          // Verify exactly what localStorage says to be sure the token hasn't expired.
          const res = await fetch(API_ENDPOINTS.bridgeCards.verify, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (!res.ok) {
            throw new Error("Token expired or invalid");
          }

          setToken(storedToken);
          setStudent(JSON.parse(storedStudentStr));
        } catch (error) {
          console.error("Student Auth Verification Failed:", error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(STUDENT_KEY);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: string, pin: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.bridgeCards.auth, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentials, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setToken(data.token);
      setStudent(data.student);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STUDENT_KEY, JSON.stringify(data.student));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = () => {
    setToken(null);
    setStudent(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STUDENT_KEY);
  };

  const value: BridgeAuthContextType = {
    student,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!student,
    isLoading,
  };

  return (
    <BridgeAuthContext.Provider value={value}>
      {children}
    </BridgeAuthContext.Provider>
  );
};

export const useBridgeAuth = () => {
  const context = useContext(BridgeAuthContext);
  if (context === undefined) {
    throw new Error("useBridgeAuth must be used within a BridgeAuthProvider");
  }
  return context;
};
