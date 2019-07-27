import React from 'react'; // get the React object from the react module

class Genres extends React.Component {
    constructor(props) {
        super(props);
        this.handleCheck = this.handleCheck.bind(this);
    }

    handleCheck(event){
        this.props.handleGenreCheck(event)
    }

    render() {
        return (
        <div>
            <div>
                {this.props.genres.map((genre) => (
                    <div class="custom-control custom-checkbox custom-control-inline">
                        <input type="checkbox" class="custom-control-input" id={genre} onClick={this.handleCheck}></input>
                        <label class="custom-control-label" for={genre}>{genre}</label>
                    </div>
                ))}
            </div>
        </div>
        );
    }
}

export default Genres