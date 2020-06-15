const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const crypto = require('crypto');
const md5 = require('md5');

const E = require('../client/src/events');
const C = require('./config');
const G = require('./game');
const U = require('./users');

// const Players = require('./controllers/players.controller');
const Player = require('./models/player.model');

G.init();

app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

//TODO Сделать массив токенов
let admin = {
    login: C.ADMIN_LOGIN,
    password: C.ADMIN_PASSWORD,
    token: '',
    socket: ''
};

// const players = new Map();


let initialState = {
    // active: false,
    players: new Map(),
    // currentRound: 0,
    // currentQuestion: 0,
    waitingForAnswers: false,
    additionalTime: false,
    // answers: [],
    // showResults: false,
    // results: {},
    // finishDt: null,
    counterId: null,
    tokens: new Map(),
};

state = { ...initialState };

getPlayersList = () => {
    return new Promise((resolve, reject) => {

        let ids = [];

        state.players.forEach(function (value, key, map) {
            ids.push(value);
        });

        if (ids.length) {
            Player.findByIds(ids, (err, resp) => {
                console.log('promise');
                console.log(resp);
                console.log(resp[0].name);

                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        } else {
            resolve([]);
        }
    });
}

app.get('/', (request, response) => {
    console.log('get');
    // console.log(request);

    res.send('Response');
});

app.post('/join', (req, res) => {
    console.log('Join');

    const { name, password } = req.body;


    Player.findByNameAndPassword(name, password, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.json({
                    error: `Не найдена команда с именем ${name}`
                });
            } else {
                res.json({
                    error: "Произошла ошибка при попыдке входа под именем " + name
                });
            }
        } else {
            let token = crypto.randomBytes(64).toString('hex');

            state.tokens.set(token, data.id);

            res.json({
                token
            });

        }
    });
});

app.post('/register', (req, res) => {
    console.log('Join');

    const { name, email, password } = req.body;

    const player = new Player({
        email: email,
        name: name,
        password: md5(password),
        active: 1
    });

    Player.create(player, (err, data) => {
        if (err) {
            console.log(err);
            res.json({
                error: err.sqlMessage
            });
        } else {

            let token = crypto.randomBytes(64).toString('hex');

            state.tokens.set(token, data.id);

            res.json({
                token
            });
        }
    });
});

app.post('/admin/login', (req, res) => {
    console.log('Login');

    const { login, password } = req.body

    if (admin.login !== login || admin.password !== password) {
        return;
    };

    admin.token = crypto.randomBytes(64).toString('hex');

    console.log(admin);

    res.json({
        token: admin.token
    });
});

app.post('/admin/players', (req, res) => {
    console.log('players');

    const { login, password } = req.body

    getPlayersList().then((players) => {
        res.json({
            players: players
        });
    });

});

