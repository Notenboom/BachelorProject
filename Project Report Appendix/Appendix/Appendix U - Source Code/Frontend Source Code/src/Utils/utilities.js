import { DATE_LOCALE, DATE_OPTIONS} from './config.js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export const ParseDate = (value) => new Date(value * 1000).toLocaleString(DATE_LOCALE, DATE_OPTIONS);

const firebaseConfig = {
    apiKey: "AIzaSyAjoVbUYzWWOr5fXIfP0xjAVoqrPvc02rQ",
    authDomain: "bachelorproject-324708.firebaseapp.com",
    projectId: "bachelorproject-324708",
    storageBucket: "bachelorproject-324708.appspot.com",
    messagingSenderId: "134490106214",
    appId: "1:134490106214:web:551710e51ad1e432a540a7"
}

const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();