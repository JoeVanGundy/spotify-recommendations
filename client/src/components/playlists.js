import React from 'react'; // get the React object from the react module


class Playlists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playlists: {}
        }
        this.changeSelect = this.changeSelect.bind(this);
    }

    componentDidMount() {
        this.getUsersPlaylist()
    }

    getUsersPlaylist() {
        this.props.spotifyApi.getUserPlaylists()
            .then((response) => {
                this.setState({ playlists: response });
            })
    }

    changeSelect(event){
        this.props.onPlaylistSelect(event);
    }

    render() {
        var playlists = []
        if (this.state.playlists.items !== undefined) {
            playlists = Object.keys(this.state.playlists.items).map(key =>
                <option id={this.state.playlists.items[key].id}>{this.state.playlists.items[key].name}</option>
            )
        }
        return (
            <div>
                <div class="container" style={{width:"40%"}}>
                    {
                        <div>
                            <h2>Add songs to which playlist:</h2>
                            <select onChange={this.changeSelect} class="form-control form-control-lg">
                                <option disabled selected value>Choose Playlist</option>
                                {playlists}
                            </select>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Playlists