import React, { useMemo, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import StyledFirebaseAuth from './../StyledFirebaseAuth';
import axios, { AxiosError } from 'axios'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import _, { split } from 'lodash';
import MessageBar from './MessageBar';
import Moment from 'moment';
import Main from './main/Main';
import { BrowserRouter as Router } from 'react-router-dom';

const firebaseConfig = {
  apiKey: "AIzaSyBd-0G7MbAm5kFMgfSCu91OdMqwxcoGTX4",
  authDomain: "quiz-e585a.firebaseapp.com",
  projectId: "quiz-e585a",
  storageBucket: "quiz-e585a.appspot.com",
  messagingSenderId: "141725654516",
  appId: "1:141725654516:web:76aa09b1edee8afb4feda1",
  measurementId: "G-PNBVB4QD4E"
};
firebase.initializeApp(firebaseConfig);

// Configure FirebaseUI.
const uiConfig = {
  // Popup or redirect.
  signInFlow: 'popup',
  // Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // Email and Password with registration disabled
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      disableSignUp: { status: true }
    }
  ]
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /** On login, set authorization token and UI login state */
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      user.getIdToken().then(async (token) => {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        setIsLoggedIn(true)
      })
    }
  });

  /** Refresh token logic with debounce */
  const refreshToken = () => {
    firebase.auth().currentUser?.getIdToken(true).then(async (token) => {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    });
    queryClient.clear();
    queryClient.resetQueries();
  }
  const debouncedRefreshToken = useMemo(() => _.debounce(refreshToken, 500), []);

  axios.interceptors.response.use((response) => response, (error) => {
    if (error.response.status === 401) {
      debouncedRefreshToken();
    }
    return Promise.reject(error);
  });

  interface SpringErrorData {
    error: string,
    message: string,
    status: number,
    errors: Array<SpringError>
  }

  interface SpringError {
    defaultMessage: string,
    objectName: string,
    field: string,
  }

  /** Global queryClient callbacks for queries and mutations. Used for message handling here */
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: async (error, variables, context, mutation) => {
        const key = mutation.options.mutationKey
        
        let err = error as AxiosError;
        let errMessage = '';
        if (err.request.responseType === 'blob') {
          let blob: Blob = err.response?.data as Blob;
          errMessage = await blob.text();
          errMessage = errMessage.split(': ')[1].split('\\r\\n')[0];
        } else {
          const errorData: SpringErrorData = err.response?.data as SpringErrorData;
          errMessage = `${errorData.message}`;
          if (errorData.errors) {
            errMessage = errMessage + '\r\n';
            errorData.errors.forEach((springError) => {
              errMessage = errMessage + springError.defaultMessage + '\r\n';
            })
          } else {
            errMessage = err.request.response.split(': ')[1].split('\\r\\n')[0];
          }
        }
        //const errMessage = err.request.response.split(': ')[1].split('\\r\\n')[0];
        setAlertColor('danger');
        setAlertMessage(`${err.message} - ${errMessage}`);
        setCurrentDate(new Date())
      },
      onSuccess: (data, variables, context, mutation) => {
        const key = mutation.options.mutationKey
        if (key) {
          const action = `${key?.toString().split('-')[0]}${key?.toString().split('-')[0] === 'add' ? 'ed' : 'd'}`
          const record = `${key?.toString().split('-')[1]}`
          setAlertColor('success');
          setAlertMessage(`You have successfully ${action} a${['a', 'e', 'i', 'o', 'u'].indexOf(record[0]) !== -1 ? 'n' : ''} ${record}
            AT ${Moment(new Date()).format('MMMM D, YYYY hh:mm:ss A')}`);
          setCurrentDate(new Date())
        }
      }
    })
  });

  const [alertColor, setAlertColor] = useState('info');
  const [alertMessage, setAlertMessage] = useState('');
  const [currentDate, setCurrentDate] = useState<Date>();

  const main = useMemo(() => { return <Main />}, []);
  const queryClientMemo = useMemo(() => queryClient, []);  

  /** Actual App rendering based on login state */
  if (!isLoggedIn) {
    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
  }
  
  return (
    <div className='app-main'>
      <QueryClientProvider client={queryClientMemo} >
        <MessageBar color={alertColor} message={alertMessage} setMessage={setAlertMessage}/>
        <Router>
          {main}
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
