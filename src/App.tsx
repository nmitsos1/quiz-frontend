import React from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import StyledFirebaseAuth from './StyledFirebaseAuth';
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';

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
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default App;
