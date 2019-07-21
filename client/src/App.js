import React, { Component } from 'react';
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
      nowPlaying: { name: 'Not Checked', albumArt: '' }
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

  getNowPlaying(){
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      })
  }

  getRecommendations(songIds){
    var smallerSongIds = this.getSmallList(songIds, 5)
    spotifyApi.getRecommendations({seed_tracks: smallerSongIds.join(','), max_popularity: '25', limit: 20})
      .then((response) => {
        console.log(response)
        this.replacePlaylist(JSON.parse(JSON.stringify(response)))
      });
  }

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

  getTrackUris(recommendations){
    var trackUris = []
    recommendations.tracks.forEach(function(track) {
      trackUris.push(track.uri)
    });
    return trackUris
  }

  replacePlaylist(recommendations){
    spotifyApi.replaceTracksInPlaylist('4oIlq0CsjISPnaQ03nXqoh', this.getTrackUris(recommendations))
      .then((response) => {
        // console.log(response)
      });
  }

  getTopTracks(){
    spotifyApi.getMyTopTracks({time_range: 'short_term'})
      .then((response) => {
        var songIds = this.getSongIds(JSON.parse(JSON.stringify(response)))
        this.getRecommendations(songIds)
      });
  }


  getSongIds(data){
    var songIds = []
    data.items.forEach(function(object) {
      songIds.push(object.id)
    });
    return songIds
  }


  render() {
    return (
      <div className="App">
      { !this.state.loggedIn &&
        <a href='http://localhost:8888' > Login to Spotify </a>
      }
        { this.state.loggedIn &&
          <button onClick={() => this.getTopTracks()}>
            Add Songs
          </button>
        }
      </div>
    );
  }
}

export default App;