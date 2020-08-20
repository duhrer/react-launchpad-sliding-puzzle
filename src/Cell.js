import React from 'react';

import Colours from "./Colours";

export default class Cell extends React.Component {
    handleClick = () => {
        this.props.onClick(this.props.row, this.props.col);
    };

    handleKeyDown = (event) => {
        this.props.onKeyDown(event, this.props.row, this.props.col);
    };

    render() {
        return (
            <button
                className={this.props.value === 0 ? "cell empty" : "cell"}
                ref={this.props.cellRef}
                onClick={this.handleClick}
                onKeyDown={this.handleKeyDown}
                style={{"backgroundColor": Colours[this.props.value]}}
            >
                {this.props.value === 0 ? "" : this.props.value}
            </button>
        );
    }
}
