import { useEffect, useState, useContext, createContext, FC, ReactNode } from 'react';
import FullLoader from '../components/fullLoader';
import { User as UserAuth, onIdTokenChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User } from "../interfaces";
import { getGenericDocById } from "../services/firebase";

interface Auth {
  user: UserAuth | null;
  userFirestore: User | null;
  loading: boolean;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<Auth>({
  user: null,
  loading: true,
  userFirestore: null
});

export const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [userFirestore, setUserFirestore] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const uns = onIdTokenChanged(auth, async (user: UserAuth | null) => {
      setUser(user);

      if (!user) {
        setLoading(false);
        setUserFirestore(null);

        return;
      }

      try {
        const userData = await getGenericDocById<User>("Users", user.uid);
        setUserFirestore(userData);
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    });

    return () => {
      uns();
    }
  }, []);

  if (loading) return <FullLoader />;

  return <AuthContext.Provider value={{ user, userFirestore, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);