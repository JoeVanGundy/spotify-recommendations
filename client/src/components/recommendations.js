import React from 'react';

class Recommendations extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div class="container">
                <div>
                    <h2>Recommendations</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Artist</th>
                                <th>Song</th>
                                <th>Top Track Popularity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.recommendations.map((recommendation) => (
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
        );
    }
}

export default Recommendations
