import React, { useState, useEffect } from 'react';

export default function Results({ results, round }) {

    return (
        <>
            <h2>Результаты:</h2>


            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Команда</th>
                        <th scope="col">Раунд 1</th>
                        <th scope="col">Раунд 2</th>
                        <th scope="col">Раунд 3</th>
                        <th scope="col">Итого</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((value, index) => {
                        if (!value)
                            return;

                        return <tr key={value.playerId}>
                            <th scope="row">{value.playerId}</th>
                            <td>{value.playerName}</td>
                            <td>{round >= 0 ? value.results[0] : <>&mdash;</>}</td>
                            <td>{round >= 1 ? value.results[1] : <>&mdash;</>}</td>
                            <td>{round >= 2 ? value.results[2] : <>&mdash;</>}</td>
                            <td><strong>{value.results.total}</strong></td>
                        </tr>
                    })}

                </tbody>
            </table>

        </>
    )
}
