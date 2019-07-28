import React, { Component } from 'react';
import Recommendations from './components/recommendations'
import './App.css';

import SpotifyWebApi from 'spotify-web-api-js';
import Genres from './components/genres';
import Playlists from './components/playlists';

const spotifyApi = new SpotifyWebApi();

export const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "670b1531e1d74e8c97c3c81aaa6fc9b0";
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-private", 
  "user-read-email",
  "user-read-playback-state", 
  "user-top-read", 
  "playlist-modify-public"
];

// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

window.location.hash = "";


class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    this.state = {
      token: null,
      loggedIn: token ? true : false,
      recommendations: [],
      topTracks: [],
      topArtists: [],
      maxPopularity: 50,
      chosenPlaylist: "",
      availableGenres: [
        "acoustic",
        "afrobeat",
        "alt-rock",
        "alternative",
        "ambient",
        "anime",
        "black-metal",
        "bluegrass",
        "blues",
        "bossanova",
        "brazil",
        "breakbeat",
        "british",
        "cantopop",
        "chicago-house",
        "children",
        "chill",
        "classical",
        "club",
        "comedy",
        "country",
        "dance",
        "dancehall",
        "death-metal",
        "deep-house",
        "detroit-techno",
        "disco",
        "disney",
        "drum-and-bass",
        "dub",
        "dubstep",
        "edm",
        "electro",
        "electronic",
        "emo",
        "folk",
        "forro",
        "french",
        "funk",
        "garage",
        "german",
        "gospel",
        "goth",
        "grindcore",
        "groove",
        "grunge",
        "guitar",
        "happy",
        "hard-rock",
        "hardcore",
        "hardstyle",
        "heavy-metal",
        "hip-hop",
        "holidays",
        "honky-tonk",
        "house",
        "idm",
        "indian",
        "indie",
        "indie-pop",
        "industrial",
        "iranian",
        "j-dance",
        "j-idol",
        "j-pop",
        "j-rock",
        "jazz",
        "k-pop",
        "kids",
        "latin",
        "latino",
        "malay",
        "mandopop",
        "metal",
        "metal-misc",
        "metalcore",
        "minimal-techno",
        "movies",
        "mpb",
        "new-age",
        "new-release",
        "opera",
        "pagode",
        "party",
        "philippines-opm",
        "piano",
        "pop",
        "pop-film",
        "post-dubstep",
        "power-pop",
        "progressive-house",
        "psych-rock",
        "punk",
        "punk-rock",
        "r-n-b",
        "rainy-day",
        "reggae",
        "reggaeton",
        "road-trip",
        "rock",
        "rock-n-roll",
        "rockabilly",
        "romance",
        "sad",
        "salsa",
        "samba",
        "sertanejo",
        "show-tunes",
        "singer-songwriter",
        "ska",
        "sleep",
        "songwriter",
        "soul",
        "soundtracks",
        "spanish",
        "study",
        "summer",
        "swedish",
        "synth-pop",
        "tango",
        "techno",
        "trance",
        "trip-hop",
        "turkish",
        "work-out",
        "world-music"],
      selectedGenres: []
    }
    this.handleChange = this.handleChange.bind(this);
    this.onGenreCheck = this.onGenreCheck.bind(this);
    this.onPlaylistSelect = this.onPlaylistSelect.bind(this);
  }

  handleChange(event) {
    this.setState({ maxPopularity: event.target.value });
  }

  onGenreCheck(event){
    if (this.state.selectedGenres.length > 4) {
      event.target.checked = false
    }
    if (event.target.checked) {
      this.setState({
        selectedGenres: [...this.state.selectedGenres, event.target.id]
      })
    } else {
      this.setState({
        selectedGenres: this.state.selectedGenres.filter((_, i) => i !== this.state.selectedGenres.indexOf(event.target.id))
      });
    }
  }

  onPlaylistSelect(event) {
    this.setState({ chosenPlaylist: event.target.options[event.target.selectedIndex].id });
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

  // Replace all the existing tracks in the playlist with the new recommendations
  replacePlaylist(playlist, recommendations) {
    spotifyApi.replaceTracksInPlaylist(playlist, this.getTrackUris(recommendations))
      .then((response) => {
      });
  }

  createPlaylist(playlist) {
    spotifyApi.createPlaylist('joevg95', {name: 'Undiscovered Weekly'})
    .then((response) => {
    })
  }


  getSelectedGenres() {
    return this.state.selectedGenres.join(',')
  }


  // Returns track recommendations from genres
  getRecommendationsFromGenres() {
    var promises = []
    for (var i=0; i<5; i++) {
      promises.push(spotifyApi.getRecommendations({ seed_genres: this.getSelectedGenres(), max_popularity: 100, limit: 100 }));
    }
    return Promise.all(promises)
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
    const numberOfRecommendations = 30;
    var unpopularArtists = []
    artists.forEach(function (artist) {
      if (artist.popularity < popularity) {
        unpopularArtists.push(artist)
      }
    });
    unpopularArtists.length = numberOfRecommendations
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

  getArtists(artists){
    var promises = []
    var i, j, temparray, chunk = 50;
    for (i = 0, j = artists.length; i < j; i += chunk) {
      temparray = artists.slice(i, i + chunk);
      promises.push(spotifyApi.getArtists(temparray))
    }
    return Promise.all(promises)
  }

  updateRecommendations() {
    this.getRecommendationsFromGenres()
      .then((response) => {
        var uniqueArtists = this.getArtistsFromRecommendations(JSON.parse(JSON.stringify(this.flatten(response, 'tracks'))))
        return this.getArtists(uniqueArtists)
      })
      .then((response) => {
        var unpopularArtists = this.getUnpopularArtists(JSON.parse(JSON.stringify(this.flatten(response, 'artists'))), this.state.maxPopularity)
        return this.getArtistsTopTracks(unpopularArtists)
      })
      .then((response) => {
        var recommendations = this.getTopTrackFromArtistsTopTracks(response)
        this.setState({ recommendations: recommendations })
      })
  }

  flatten(object, type){
    var flat = [];
    for (var i = 0; i < object.length; i++) {
      if (type == 'tracks') {
        flat = flat.concat(object[i].tracks);
      } else {
        flat = flat.concat(object[i].artists);
      }
    }
    return flat
  }

  getUsersPlaylist() {
    spotifyApi.getUserPlaylists()
    .then((response) => {
    })
  }

  componentDidMount() {
  
    // Set token
    let _token = hash.access_token;
    if (_token) {
      spotifyApi.setAccessToken(_token);
      // Set token
      this.setState({
        token: _token
      });
    }
  }

  render() {
    return (
      <div className="App">
        {!this.state.token &&
          <a className="btn btn--login App-link" href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}>
            Login to Spotify
          </a>
        }
        {this.state.token &&
          <div>
            <Genres genres={this.state.availableGenres} handleGenreCheck={this.onGenreCheck} />
            <Playlists spotifyApi={spotifyApi} onPlaylistSelect={this.onPlaylistSelect}/>
            <form>
              <label for="customRange1"><h3>Max Artist Popularity: {this.state.maxPopularity}</h3></label>
              <input style={{ marginLeft: '50px', width: '400px' }} type="range" class="custom-range" id="customRange1" onChange={this.handleChange}></input>
            </form>
            <br></br>
            <button style={{marginRight: "200px"}}type="button" className="btn btn-primary" onClick={() => this.updateRecommendations()}>
              Get New Recommendations
            </button>
            <button type="button" className="btn btn-primary" onClick={() => this.replacePlaylist(this.state.chosenPlaylist, this.state.recommendations)}>
              Add to Playlist
            </button>
            <button type="button" className="btn btn-primary" onClick={() => this.getUsersPlaylist()}>
            Create Playlist
            </button>
            <Recommendations recommendations={this.state.recommendations} />
          </div>
        }
      </div>
    );
  }
}

export default App;