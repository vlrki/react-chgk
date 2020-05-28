const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const crypto = require('crypto');

const E = require('../client/src/events');
console.log(E);

app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

const liguePlayers = {
    1: 'Костыль',
    2: 'Ашот из Алупки', 
    3: 'Псионики', 
    4: 'Бутылка брома', 
    5: 'Old school', 
    6: 'Один за всех и все за Одина', 
    7: 'Мимо проходили'
}

let admin = {
    login: 'admin123',
    password: 'admin123',
    token: '',
    socket: ''
};

const players = new Map();


let initialState = {
    active: false,
    players: [],
    currentRound: 0,
    currentQuestion: 0,
    waitingForAnswers: true,
    answers: [],
    showResults: false,
    results: {},
    finishDt: null
};

getPlayersList = () => {
    let playersList = [];

    players.forEach(function (value, key, map) {
        playersList.push({ id: value, name: liguePlayers[value] });
    });

    return playersList;
}

initialState.answers = Array.from({ length: 3 }, (el, index) => Array.from({ length: 12 }, (el, index) => []));

// initialState.answers[0][0][1] = {
//     playerId: 1,
//     playerName: 'Снежинки',
//     answer: 'blabla',
//     dt: '2020-05-27 12:12:12',
//     active: true,
//     accepted: null
// };

// initialState.answers[0][0][2] = {
//     playerId: 2,
//     playerName: 'Зайчики',
//     answer: 'blasdfsdfbla dsfsdf',
//     dt: '2020-05-27 12:12:13',
//     active: true,
//     accepted: true
// };

// initialState.answers[0][1][2] = {
//     playerId: 2,
//     playerName: 'Дримтим',
//     answer: 'qweqwe er',
//     dt: '2020-05-27 12:12:15',
//     active: false,
//     accepted: null
// };
// initialState.answers[0][4][2] = {
//     playerId: 2,
//     playerName: 'Снежинки',
//     answer: 'blabla',
//     dt: '2020-05-27 12:12:12',
//     active: true,
//     accepted: true
// };

// initialState.answers[1][5][2] = {
//     playerId: 2,
//     playerName: 'Снежинки',
//     answer: 'blabla',
//     dt: '2020-05-27 12:12:12',
//     active: true,
//     accepted: true
// };

// initialState.answers[2][6][3] = {
//     playerId: 3,
//     playerName: 'Дримтим',
//     answer: 'qweqwe er',
//     dt: '2020-05-27 12:12:15',
//     active: false,
//     accepted: true
// };

// initialState.answers[2][7][3] = {
//     playerId: 3,
//     playerName: 'Дримтим',
//     answer: 'qweqwe er',
//     dt: '2020-05-27 12:12:15',
//     active: false,
//     accepted: true
// };

state = { ...initialState };

getResults = () => {
    let a = [];
    let b = [];


    state.answers.forEach((value, round) => {

        a[round] = [];

        value.forEach((value, question) => {
            a[round][question] = [];

            value.forEach((value, player) => {

                a[round][question][player] = value.accepted ? 1 : 0;

                if (b[player] == undefined) {
                    b[player] = {
                        playerId: player,
                        playerName: liguePlayers[player],
                        results: {}
                    }
                    b[player].results = { 0: 0, 1: 0, 2: 0, total: 0 };
                    b[player].results[round] = 0;
                }

                if (value.accepted) {
                    b[player].results[round]++;
                }

            });
        });
    });

    b.forEach((value, player) => {
        for (round in value.results) {
            if (round == 'total' || round > state.currentRound)
                return;

            b[player].results.total += value.results[round];
        }
    });

    console.log('results', b);

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

    // console.log('results', b);

    return b;
}

// getResults();

// console.log(state.answers);

app.get('/', (request, response) => {
    console.log('get');
    // console.log(request);

    res.send('Response');
});

app.post('/join', (req, res) => {
    console.log(req.body);

    const { playerId } = req.body
    console.log(playerId);

    console.log('Join');
    console.log(players);
    res.json({
        players: [...players.keys()]
    });
});

app.post('/state', (req, res) => {
    console.log('state');
    res.json({
        state: []
    });
});

