import React, { Component } from 'react';
import Recommendations from './components/recommendations'
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
import { unwatchFile } from 'fs';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      recommendations: [],
      topTracks: [],
      topArtists: [],
      maxPopularity: 50
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({maxPopularity: event.target.value});
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }




  // Returns the uris of the tracks to be put in the playlist
  getTrackUris(recommendations) {
    var trackUris = []
    recommendations.forEach(function (track) {
      trackUris.push(track.uri)
    });
    return trackUris
  }

  //4oIlq0CsjISPnaQ03nXqoh
  // Replace all the existing tracks in the playlist with the new recommendations
  replacePlaylist(playlist, recommendations) {
    spotifyApi.replaceTracksInPlaylist(playlist, this.getTrackUris(recommendations))
      .then((response) => {
      });
  }

  // Returns track recommendations from genres
  getUsersTopTrack(time_range) {
    // return this.getUsersTopGenres()
    // .then((response) => {
    //   return response
    // })
    // .then((response) => {
    //   console.log(response.join(','))
    //   return spotifyApi.getRecommendations({ seed_genres: response.join(','), max_popularity: '10', limit: 50 });
    // })
    return spotifyApi.getRecommendations({ seed_genres: 'indie,indie-pop,folk', max_popularity: this.state.maxPopularity, limit: 50 });
  }

  getArtistsFromRecommendations(recommendations) {
    var artists = []
    recommendations.forEach(function (recommendation) {
      artists.push(recommendation.artists[0].id)
    });
    let uniqueArtists = [...new Set(artists)];
    return uniqueArtists
  }

  // Get list of artists with popularity less than the popularity variable
  getUnpopularArtists(artists, popularity) {
    var unpopularArtists = []
    artists.artists.forEach(function (artist) {
      if (artist.popularity < popularity) {
        unpopularArtists.push(artist)
      }
    });
    return unpopularArtists
  }

  // Return the top tracks for multiple artists
  getArtistsTopTracks(unpopularArtists) {
    var promises = [];
    unpopularArtists.map((artist, i) => {
      promises.push(spotifyApi.getArtistTopTracks(artist.id, 'US'));
    })
    return Promise.all(promises)
  }

  // Return the top track from multiple artists top tracks
  getTopTrackFromArtistsTopTracks(artistsTopTracks) {
    var artistsTopTrack = []
    artistsTopTracks.forEach(function (artistTopTracks) {
      if (artistTopTracks.tracks.length > 0) {
        artistsTopTrack.push(artistTopTracks.tracks[0])
      }
    });
    return artistsTopTrack
  }

  getUsersTopGenres() {
    return spotifyApi.getMyTopArtists({ limit: 1 })
      .then((response) => {
        var topArtists = JSON.parse(JSON.stringify(response)).items[0].genres
        if (topArtists.length >= 5) {
          topArtists.length = 5
        }
        return topArtists
      })
  }


  updateRecommendations() {
    this.getUsersTopTrack('short_term')
      .then((response) => {
        var uniqueArtists = this.getArtistsFromRecommendations(JSON.parse(JSON.stringify(response)).tracks)
        return spotifyApi.getArtists(uniqueArtists)
      })
      .then((response) => {
        var unpopularArtists = this.getUnpopularArtists(JSON.parse(JSON.stringify(response)), this.state.maxPopularity)
        return this.getArtistsTopTracks(unpopularArtists)
      })
      .then((response) => {
        var recommendations = this.getTopTrackFromArtistsTopTracks(response)
        this.setState({ recommendations: recommendations })
      })
  }

  componentDidMount() {
    this.updateRecommendations()
  }

  render() {
    return (
      <div className="App">
        {!this.state.loggedIn &&
          <a href='http://localhost:8888' > Login to Spotify </a>
        }
        {this.state.loggedIn &&
          <div>
            <form>
              <label for="customRange1"><h3>Max Artist Popularity: {this.state.maxPopularity}</h3></label>
              <input style={{marginLeft:'50px', width:'400px'}} type="range" class="custom-range" id="customRange1" onChange={this.handleChange}></input>
            </form>
            <br></br>
            <button type="button" className="btn btn-primary" onClick={() => this.updateRecommendations()}>
              Get New Recommendations
            </button>
              <button type="button" className="btn btn-primary" onClick={() => this.replacePlaylist('4oIlq0CsjISPnaQ03nXqoh', this.state.recommendations)}>
                Add to Playlist
            </button>
            <Recommendations recommendations={this.state.recommendations} />
          </div>
        }
      </div>
    );
  }
}

export default App;