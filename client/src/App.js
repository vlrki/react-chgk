import React from 'react';

import reducer, { IS_AUTH, ADMIN_IS_AUTH } from './reducer';

import { Route, withRouter, BrowserRouter, Switch, Redirect } from 'react-router-dom';

import './App.css';

import PlayerJoin from './components/Player/PlayerJoin';
import PlayerGame from './components/Player/PlayerGame';
import AdminLogin from './components/Admin/AdminLogin';
import AdminGame from './components/Admin/AdminGame';


import E from './events';
import { socket, api, connectReducerToAPI } from './api';

function App({history}) {
    const initialState = {
        isAuth: false,
        isAdmin: false,
        gameStarted: false,
        token: '',

    }
    
    const [state, dispatch] = React.useReducer(reducer, initialState);
    connectReducerToAPI(dispatch);

    socket.on(E.GAME_STARTED, () => {
        console.log(E.GAME_STARTED);
        // dispatchApi({action: GAME_STARTED, payload: {gameStarted: true}})
        console.log(E.GAME_STARTED);
    });
    
    socket.on(E.GAME_FINISHED, () => {
        console.log(E.GAME_FINISHED);
    });
    
    socket.on(E.ADMIN_PLAYERS_LIST, (data) => {
        console.log(E.ADMIN_PLAYERS_LIST);
        console.log(data);
    });


    const onJoin = (obj) => {
        dispatch({
            type: IS_AUTH,
            payload: true
        });

        socket.emit(E.PLAYER_JOINED, obj);
    }

    const onLogin = (obj) => {
        dispatch({
            type: ADMIN_IS_AUTH,
            payload: {
                isAdmin: true,
                token: obj.token
            }
        });

        socket.emit(E.ADMIN_AUTH, obj);

        history.push('/admin/game');
    }

    console.log(state);

    return (
        <div className="App">
            <Switch>
                <Route path='/admin/game' render={() => {
                    console.log(state.isAdmin);
                    return <>
                        {!state.isAdmin && <Redirect to='/admin' />}
                        {state.isAdmin && <AdminGame 
                            socket={socket}
                        />}
                    </>
                }} />
                <Route path='/admin' render={() => <AdminLogin onLogin={onLogin} />} />
                <Route path='/' render={() => {
                    return <>
                        {!state.isAuth && <PlayerJoin onJoin={onJoin} />}
                        {state.isAuth && <PlayerGame
                            socket={socket}
                        />}
                    </>
                }} />
                <Route path='*' render={() => <div>404 Not found</div>} />
            </Switch>
        </div>
    );
}

export default withRouter(App);
