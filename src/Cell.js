import React from 'react';

export default class Cell extends React.Component {
    render() {
        return (
            <button className={this.props.value === -1 ? "cell empty" : "cell"} ref={this.props.cellRef} row={this.props.row} col={this.props.col} onClick={()=>{ this.props.handleClick(this.props)}} onKeyDown={(event) => { this.props.handleKeyDown(event, this.props)}}>
                {this.props.value === -1 ? "" : this.props.value}
            </button>
        );
    }
}
