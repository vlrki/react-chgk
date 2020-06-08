let users = {
    _users: {
        1: {
            name: 'Костыль',
            password: '111',
            email: 'example@example.com'
        },
        2: {
            name: 'Ашот из Алупки',
            password: '222',
            email: 'example@example.com'
        },
        3: {
            name: 'Псионики',
            password: '333',
            email: 'example@example.com'
        },
        4: {
            name: 'Бутылка брома',
            password: '444',
            email: 'example@example.com'
        },
        5: {
            name: 'Old school',
            password: '555',
            email: 'example@example.com'
        },
        6: {
            name: 'Один за всех и все за Одина',
            password: '666',
            email: 'example@example.com'
        },
        7: {
            name: 'Мимо проходили',
            password: '777',
            email: 'example@example.com'
        },
    },

    getUser(id) {
        if (typeof this._users[id] !== 'undefined') {
            return this._users[id];
        }

        return {
            id: id,
            name: 'Anonimous'
        }
    }

};

module.exports = users;