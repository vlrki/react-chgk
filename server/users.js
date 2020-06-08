let users = {
    _users: {
        1: {
            name: 'Костыль',
            password: '111',
            email: 'example1@example.com'
        },
        2: {
            name: 'Ашот из Алупки',
            password: '222',
            email: 'example2@example.com'
        },
        3: {
            name: 'Псионики',
            password: '333',
            email: 'example3@example.com'
        },
        4: {
            name: 'Бутылка брома',
            password: '444',
            email: 'example4@example.com'
        },
        5: {
            name: 'Old school',
            password: '555',
            email: 'example5@example.com'
        },
        6: {
            name: 'Один за всех и все за Одина',
            password: '666',
            email: 'example6@example.com'
        },
        7: {
            name: 'Мимо проходили',
            password: '777',
            email: 'example7@example.com'
        },
    },

    authUser(id, password) {
        if (typeof this._users[id] !== 'undefined' && this._users[id].password === password) {
            return this._users[id];
        }

        return null;
    },

    getUser(id) {
        if (typeof this._users[id] !== 'undefined') {
            return this._users[id];
        }

        return {
            id: id,
            name: 'Anonimous'
        }
    },
};

module.exports = users;