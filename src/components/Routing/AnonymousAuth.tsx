import React, { ReactNode, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { useAuth, useUser } from 'reactfire';
import Loading from '../Loading';

const AnonymousAuth = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const user = useUser().data;

  useEffect(() => {
    // login user anonymously using firebase
    if (!user) signInAnonymously(auth);
  }, [auth, user]);

  if (!user) return <Loading />;

  // Required to avoid error
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AnonymousAuth;
