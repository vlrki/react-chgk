import io from 'socket.io-client';
import axios from 'axios';
import E from './events';
import { SERVER_URL } from './config';

export const socket = io(SERVER_URL);

let dispatchApi;

export const connectReducerToAPI = (dispatch) => { 
    dispatchApi = dispatch;
}

export const api = {
    gameStart() {
        console.log(E.GAME_START);
        socket.emit(E.GAME_START);
    },

    timerStart() {
        console.log(E.GAME_TIMER_START);
        socket.emit(E.GAME_TIMER_START);
    },

    timerStop() {
        console.log(E.GAME_TIMER_FINISH);
        socket.emit(E.GAME_TIMER_FINISH);
    }
}



export const instance = axios.create({
    baseURL: SERVER_URL + '/',
    timeout: 1000,
    // headers: { 'X-Custom-Header': 'foobar' }
});

// export default socket;