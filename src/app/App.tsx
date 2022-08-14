import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import StyledFirebaseAuth from './../StyledFirebaseAuth';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import TopBar from './TopBar';
import Announcements from './Announcements';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    user.getIdToken().then(async (token) => {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    })
  }
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // You can handle errors globally here if it suits the project
    }
  })
});

function App() {
  return (
    <div className='app-main'>
      <QueryClientProvider client={queryClient} >
        <TopBar />
        <Announcements />
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
