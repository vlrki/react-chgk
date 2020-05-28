export const IS_AUTH = 'IS_AUTH';
export const ADMIN_IS_AUTH = 'ADMIN_IS_AUTH';
export const GAME_STARTED = 'GAME_STARTED';



export default (state, action) => {
    switch (action.type) {
        case IS_AUTH:
            return {
                ...state,
                isAuth: action.payload
            }
        case ADMIN_IS_AUTH:
            return {
                ...state,
                ...action.payload
            }
        case GAME_STARTED:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    };
}

// export const setGameStarted = () => {

// }