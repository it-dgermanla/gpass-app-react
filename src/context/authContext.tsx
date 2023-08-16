import { useEffect, useState, useContext, createContext, FC, ReactNode } from 'react';
import FullLoader from '../components/fullLoader';
import { User, onIdTokenChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface Auth {
  user: User | null;
  loading: boolean;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<Auth>({
  user: null,
  loading: true,
});

export const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const uns = onIdTokenChanged(auth, async (user: User | null) => {
      setUser(user);
      setLoading(false);
    })

    return () => {
      uns();
    }
  }, []);

  if (loading) return <FullLoader />;

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);