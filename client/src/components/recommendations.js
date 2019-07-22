import React from 'react'
    const Recommendations = ({ recommendations }) => {
      return (
        <div>
          <center><h2>Recommendations</h2></center>
          {recommendations.map((recommendation) => (
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">{recommendation.artists[0].name}</h4>
                    <p class="card-text">{recommendation.name}</p>
                </div>
            </div>
          ))}
        </div>
      )
    };
    export default Recommendations