import io from 'socket.io-client';
import axios from 'axios';
import E from './events';

export const socket = io('http://chgk.lvlup.ru:8888');

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
    baseURL: 'http://chgk.lvlup.ru:8888/',
    timeout: 1000,
    // headers: { 'X-Custom-Header': 'foobar' }
});

// export default socket;