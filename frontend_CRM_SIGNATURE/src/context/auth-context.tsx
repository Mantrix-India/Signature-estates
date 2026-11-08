// 'use client';

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from 'react';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';
// import { User } from '@/types/auth';
// import {
//   loginRequest,
//   registerRequest,
//   logoutRequest,
//   getMeRequest,
// } from '@/lib/api/auth-api';

// interface AuthContextValue {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (fullName: string, email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     async function loadUser() {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         setIsLoading(false);
//         return;
//       }
//       try {
//         const me = await getMeRequest();
//         setUser(me);
//       } catch {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     loadUser();
//   }, []);

//   async function login(email: string, password: string) {
//     const result = await loginRequest({ email, password });
//     localStorage.setItem('accessToken', result.accessToken);
//     localStorage.setItem('refreshToken', result.refreshToken);
//     setUser(result.user);
//     toast.success(`Welcome back, ${result.user.fullName}`);
//     router.push('/dashboard');
//   }

//   async function register(fullName: string, email: string, password: string) {
//     const result = await registerRequest({ fullName, email, password });
//     localStorage.setItem('accessToken', result.accessToken);
//     localStorage.setItem('refreshToken', result.refreshToken);
//     setUser(result.user);
//     toast.success('Account created successfully');
//     router.push('/dashboard');
//   }

//   async function logout() {
//     const refreshToken = localStorage.getItem('refreshToken');
//     try {
//       if (refreshToken) await logoutRequest(refreshToken);
//     } catch {
//       // clear local state regardless of API failure
//     }
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     setUser(null);
//     router.push('/login');
//   }

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User } from '@/types/auth';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
} from '@/lib/api/auth-api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await getMeRequest();
        setUser(me);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email: string, password: string) {
    const result = await loginRequest({ email, password });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user);
    toast.success(`Welcome back, ${result.user.fullName}`);
    router.push('/dashboard');
  }

  async function register(fullName: string, email: string, password: string) {
    const result = await registerRequest({ fullName, email, password });
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user);
    toast.success('Account created successfully');
    router.push('/dashboard');
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      // clear local state regardless of API failure
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  }

  function updateUser(updated: User) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}