io.on('connection', (socket) => {

    const sendAdminGameState = () => {
        console.log('sendAdminGameState');

        getPlayersList().then((players) => {
            io.to(admin.socket).emit(E.A_GAME_STATE, {
                ...G.getAdminState(),
                waitingForAnswers: state.waitingForAnswers,
                additionalTime: state.additionalTime,
                players: players
            });
        });

    }

    const sendAdminAnswers = () => {
        io.to(admin.socket).emit(E.ADMIN_ANSWERS, {
            answers: G.getAnswers()
        });
    }

    const sendPlayerGameState = () => {
        console.log('sendPlayerGameState');

        io.emit(E.GAME_STATE, {
            ...G.getPlayerState(),
            waitingForAnswers: state.waitingForAnswers,
            additionalTime: state.additionalTime,
        });
    }


    socket.on(E.PLAYER_JOINED, ({ token }) => {
        console.log(E.PLAYER_JOINED);

        if (!state.tokens.has(token)) {
            console.log('auth error');
            return;
        }

        let playerId = state.tokens.get(token);
        state.tokens.delete(token);

        socket.join(playerId);

        state.players.set(socket.id, playerId);

        Player.findById(playerId, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Player with id ${playerId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error retrieving Player with id " + playerId
                    });
                }
            } else {
                io.to(socket.id).emit(E.PLAYER_DATA, {
                    playerId,
                    playerName: data.name
                });

                sendPlayerGameState()
                sendAdminGameState();
            }
        });
    });

    socket.on(E.ADMIN_AUTH, ({ token }) => {
        console.log(E.ADMIN_AUTH);

        if (token !== admin.token) {
            console.log('error');
            return;
        }

        admin.socket = socket.id;

        sendAdminGameState();
    });

    socket.on(E.GAME_START, () => {
        console.log(E.GAME_STARTED);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        clearInterval(state.conterId);

        G.newGame();

        state = {
            waitingForAnswers: false,
            additionalTime: false,
            counterId: null,
            tokens: state.tokens,
            players: state.players,
        };

        io.emit(E.GAME_STARTED);

        sendPlayerGameState();
        sendAdminGameState();
    });

    socket.on(E.GAME_TIMER_START, () => {
        console.log(E.GAME_TIMER_START);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        counter = 60;

        G.set('waitingForAnswers', true);
        G.set('additionalTime', false);

        state.conterId = setInterval(() => {
            if (0 > counter) {

                additionalCounter = 10;
                G.set('additionalTime', true);

                clearInterval(state.conterId);

                // Дополнительные 10 секунд дополнительных секунды для получения ответов от всех
                state.conterId = setInterval(() => {

                    if (0 > additionalCounter) {
                        clearInterval(state.conterId);
                        G.set('waitingForAnswers', false);
                        G.set('additionalTime', false);

                        io.emit(E.GAME_TIMER_STOPED);
                    } else {
                        io.emit(E.GAME_TIMER_STATE, {
                            counter: additionalCounter,
                            waitingForAnswers: G.get('waitingForAnswers'),
                            additionalTime: G.get('additionalTime')
                        });
                    }

                    additionalCounter--;
                }, 1000);


            } else {
                io.emit(E.GAME_TIMER_STATE, {
                    counter,
                    waitingForAnswers: G.get('waitingForAnswers'),
                    additionalTime: G.get('additionalTime')
                });
            }

            counter--;
        }, 1000);
    });

    socket.on(E.GAME_TIMER_STOP, () => {
        console.log(E.GAME_TIMER_STOP);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        clearInterval(state.conterId);

        G.set('waitingForAnswers', false);
        G.set('additionalTime', false);

        io.emit(E.GAME_TIMER_STOPED);
    });

    socket.on(E.GAME_NEXT_QUESTION, () => {
        console.log(E.GAME_NEXT_QUESTION);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        G.set('waitingForAnswers', false);
        G.set('showResults', false);

        clearInterval(state.conterId);

        G.nextQuestion();

        sendAdminGameState();
        sendPlayerGameState();
    });

    socket.on(E.ADMIN_SHOW_RESULTS, () => {
        console.log(E.ADMIN_SHOW_RESULTS);

        state.showResults = true;

        let results = G.getResults();

        io.emit(E.GAME_RESULTS, { results });
    });

    socket.on(E.GAME_FINISH, () => {
        console.log(E.GAME_FINISHED);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        state.waitingForAnswers = false;
        socket.broadcast.emit(E.GAME_STARTED)
    });

    socket.on(E.PLAYER_SENT_ANSWER, ({ answer }) => {
        console.log(E.PLAYER_SENT_ANSWER);

        let playerId = state.players.get(socket.id);

        Player.findById(playerId, (err, resp) => {
            let dt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            let active = G.get('waitingForAnswers');

            if (!G.setAnswer({
                playerId,
                playerName: resp.name,
                answer,
                dt,
                active,
                accepted: null
            })) {
                //TODO: сообщение: Ответ уже получен
            }

            sendAdminGameState();
        });
    });

    socket.on(E.ADMIN_ACCEPT_ANSWER, ({ playerId, round, question }) => {
        console.log(E.ADMIN_ACCEPT_ANSWER);

        G.acceptAnswer(playerId, round, question);

        sendAdminAnswers();
    });

    socket.on(E.ADMIN_REJECT_ANSWER, ({ playerId, round, question }) => {
        console.log(E.ADMIN_REJECT_ANSWER);

        G.rejectAnswer(playerId, round, question);

        sendAdminAnswers();
    });

    const onDisconnect = () => () => {
        console.log(E.PLAYER_QUITED);

        if (state.players.has(socket.id)) {
            state.players.delete(socket.id);
        }

        getPlayersList().then((players) => {
            io.to(admin.socket).emit(E.ADMIN_PLAYERS_LIST, players);
        });

        io.emit('user disconnected');
    }

    socket.on('disconnect', onDisconnect);

    console.log('socket connected');
});



server.listen(C.SERVER_PORT, (err) => {
    if (err) {
        throw Error(err);
    }

    console.log('Server started');
});
