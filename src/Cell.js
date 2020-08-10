import React from 'react';

import Colours from "./Colours";

export default class Cell extends React.Component {
    render() {
        return (
            <button
                className={this.props.value === 0 ? "cell empty" : "cell"}
                ref={this.props.cellRef} row={this.props.row}
                col={this.props.col} onClick={()=>{ this.props.handleClick(this.props)}}
                onKeyDown={(event) => { this.props.handleKeyDown(event, this.props)}}
                style={{"backgroundColor": Colours[this.props.value]}}
            >
                {this.props.value === 0 ? "" : this.props.value}
            </button>
        );
    }
}
