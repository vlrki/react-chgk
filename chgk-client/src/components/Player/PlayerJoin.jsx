import React, { useState } from 'react';
import { api, instance } from '../../api';

function PlayerJoin({ onJoin }) {
    const [playerId, setPlayerId] = useState('');

    const onEnter = async () => {
        if (!playerId) return;

        await instance.post('/join', {
            playerId
        });

        onJoin({ playerId });
    }

    return (
        <div className="container">
            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">
                        <form className="form-signin">
                            <h1 className="h3 mb-3 font-weight-normal text-center">Вход в игру</h1>
                            <label htmlFor="inputTeam" className="sr-only">Номер команды</label>
                            <input
                                type="text"
                                id="inputTeam"
                                className="form-control mb-3"
                                placeholder="Номер команды"
                                required
                                autoFocus
                                value={playerId}
                                onChange={(e) => setPlayerId(e.target.value)}
                            />

                            <input
                                type="button"
                                className="btn btn-lg btn-primary btn-block"
                                onClick={onEnter}
                                value="Войти"
                            />
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

export default PlayerJoin;
