import React, { Component } from 'react';
import Recommendations from './components/recommendations'
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      recommendations: [],
      topTracks: []
    }
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


  getRecommendedTracks(songIds){
    var smallerSongIds = this.getSmallList(songIds, 5)
    spotifyApi.getRecommendations({seed_tracks: smallerSongIds.join(','), max_popularity: '25', limit: 20})
      .then((response) => {
        return JSON.parse(JSON.stringify(response))
      });
  }


  // Spotify can only take 5 seeds
  // This randomly selects 5 seeds from the array
  getSmallList(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }


  // Replace all the existing tracks in the playlist with the new recommendations
  replacePlaylist(recommendations){
    console.log(recommendations)
    spotifyApi.replaceTracksInPlaylist('4oIlq0CsjISPnaQ03nXqoh', this.getTrackUris(recommendations))
      .then((response) => {
      });
  }

  // Returns the uris of the tracks to be put in the playlist
  getTrackUris(recommendations){
    var trackUris = []
    recommendations.forEach(function(track) {
      trackUris.push(track.uri)
    });
    return trackUris
  }

  // Returns an array of the ids for the user's top songs/artists
  getIds(data){
    var ids = []
    data.items.forEach(function(object) {
      ids.push(object.id)
    });
    return ids
  }

  getRecommendations(typeForGeneration){
    if (typeForGeneration == 'artist') {
      spotifyApi.getMyTopArtists({time_range: 'short_term'})
      .then((response) => {
        var ids = this.getIds(JSON.parse(JSON.stringify(response)))
        var recommendations = this.getRecommendedTracks(ids)
        this.replacePlaylist(recommendations)
      });
    } else {
      spotifyApi.getMyTopTracks({time_range: 'short_term'})
      .then((response) => {
        var ids = this.getIds(JSON.parse(JSON.stringify(response)))
        this.setState({topTracks: ids})

        if (this.state.topTracks == null) {
          return null;
        }
        else {
          var smallerSongIds = this.getSmallList(ids, 5)
          spotifyApi.getRecommendations({seed_tracks: smallerSongIds.join(','), max_popularity: '25', limit: 20})
            .then((response) => {
              console.log(JSON.parse(JSON.stringify(response)).tracks)
              this.setState({recommendations: JSON.parse(JSON.stringify(response)).tracks})
            });
        }
      });
    }
  }

  componentDidMount() {
    this.getRecommendations('track')
  }


  render() {
    return (
      <div className="App">
      { !this.state.loggedIn &&
        <a href='http://localhost:8888' > Login to Spotify </a>
      }
      { this.state.loggedIn &&
        <div>
          <button type="button" class="btn btn-primary" onClick={() => this.replacePlaylist(this.state.recommendations)}>
            Add to Playlist
          </button>
          <Recommendations recommendations={this.state.recommendations}/>
        </div>
      }
      </div>
    );
  }
}

export default App;