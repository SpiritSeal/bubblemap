/**
 * Firebase initialization and the small set of hooks the app uses, replacing
 * reactfire (dead since 2023). SDK instances are module-level singletons so
 * emulator wiring and App Check run exactly once, before first use.
 */
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  Auth,
  User,
  connectAuthEmulator,
  getAuth,
  onIdTokenChanged,
} from 'firebase/auth';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreError,
  Query,
  QuerySnapshot,
  connectFirestoreEmulator,
  initializeFirestore,
  onSnapshot,
  queryEqual,
} from 'firebase/firestore';
import {
  Functions,
  connectFunctionsEmulator,
  getFunctions,
} from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import Loading from '../components/Loading';

const isDev = import.meta.env.MODE !== 'production';
const isPreview = window.location.host !== 'bubblemap.app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfigPreview = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_DEV,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_DEV,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_DEV,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_DEV,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_DEV,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_DEV,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID_DEV,
};

export const firebaseApp = initializeApp(
  isPreview ? firebaseConfigPreview : firebaseConfig,
);

// App Check must be set up before the first Firestore/Functions request.
if (!isDev && import.meta.env.VITE_RECAPTCHA_PUBLIC_KEY) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(
      import.meta.env.VITE_RECAPTCHA_PUBLIC_KEY,
    ),
    isTokenAutoRefreshEnabled: true,
  });
}

const auth = getAuth(firebaseApp);
const firestore = initializeFirestore(firebaseApp, {});
const functions = getFunctions(firebaseApp, 'us-west2');

if (isDev) {
  connectAuthEmulator(auth, 'http://localhost:9099/', {
    disableWarnings: true,
  });
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
} else {
  getAnalytics(firebaseApp);
  getPerformance(firebaseApp);
}

export const useAuth = (): Auth => auth;
export const useFirestore = (): Firestore => firestore;
export const useFunctions = (): Functions => functions;

const UserContext = createContext<{ user: User | null } | undefined>(undefined);

/**
 * Subscribes to auth state once for the whole app and blocks rendering until
 * the initial state is known, so `useUser`/`useSigninCheck` are synchronous.
 * onIdTokenChanged (rather than onAuthStateChanged) also fires on profile and
 * provider-link changes, which the Account page relies on; the wrapper object
 * keeps each emission referentially fresh since the SDK mutates `User`.
 */
export const FirebaseUserProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<{ user: User | null } | null>(
    null,
  );

  useEffect(() => onIdTokenChanged(auth, (user) => setUserState({ user })), []);

  if (userState === null) return <Loading />;

  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
  );
};

export const useUser = (): { data: User | null } => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error('useUser must be used within FirebaseUserProvider');
  return { data: context.user };
};

export const useSigninCheck = (): {
  data: { signedIn: boolean; user: User | null };
} => {
  const { data: user } = useUser();
  return { data: { signedIn: user !== null, user } };
};

interface ObservableStatus<T> {
  status: 'loading' | 'success' | 'error';
  data: T | undefined;
  error?: FirestoreError;
}

/**
 * Callers rebuild Query objects every render; resubscribe only when the query
 * actually changes.
 */
const useStableQuery = (query: Query): Query => {
  const stable = useRef(query);
  if (stable.current !== query && !queryEqual(stable.current, query)) {
    stable.current = query;
  }
  return stable.current;
};

export const useFirestoreDocData = <T,>(
  ref: DocumentReference,
  options?: { idField?: string },
): ObservableStatus<T> => {
  const [state, setState] = useState<ObservableStatus<T>>({
    status: 'loading',
    data: undefined,
  });
  const idField = options?.idField;

  useEffect(() => {
    setState({ status: 'loading', data: undefined });
    return onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data();
        setState({
          status: 'success',
          data:
            data === undefined
              ? undefined
              : ({
                  ...data,
                  ...(idField ? { [idField]: snapshot.id } : {}),
                } as T),
        });
      },
      (error) => setState({ status: 'error', data: undefined, error }),
    );
    // Refs are interchangeable by path; callers rebuild them every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.path, idField]);

  return state;
};

export const useFirestoreCollection = (
  query: Query,
): ObservableStatus<QuerySnapshot> => {
  const stableQuery = useStableQuery(query);
  const [state, setState] = useState<ObservableStatus<QuerySnapshot>>({
    status: 'loading',
    data: undefined,
  });

  useEffect(() => {
    setState({ status: 'loading', data: undefined });
    return onSnapshot(
      stableQuery,
      (snapshot) => setState({ status: 'success', data: snapshot }),
      (error) => setState({ status: 'error', data: undefined, error }),
    );
  }, [stableQuery]);

  return state;
};

export const useFirestoreCollectionData = <T,>(
  query: Query,
  options?: { idField?: string },
): ObservableStatus<T[]> => {
  const stableQuery = useStableQuery(query);
  const [state, setState] = useState<ObservableStatus<T[]>>({
    status: 'loading',
    data: undefined,
  });
  const idField = options?.idField;

  useEffect(() => {
    setState({ status: 'loading', data: undefined });
    return onSnapshot(
      stableQuery,
      (snapshot) =>
        setState({
          status: 'success',
          data: snapshot.docs.map(
            (docSnapshot) =>
              ({
                ...(docSnapshot.data() as DocumentData),
                ...(idField ? { [idField]: docSnapshot.id } : {}),
              }) as T,
          ),
        }),
      (error) => setState({ status: 'error', data: undefined, error }),
    );
  }, [stableQuery, idField]);

  return state;
};
