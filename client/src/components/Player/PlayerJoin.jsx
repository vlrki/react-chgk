import React, { useState } from 'react';
import { api, instance } from '../../api';

function PlayerJoin({ onJoin }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onEnter = async () => {
        setError('');
        if (!name || !password) {
            setError('Заполните все поля');
            return;
        };

        let response = await instance.post('/join', {
            name, password
        });

        if (response.data.error) {
            setError(response.data.error);
            return;
        }

        onJoin({ token: response.data.token });
        // return <Redirect to={"/admin/game"} push /> 
        // onJoin({ playerId });
    }

    return (
        <div className="container">
            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">
                        <form className="form-signin">
                            <h1 className="h3 mb-3 font-weight-normal text-center">Вход в игру</h1>
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

                            {error &&
                                <div class="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            }

                            <input
                                type="button"
                                className="btn btn-lg btn-primary btn-block"
                                onClick={onEnter}
                                value="Войти"
                            />

                            <p className="mt-5 mb-3 text-muted center"><a href="/register">Зарегистрироваться</a></p>
                            {/* <p className="mt-5 mb-3 text-muted">&copy; 2017-2020</p> */}

                        </form>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default PlayerJoin;
