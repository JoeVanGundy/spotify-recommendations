import React from 'react'
const Recommendations = ({ recommendations }) => {
    return (
        <div class="container">
            <div>
                <h2>Recommendations</h2>
                        
                <table class="table">
                    <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Song</th>
                        <th>Popularity</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recommendations.map((recommendation) => (
                        <tr>
                            <td>{recommendation.artists[0].name}</td>
                            <td>{recommendation.name}</td>
                            <td>{recommendation.popularity}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};
export default Recommendations