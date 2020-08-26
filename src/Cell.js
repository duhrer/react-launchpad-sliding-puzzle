import React from 'react';

import Colours from "./Colours";

export default class Cell extends React.Component {
<<<<<<< HEAD
    constructor(props) {
        super(props);
        this.buttonRef = React.createRef();
    }

    focus() {
        this.buttonRef.current.focus();
    }

    handleClick = () => {
        this.props.onClick(this.props.row, this.props.col);
    };

    handleKeyDown = (event) => {
        this.props.onKeyDown(event, this.props.row, this.props.col);
    };

=======
>>>>>>> master
    render() {
        return (
            <button
                className={this.props.value === 0 ? "cell empty" : "cell"}
<<<<<<< HEAD
                ref={this.buttonRef}
                onClick={this.handleClick}
                onKeyDown={this.handleKeyDown}
=======
                ref={this.props.cellRef} row={this.props.row}
                col={this.props.col} onClick={()=>{ this.props.handleClick(this.props)}}
                onKeyDown={(event) => { this.props.handleKeyDown(event, this.props)}}
>>>>>>> master
                style={{"backgroundColor": Colours[this.props.value]}}
            >
                {this.props.value === 0 ? "" : this.props.value}
            </button>
        );
    }
}
