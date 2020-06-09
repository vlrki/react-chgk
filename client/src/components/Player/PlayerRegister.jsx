import React, { useState } from 'react';
import { api, instance } from '../../api';
import { Redirect } from 'react-router-dom';

function PlayerRegister({ onRegister }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');

    const onEnter = async () => {
        setError('');

        if (!name || !password || !password2 || !email || (password !== password2)) {            
            setError('Заполните все поля');
            return;
        };

        let response = await instance.post('/register', {
            name, email, password
        });

        if (response.data.error) {
            setError(response.data.error);
            return;
        }

        onRegister({ token: response.data.token });
        // return <Redirect to={"/"} push /> 
        // onJoin({ playerId });
    }

    return (
        <div className="container">
            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">
                        <form className="form-signin">
                            <h1 className="h3 mb-3 font-weight-normal text-center">Регистрация команды</h1>
                            <label htmlFor="inputTeam" className="sr-only">Название команды</label>
                            <input
                                type="text"
                                id="inputTeam"
                                className="form-control mb-3"
                                placeholder="Название команды"
                                required
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <label htmlFor="inputTeam" className="sr-only">E-mail</label>
                            <input
                                type="email"
                                id="inputTeam"
                                className="form-control mb-3"
                                placeholder="E-mail"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <label htmlFor="inputPassword" className="sr-only">Пароль</label>
                            <input
                                type="password"
                                id="inputPassword"
                                className="form-control mb-3"
                                placeholder="Пароль"
                                required
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <label htmlFor="inputPassword2" className="sr-only">Пароль</label>
                            <input
                                type="password"
                                id="inputPassword2"
                                className="form-control mb-3"
                                placeholder="Повторите пароль"
                                required
                                autoFocus
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                            />

                            {error &&
                                <div class="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            }

                            <input
                                type="button"
                                className="btn btn-lg btn-primary btn-block"
                                onClick={onEnter}
                                value="Зарегистрироваться"
                            />
                            <p className="mt-5 mb-3 center"><a href="/">Войти</a></p>
                            {/*
                            <p className="mt-5 mb-3 text-muted">&copy; 2017-2020</p>
                            */}
                        </form>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default PlayerRegister;
