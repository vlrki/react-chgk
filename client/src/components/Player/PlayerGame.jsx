import React, { useState, useEffect } from 'react';
import { api, instance } from '../../api';
import E from '../../events';
import Results from '../common/Results';
import Rounds from '../common/Rounds';
import Questions from '../common/Questions';
import { Redirect } from 'react-router-dom';

export default function PlayerGame({ socket }) {

    const rounds = Array.from({ length: 3 }, (el, index) => index + 1);
    const questions = Array.from({ length: 12 }, (el, index) => index + 1);
    const [round, setRound] = useState(0);
    const [question, setQuestion] = useState(0);
    const [answer, setAnswer] = useState('');
    const [player, setPlayerData] = useState({ playerId: '', playerName: '' });
    const [counter, setCounter] = useState(0);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchGame = async () => {
            const response = await instance.post('/state');

            console.log(response);
        }

        fetchGame();

        const onTimerStartedHandler = (data) => {
            console.log(E.GAME_TIMER_STATE);

            setCounter(data.counter);
        }

        const onGameStateHandler = (data) => {
            console.log(E.GAME_TIMER_STATE);
            console.log(data);

            setRound(data.currentRound);
            setQuestion(data.currentQuestion);
            setShowResults(data.showResults);
            setResults(data.results);
        }

        const onPlayerData = (data) => {
            console.log(E.PLAYER_DATA);
            console.log(data);

            setPlayerData(data);
        }

        const onResults = (data) => {
            console.log(E.GAME_RESULTS);
            console.log(data);

            setResults(data.results);
            setShowResults(true);
        }

        socket.on(E.GAME_TIMER_STATE, onTimerStartedHandler);
        socket.on(E.GAME_STATE, onGameStateHandler);
        socket.on(E.PLAYER_DATA, onPlayerData);
        socket.on(E.GAME_RESULTS, onResults);

        socket.on('disconnect', () => {
            console.log('disconnect');

            window.location.href = '/join';
        });

        return () => {
            socket.off(E.GAME_TIMER_STATE, onTimerStartedHandler);
            socket.off(E.GAME_STATE, onGameStateHandler);
            socket.off(E.PLAYER_DATA, onPlayerData);
            socket.off(E.GAME_RESULTS, onResults);
        }
    }, []);

    const answerHandle = e => {
        setAnswer(e.target.value);
    };

    const onSubmitAnswerHandler = () => {
        console.log(E.PLAYER_SENT_ANSWER);
        socket.emit(E.PLAYER_SENT_ANSWER, { answer });
        setAnswer('');
    }

    return (
        <div className="container">
            <div className="pt-5">
                <div className="row">
                    <div className="col-md-8">
                        <h1>Игра</h1>
                        <p>{player.playerId && `Команда №${player.playerId} (${player.playerName})`}{/* <a href="#">(выйти)</a>*/}</p>
                    </div>
                    <div className="col-md-4 text-center">
                        <div className="counter">{counter == 60 ? '1:00' : (counter > 9 ? counter : '0' + counter)}</div>
                    </div>
                </div>
            </div>
            <div className="py-5">
                <div className="row">
                    <div className="col-md-12">

                        <div className="row">
                            <div className="col-md-2">
                                <h3>Раунд:</h3>
                            </div>
                            <div className="col-md-10">
                                <nav aria-label="Page navigation example">
                                    <Rounds rounds={rounds} round={round} />
                                </nav>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-2">
                                <h3>Вопрос:</h3>
                            </div>
                            <div className="col-md-10">
                                <nav aria-label="Page navigation example">
                                    <Questions questions={questions} question={question} showResults={showResults} />
                                </nav>
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

                            <form className="form-answer">

                                <h2>Ваш ответ:</h2>

                                <div className="form-group">
                                    <textarea className="form-control" id="inputAnswer" rows="5" onChange={answerHandle} value={answer} />
                                </div>
                                {counter
                                    ? <input type="button" className="btn btn-lg btn-primary btn-block" onClick={onSubmitAnswerHandler} value="Отправить" />
                                    : <input type="button" className="btn btn-lg btn-primary btn-block" onClick={onSubmitAnswerHandler} disabled value="Отправить" />
                                }
                            </form>
                        }
                    </div>
                </div>
            </div>

        </div>
    )
}
