import React from 'react';
import Cell from "./Cell";

export default class Row extends React.Component {
    static defaultProps = {
        row: 0,
        numCells: 8
    }

    constructor (props) {
        super(props);
        this.offset   = this.row * 8;
    }

    renderSquares() {
        var renderStack = [];
        for (var i = 0; i < this.props.numCells; i++) {
            renderStack.push(this.renderSquare(i));
        }
        return renderStack;
    }

    renderSquare(i) {
        return <Cell
            ref={this.props.cellRefs && this.props.cellRefs[i]}
            value={this.props.cells && this.props.cells[i]}
            onKeyDown={this.props.onKeyDown}
            onClick={this.props.onClick}
            key={"cell-" + (this.offset + i)} col={i} row={this.props.row}
        />;
    }

    render () {
        return (
            <div className="row">
                {this.renderSquares()}
            </div>            
        );
    }
}
