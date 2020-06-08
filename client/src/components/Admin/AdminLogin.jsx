import React, { useState } from 'react';
import {instance} from '../../api';
import { Redirect } from 'react-router-dom';

export default function AdminLogin({ onLogin }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const onEnter = async () => {
        if (!login || !password) return;

        const response = await instance.post('/admin/login', {
            login,
            password
        });

        onLogin({ token: response.data.token });
        return <Redirect to={"/admin/game"} push /> 
    }

    return (
        <div className="container">

            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">
                        <form className="form-signin">
                            <h1 className="h3 mb-3 font-weight-normal text-center">Войдите</h1>
                            <label htmlFor="inputLogin" className="sr-only">Логин</label>
                            <input
                                type="text"
                                id="inputLogin"
                                className="form-control"
                                placeholder="Login"
                                required
                                autoFocus
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                            />
                            <label htmlFor="inputPassword" className="sr-only">Пароль</label>
                            <input
                                type="password"
                                id="inputPassword"
                                className="form-control"
                                placeholder="Пароль"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="button"
                                className="btn btn-lg btn-primary btn-block"
                                value="Войти"
                                onClick={onEnter}
                            />
                        </form>

                    </div>
                </div>
            </div>

        </div>
    )
}
