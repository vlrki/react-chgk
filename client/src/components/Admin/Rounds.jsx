import React from 'react';

export default function Rounds({ rounds, round, openedRound, openedQuestion, onOpenRound }) {

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                {rounds.map((value, index) => {

                    if (index === round) {
                        return <li className="page-item active" key={index} onClick={() => onOpenRound(index)}><a className="page-link" href="#">{value}</a></li>
                    }

                    if (index < round) {
                        return <li className={"page-item" + (index === openedRound ? " opened" : "")} key={index} onClick={() => onOpenRound(index)}><a className="page-link" href="#">{value}</a></li>;
                    }

                    return <li className="page-item disabled" key={index}><a className="page-link" href="#">{value}</a></li>
                })}
            </ul>
        </nav>
    )
}
