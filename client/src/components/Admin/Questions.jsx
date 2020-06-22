import React from 'react';

export default function Questions({ round, questions, question, showResults, openedRound, openedQuestion, onOpenQuestion, onOpenResults, openedResults }) {

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                {questions.map((value, index) => {
                    if (index === question && openedRound === round && !showResults) {
                        return <li className="page-item active" key={index}><a className="page-link" href="#" onClick={() => onOpenQuestion(index)}>{value + openedRound * 12}</a></li>;
                    }

                    if ((openedRound < round || (openedRound == round && index < question)) || (openedRound == round && showResults)) {
                        return <li className={"page-item" + (index === openedQuestion ? " opened" : "")} key={index}><a className="page-link" href="#" onClick={() => onOpenQuestion(index)}>{value + openedRound * 12}</a></li>;
                    }

                    return <li className="page-item disabled" key={index}><a className="page-link" href="#">{value + openedRound * 12}</a></li>;
                })}
                {showResults
                    ? <li className="page-item active" key='results'><a className="page-link" href="#">Результаты</a></li>
                    : <li className="page-item disabled" key='results'><a className="page-link" href="#">Результаты</a></li>
                }
            </ul>

            <ul className="pagination">
                <li className={openedResults ? "page-item opened" : "page-item"} key='results'><a className="page-link" href="#" onClick={() => onOpenResults()}>Предпросмотр результатов</a></li>
            </ul>
        </nav>
    )
}
