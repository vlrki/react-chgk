import React from 'react';

export default function Rounds({ rounds, round }) {

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                {rounds.map((value, index) => {
                    return index === round
                        ? <li className="page-item active" key={index}><a className="page-link" href="#">{value}</a></li>
                        : <li className="page-item disabled" key={index}><a className="page-link" href="#">{value}</a></li>
                })}
            </ul>
        </nav>
    )
}