app.post('/admin/login', (req, res) => {
    console.log('Login');
    console.log(req.body);

    const { login, password } = req.body

    if (admin.login !== login || admin.password !== password) {
        return
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

    res.json({
        players: getPlayersList()
    });
});

// io.set( 'origins', 'chgk.lvlup.ru:8080' );

io.on('connection', (socket) => {

    const sendGameState = () => {
        console.log(sendGameState);

        io.emit(E.GAME_STATE, {
            currentRound: state.currentRound,
            currentQuestion: state.currentQuestion,
            showResults: state.showResults,
            answers: state.answers,
            results: getResults()
        });
    }

    socket.on(E.PLAYER_JOINED, ({ playerId }) => {
        console.log(E.PLAYER_JOINED);
        socket.join(playerId);

        players.set(socket.id, playerId);
        sendGameState();

        let playerName = liguePlayers[playerId];


        io.to(socket.id).emit(E.PLAYER_DATA, {
            playerId,
            playerName
        });

        io.to(admin.socket).emit(E.ADMIN_PLAYERS_LIST, getPlayersList());

        console.log(getPlayersList());
    });

    socket.on(E.ADMIN_AUTH, ({ token }) => {
        console.log(E.ADMIN_AUTH);
        console.log(token);
        console.log(admin.token);

        if (token !== admin.token) {
            console.log('error');
            return;
        }

        admin.socket = socket.id;

        sendGameState();   
    });

    socket.on(E.GAME_START, () => {
        console.log(E.GAME_STARTED);
        console.log(socket.id);
        console.log(admin.socket);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        state = {
            active: false,
            players: [],
            currentRound: 0,
            currentQuestion: 0,
            waitingForAnswers: true,
            answers: [],
            showResults: false,
            results: {},
            finishDt: null
        };

        io.emit(E.GAME_STARTED);
        sendGameState();
    });

    socket.on(E.GAME_TIMER_START, () => {
        console.log(E.GAME_TIMER_START);
        console.log(socket.id);
        console.log(admin.socket);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        counter = 60;

        conterId = setInterval(() => {
            console.log(counter);

            if (counter-- === 0) {
                clearInterval(conterId);

                // Ждём три дополнительных секунды для получения ответов от всех
                setTimeout(() => {
                    state.waitingForAnswers = false;
                    io.emit(E.GAME_TIMER_STOPED);
                }, 3000);
            } else {
                io.emit(E.GAME_TIMER_STATE, { counter });
            }
        }, 1000);

        state.waitingForAnswers = true;
    });

    socket.on(E.GAME_NEXT_QUESTION, () => {
        console.log(E.GAME_NEXT_QUESTION);
        console.log(socket.id);
        console.log(admin.socket);

        state.waitingForAnswers = true;
        state.showResults = false;

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }


        if (state.currentQuestion < 11 && state.currentRound <= 2) {
            state.currentQuestion++;
        } else if (state.currentQuestion == 11 && state.currentRound < 2) {
            state.currentQuestion = 0;
            state.currentRound++;
        } else if (state.currentQuestion == 11 && state.currentRound == 2) {
            io.emit(E.GAME_FINISHED);
        }

        sendGameState();

        console.log(state);
    });

    socket.on(E.ADMIN_SHOW_RESULTS, () => {
        console.log(E.ADMIN_SHOW_RESULTS);

        state.showResults =  true;

        let results = getResults();

        io.emit(E.GAME_RESULTS, { results });
    });

    socket.on(E.GAME_FINISH, () => {
        console.log(E.GAME_FINISHED);
        console.log(socket.id);
        console.log(admin.socket);

        if (socket.id != admin.socket) {
            console.log('error');
            return;
        }

        state.waitingForAnswers = false;
        socket.broadcast.emit(E.GAME_STARTED)
    });

    socket.on(E.PLAYER_SENT_ANSWER, ({ answer }) => {
        console.log(E.PLAYER_SENT_ANSWER);
        console.log(answer);

        let playerId = players.get(socket.id);
        let playerName = liguePlayers[playerId];
        let dt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let active = state.waitingForAnswers;

        if (!state.answers[state.currentRound][state.currentQuestion][playerId]) {
            state.answers[state.currentRound][state.currentQuestion][playerId] = {
                playerId, playerName, answer, dt, active, accepted: null
            };
        } else {
            //TODO: сообщение: Ответ уже получен
        }

        io.to(admin.socket).emit(E.ADMIN_ANSWERS, {
            answers: state.answers
        });
    });

    socket.on(E.ADMIN_ACCEPT_ANSWER, ({ playerId }) => {
        console.log(E.ADMIN_ACCEPT_ANSWER);
        console.log(playerId); 

        state.answers[state.currentRound][state.currentQuestion][playerId].accepted = true;

        io.to(admin.socket).emit(E.ADMIN_ANSWERS, {
            answers: state.answers
        });
    });

    socket.on(E.ADMIN_REJECT_ANSWER, ({ playerId }) => {
        console.log(E.ADMIN_REJECT_ANSWER);
        console.log(playerId);

        state.answers[state.currentRound][state.currentQuestion][playerId].accepted = false;

        io.to(admin.socket).emit(E.ADMIN_ANSWERS, {
            answers: state.answers
        });
    });

    socket.on('disconnect', () => {
        console.log(E.PLAYER_QUITED);

        if (players.has(socket.id)) {
            players.delete(socket.id);
        }

        console.log(players);

        io.to(admin.socket).emit(E.ADMIN_PLAYERS_LIST, getPlayersList());

        io.emit('user disconnected');
    });

    console.log('socket connected');
});



server.listen(8888, (err) => {
    if (err) {
        throw Error(err);
    }

    console.log('Server started');
});

//