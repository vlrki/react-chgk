import React from 'react';

export default function Questions({ round, questions, question, showResults }) {

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                {questions.map((value, index) => {
                    return (index === question && !showResults)
                        ? <li className="page-item active" key={index}><a className="page-link" href="#">{value + round * 12}</a></li>
                        : <li className="page-item disabled" key={index}><a className="page-link" href="#">{value + round * 12}</a></li>
                })}
                {showResults
                    ? <li className="page-item active" key='results'><a className="page-link" href="#">Результаты</a></li>
                    : <li className="page-item disabled" key='results'><a className="page-link" href="#">Результаты</a></li>
                }

            </ul>
        </nav>
    )
}
