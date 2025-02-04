'use strict';

const fs = require('fs');
const U = require('./users');
const GAME_STATE_FILE = 'data/game.json';

let game = {
    _state: {
        active: false,
        // players: [],
        currentRound: 0,
        currentQuestion: 0,
        // waitingForAnswers: true,
        // additionalTime: false,
        answers: [],
        showResults: false,
        results: {},
        finishDt: null,
        // counterId: null
    },

    init() {
        console.log('init');

        this._state.answers = Array.from({ length: 3 }, (el, index) => Array.from({ length: 12 }, (el, index) => []));
        this.loadState();
    },

    set(key, value) {
        this._state[key] = value;

        this.saveGame();
    },

    get(key) {
        return this._state[key];
    },

    // State
    newGame() {
        this._state = {
            active: false,
            // players: [],
            currentRound: 0,
            currentQuestion: 0,
            // waitingForAnswers: true,
            // additionalTime: false,
            answers: [],
            showResults: false,
            results: {},
            finishDt: null,
            // counterId: null
        },

            this._state.answers = Array.from({ length: 3 }, (el, index) => Array.from({ length: 12 }, (el, index) => []));

        this.saveState();
    },

    loadState() {
        console.log('loading state');

        if (fs.existsSync(GAME_STATE_FILE)) {
            let data = fs.readFileSync(GAME_STATE_FILE);
            this._state = JSON.parse(data);
            console.log(this._state);
        }

        console.log(this._state);
    },

    saveState() {
        console.log('saving state');

        let data = JSON.stringify(this._state);
        fs.writeFileSync(GAME_STATE_FILE, data);
    },

    getAdminState() {
        return {
            active: this._state.active,
            players: this._state.players,
            currentRound: this._state.currentRound,
            currentQuestion: this._state.currentQuestion,
            waitingForAnswers: this._state.waitingForAnswers,
            additionalTime: this._state.additionalTime,
            answers: this._state.answers,
            showResults: this._state.showResults,
            results: this._state.results,
            // finishDt: this._state.finishDt,
            conterId: this._state.conterId,
        }
    },
    getPlayerState() {
        return {
            active: this._state.active,
            players: this._state.players,
            currentRound: this._state.currentRound,
            currentQuestion: this._state.currentQuestion,
            waitingForAnswers: this._state.waitingForAnswers,
            additionalTime: this._state.additionalTime,
            // answers: this._state.answers,
            showResults: this._state.showResults,
            results: this._state.results,
            // finishDt: this._state.finishDt,
            conterId: this._state.conterId,
        }
    },

    getRound() {
        return this._state.currentRound;
    },

    getQuestion() {
        return this._state.currentQuestion;
    },

    nextRound() {
        return this._state.currentRound++;
    },

    nextQuestion() {
        //TODO
        if (this._state.currentQuestion < 11 && this._state.currentRound <= 2) {
            this._state.currentQuestion++;
        } else if (this._state.currentQuestion == 11 && this._state.currentRound < 2) {
            this._state.currentQuestion = 0;
            this._state.currentRound++;
        } else if (this._state.currentQuestion == 11 && this._state.currentRound == 2) {
            this._state.active = false;
            this._state.finishDt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            io.emit(E.GAME_FINISHED);
        }

        this.saveState();

        return;
    },

    // Answer
    setAnswer(data) {
        if (!this._state.answers[this._state.currentRound][this._state.currentQuestion][data.playerId]) {
            this._state.answers[this._state.currentRound][this._state.currentQuestion][data.playerId] = data;

        } else {
            return false;
        }

        this.saveState();

        return true;
    },

    getAnswers() {
        return this._state.answers;
    },

    acceptAnswer(playerId, round, question) {
        this._state.answers[round][question][playerId].accepted = true;

        this.saveState();

        return true;
    },

    rejectAnswer(playerId, round, question) {
        this._state.answers[round][question][playerId].accepted = false;

        this.saveState();

        return true;
    },

    // Archive
    saveGame() {

    },
    getGame(id) {

    },

    // Players
    getPlayer(id) {

    },
    setPlayer(data) {

    },
    getPlayers() {

    },


    // Results
    getResults() {
        let a = [];
        let b = [];

        this._state.answers.forEach((value, round) => {
            a[round] = [];

            value.forEach((value, question) => {
                a[round][question] = [];

                value.forEach((value, playerId) => {
                    if (value) {
                        a[round][question][playerId] = value.accepted ? 1 : null;

                        if (b[playerId] == undefined) {
                            b[playerId] = {
                                playerId: playerId,
                                playerName: value.playerName,
                                results: {}
                            }

                            b[playerId].results = { 0: {}, 1: {}, 2: {}, total: 0 };

                            for (let i = 0; i < 3; i++) {
                                for (let j = 0; j < 12; j++) {
                                    if (i < this._state.currentRound
                                        || i == this._state.currentRound && j <= this._state.currentQuestion
                                    ) {
                                        b[playerId].results[i][j] = 0;
                                    } else {
                                        b[playerId].results[i][j] = null;
                                    }
                                }

                                b[playerId].results[i].total = 0;
                            }
                        }

                        if (value.accepted) {
                            b[playerId].results[round][question] = 1;
                            b[playerId].results[round].total++;
                            b[playerId].results.total++;
                        } 
                    }
                });
            });
        });

        b.forEach((value, player) => {
            for (let round in value.results) {
                if (round == 'total' || round > state.currentRound)
                    return;

                b[player].results[round] = value.results[round];

                b[player].results.total += value.results[round].total;

                if (round == 1) {
                    b[player].results[1].total += b[player].results[0].total;
                }

                if (round == 2) {
                    b[player].results[2].total += b[player].results[1].total;
                }
            }
        });

        function compareByTotal(a, b) {
            if (a.results.total < b.results.total) {
                return 1;
            }

            if (a.results.total > b.results.total) {
                return -1;
            }

            return 0;
        }

        b.sort(compareByTotal);

        return b;
    }


};

module.exports = game;