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
    const [additionalTime, setAdditionalTime] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await instance.post('/admin/players');

            setPlayers(response.data.players);
        }

        fetchPlayers();

        const onTimerStateHandler = (data) => {
            console.log(E.GAME_TIMER_STATE);

            setCounter(data.counter);
            setAdditionalTime(data.additionalTime);
        }

        const onTimerStopedHandler = (data) => {
            console.log(E.GAME_TIMER_STOPED);

            setTimerStarted(false);
            setShowNextButton(true);
        }

        const onGameStateHandler = (data) => {
            console.log(E.GAME_STATE);
            console.log(data);

            setRound(data.currentRound);
            setQuestion(data.currentQuestion);
            setShowResults(data.showResults);
            setResults(data.results);
            setAnswers(data.answers);
            setPlayers(data.players);
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
        socket.on(E.GAME_TIMER_STATE, onTimerStateHandler);
        socket.on(E.GAME_TIMER_STOPED, onTimerStopedHandler);
        socket.on(E.A_GAME_STATE, onGameStateHandler);
        socket.on(E.ADMIN_ANSWERS, onAnswers);
        socket.on(E.GAME_RESULTS, onResults);

        socket.on('disconnect', () => {
            console.log('disconnect');

            window.location.href = '/admin/login';
        });

        return () => {
            socket.off(E.ADMIN_PLAYERS_LIST, setPlayers);
            socket.off(E.GAME_TIMER_STATE, onTimerStateHandler);
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

    const onTimerStopHandler = () => {
        console.log(E.GAME_TIMER_STOP);
        socket.emit(E.GAME_TIMER_STOP);

        setAdditionalTime(false);
        setShowNextButton(true);
    };

    const onNextQuestionHandler = () => {
        console.log(E.GAME_NEXT_QUESTION);
        socket.emit(E.GAME_NEXT_QUESTION);
        setShowNextButton(false);
    }

    const onShowResultsHandler = () => {
        console.log(E.ADMIN_SHOW_RESULTS);
        socket.emit(E.ADMIN_SHOW_RESULTS);
    }

    const onAcceptHandler = (playerId, round, question) => {
        console.log('onAcceptHandler');
        console.log(playerId);
        socket.emit(E.ADMIN_ACCEPT_ANSWER, { playerId, round, question });
    }

    const onRejectHandler = (playerId, round, question) => {
        console.log('onRejectHandler');
        console.log(playerId);
        socket.emit(E.ADMIN_REJECT_ANSWER, { playerId, round, question });

    }

    return (
        <div className="container">
            <div className="pt-5">
                <div className="row">
                    <div className="col-md-9">
                        <h1>Пульт управления ЧГК</h1>
                        { /*<p>Игра активна <a href="#">(выйти)</a></p>*/}
                    </div>
                    <div className="col-md-3">
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
                            <div className="col-md-7">

                            </div>
                            <div className="col-md-3 text-center">
                                <div className={"counter" + (additionalTime ? " additional" : "")}>{counter == 60 ? '1:00' : (counter > 9 ? counter : '0' + counter)}</div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                                <h3>Раунд:</h3>
                            </div>
                            <div className="col-md-7">
                                <Rounds rounds={rounds} round={round} />
                            </div>
                            {timerStarted ||
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-block btn-warning pull-right"
                                        onClick={onTimerStartHandler}>Включить таймер</button>
                                </div>
                            }
                            {!timerStarted ||
                                <div className="col-md-3">
                                    <button
                                        type="button"
                                        className="btn btn-block btn-danger pull-right"
                                        onClick={onTimerStopHandler}>Остановить таймер</button>
                                </div>
                            }
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                                <h3>Вопрос:</h3>
                            </div>
                            <div className="col-md-7">
                                <Questions questions={questions} question={question} round={round} showResults={showResults} />
                            </div>
                            <div className="col-md-3">
                                {showNextButton && !showResults && question == 11 &&
                                    <button
                                        type="button"
                                        className="btn btn-block btn-secondary pull-right"
                                        onClick={onShowResultsHandler}
                                    >К результатам</button>
                                }
                                {(showNextButton && question !== 11 || showResults) && !(round == 2 && question == 11) &&
                                    <button
                                        type="button"
                                        className="btn btn-block btn-secondary pull-right"
                                        onClick={onNextQuestionHandler}
                                    >Следующий вопрос</button>
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
                                                if (value) return <tr key={round+question+value.playerId}>
                                                    <th scope="row">{value.playerId}</th>
                                                    <td>{value.playerName}</td>
                                                    <td>{value.active ? value.answer : <strike>{value.answer}</strike>}</td>
                                                    <td>{value.dt}</td>
                                                    <td>{value.active
                                                        && (value.accepted == null
                                                            ? <>
                                                                <button type="button" className="btn btn-sm btn-success"
                                                                    onClick={() => onAcceptHandler(value.playerId, round, question)}>верно</button>&nbsp;
                                                        <button type="button" className="btn btn-sm btn-danger"
                                                                    onClick={() => onRejectHandler(value.playerId, round, question)}>неверно</button>
                                                            </>
                                                            : (value.accepted
                                                                ? <span className="badge badge-success">верно</span>
                                                                : <span className="badge badge-danger">неверно</span>
                                                            )
                                                        )
                                                    }
                                                        {!value.active && <span className="badge badge-dark">отклонено</span>}
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
