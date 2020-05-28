import React, { useState, useEffect } from 'react';
import { api, instance } from '../../api';
import E from '../../events';
import Results from '../common/Results';
import Rounds from '../common/Rounds';
import Questions from '../common/Questions';

export default function AdminGame({ socket }) {

    const rounds = Array.from({ length: 3 }, (el, index) => index + 1);
    const questions = Array.from({ length: 12 }, (el, index) => index + 1);

    const [players, setPlayers] = useState([]);
    const [round, setRound] = useState(0);
    const [question, setQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [counter, setCounter] = useState(60);
    const [timerStarted, setTimerStarted] = useState(false);
    const [showNextButton, setShowNextButton] = useState(true);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await instance.post('/admin/players');

            setPlayers(response.data.players);
        }

        fetchPlayers();

        const onTimerStartedHandler = (data) => {
            console.log(E.GAME_TIMER_STATE);

            setCounter(data.counter);
        }

        const onTimerStopedHandler = (data) => {
            console.log(E.GAME_TIMER_STOPED);

            setTimerStarted(false);

            setShowNextButton(true);
        }

        const onGameStateHandler = (data) => {
            console.log(E.GAME_TIMER_STATE);
            console.log(data);

            setRound(data.currentRound);
            setQuestion(data.currentQuestion);
            setShowResults(data.showResults);
            setResults(data.results);
            setAnswers(data.answers);
        }

        const onAnswers = (data) => {
            console.log(E.ADMIN_ANSWERS);
            console.log(data);

            setAnswers(data.answers);
            console.log(data.answers);
        }

        const onResults = (data) => {
            console.log(E.GAME_RESULTS);
            console.log(data);

            setResults(data.results);
            setShowResults(true);
        }


        socket.on(E.ADMIN_PLAYERS_LIST, setPlayers);
        socket.on(E.GAME_TIMER_STATE, onTimerStartedHandler);
        socket.on(E.GAME_TIMER_STOPED, onTimerStopedHandler);
        socket.on(E.GAME_STATE, onGameStateHandler);
        socket.on(E.ADMIN_ANSWERS, onAnswers);
        socket.on(E.GAME_RESULTS, onResults);

        socket.on('disconnect', () => {
            console.log('disconnect');

            window.location.href = '/admin/login';
        });

        return () => {
            socket.off(E.ADMIN_PLAYERS_LIST, setPlayers);
            socket.off(E.GAME_TIMER_STATE, onTimerStartedHandler);
            socket.off(E.GAME_TIMER_STOPED, onTimerStopedHandler);
            socket.off(E.GAME_STATE, onGameStateHandler);
            socket.off(E.ADMIN_ANSWERS, onAnswers);
            socket.off(E.GAME_RESULTS, onResults);
        }
    }, []);

    const onGameStartHandler = () => {
        console.log(E.GAME_START);
        socket.emit(E.GAME_START);
    };

    const onTimerStartHandler = () => {
        console.log(E.GAME_TIMER_START);
        socket.emit(E.GAME_TIMER_START);

        setTimerStarted(true);
    };

    const onNextQuestionHandler = () => {
        console.log(E.GAME_NEXT_QUESTION);
        socket.emit(E.GAME_NEXT_QUESTION);
    }

    const onShowResultsHandler = () => {
        console.log(E.ADMIN_SHOW_RESULTS);
        socket.emit(E.ADMIN_SHOW_RESULTS);
    }

    const onAcceptHandler = (playerId) => {
        console.log('onAcceptHandler');
        console.log(playerId);
        socket.emit(E.ADMIN_ACCEPT_ANSWER, { playerId });
    }

    const onRejectHandler = (playerId) => {
        console.log('onRejectHandler');
        console.log(playerId);
        socket.emit(E.ADMIN_REJECT_ANSWER, { playerId });

    }

    return (
        <div className="container">
            <div className="pt-5">
                <div className="row">
                    <div className="col-md-8">
                        <h1>Пульт управления ЧГК</h1>
                        { /*<p>Игра активна <a href="#">(выйти)</a></p>*/}
                    </div>
                    <div className="col-md-4">
                        <button type="button" className="btn btn-lg btn-block btn-primary" onClick={onGameStartHandler}>Создать новую игру</button>
                    </div>
                </div>
            </div>
            <div className="">
                <div className="row">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-2">

                            </div>
                            <div className="col-md-6">

                            </div>
                            <div className="col-md-4 text-center">
                                <div className="counter">{counter == 60 ? '1:00' : (counter > 9 ? counter : '0' + counter)}</div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                                <h3>Раунд:</h3>
                            </div>
                            <div className="col-md-6">
                                <Rounds rounds={rounds} round={round} />
                            </div>
                            {timerStarted ||
                                <div className="col-md-4">
                                    <button
                                        type="button"
                                        className="btn btn-block btn-warning pull-right"
                                        onClick={onTimerStartHandler}>Начать отсчёт времени</button>
                                </div>
                            }
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                                <h3>Вопрос:</h3>
                            </div>
                            <div className="col-md-6">
                                <Questions questions={questions} question={question} showResults={showResults} />
                            </div>
                            <div className="col-md-4">
                                {showNextButton && !showResults && question == 11 &&
                                    <button
                                        type="button"
                                        className="btn btn-block btn-secondary pull-right"
                                        onClick={onShowResultsHandler}
                                    >Перейти к результатам</button>
                                }
                                {(showNextButton && question !== 11 || showResults) && !(round == 2 && question == 11) &&
                                    <button
                                        type="button"
                                        className="btn btn-block btn-secondary pull-right"
                                        onClick={onNextQuestionHandler}
                                    >Перейти к следующему вопросу</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">


                        {showResults && <Results results={results} round={round} />}

                        {!showResults &&
                            <>
                                <h2>Ответы:</h2>

                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Команда</th>
                                            <th scope="col">Ответ</th>
                                            <th scope="col">Дата&nbsp;и&nbsp;время</th>
                                            <th scope="col">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {typeof answers[round] !== 'undefined'
                                            && typeof answers[round][question] !== 'undefined'
                                            && answers[round][question].map(function (value, index) {
                                                if (value) return <tr>
                                                    <th scope="row">{value.playerId}</th>
                                                    <td>{value.playerName}</td>
                                                    <td>{value.active ? value.answer : <strike>{value.answer}</strike>}</td>
                                                    <td>{value.dt}</td>
                                                    <td>{value.active
                                                        && (value.accepted == null
                                                            ? <>
                                                                <button type="button" className="btn btn-sm btn-success"
                                                                    onClick={() => onAcceptHandler(value.playerId)}>верно</button>&nbsp;
                                                        <button type="button" className="btn btn-sm btn-danger"
                                                                    onClick={() => onRejectHandler(value.playerId)}>неверно</button>
                                                            </>
                                                            : (value.accepted
                                                                ? <span class="badge badge-success">верно</span>
                                                                : <span class="badge badge-danger">неверно</span>
                                                            )
                                                        )
                                                    }
                                                        {!value.active && <span class="badge badge-dark">отклонено</span>}
                                                    </td>
                                                </tr>
                                            })}

                                    </tbody>
                                </table>
                            </>
                        }
                    </div>
                </div>
            </div>

            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">

                        <h5>Игроки:</h5>


                        {players && players.map((player, i) => (
                            <><span key={player.id}>{player.name} ({player.id})</span>&nbsp;</>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
