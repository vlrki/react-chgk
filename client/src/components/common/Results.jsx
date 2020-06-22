import React, { useState, useEffect } from 'react';

export default function Results({ results, round }) {

    return (
        <>
            <h2>Результаты:</h2>


            {[0, 1, 2].map((rnd, roundIndex) => {
                return <>
                    <h3>Раунд {rnd + 1}</h3>

                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Команда</th>
                                <th scope="col">{rnd * 12 + 1}</th>
                                <th scope="col">{rnd * 12 + 2}</th>
                                <th scope="col">{rnd * 12 + 3}</th>
                                <th scope="col">{rnd * 12 + 4}</th>
                                <th scope="col">{rnd * 12 + 5}</th>
                                <th scope="col">{rnd * 12 + 6}</th>
                                <th scope="col">{rnd * 12 + 7}</th>
                                <th scope="col">{rnd * 12 + 8}</th>
                                <th scope="col">{rnd * 12 + 9}</th>
                                <th scope="col">{rnd * 12 + 10}</th>
                                <th scope="col">{rnd * 12 + 11}</th>
                                <th scope="col">{rnd * 12 + 12}</th>
                                <th scope="col">Итого</th>
                            </tr>
                        </thead>
                        <tbody>

                            {results.map((player, playerIndex) => {
                                if (!player)
                                    return;

                                return <tr key={player.playerId}>
                                    <th scope="row">{player.playerId}</th>
                                    <td>{player.playerName}</td>

                                    {Object.keys(player.results[rnd]).map((question, questionId) => {
                                        if (question == 'total')
                                            return;

                                        return <td>{player.results[rnd][question] === null ? <>&mdash;</> : player.results[rnd][question]}</td>
                                    })}

                                    <td><strong>{player.results[rnd].total}</strong></td>
                                </tr>
                            })}

                        </tbody>
                    </table>
                </>
            })}
        </>
    )
}
