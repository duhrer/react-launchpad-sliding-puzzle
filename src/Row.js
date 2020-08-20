import React from 'react';
import Cell from "./Cell";

export default class Row extends React.Component {
    constructor (props) {
        super(props);
        this.row      = props.row ? parseInt(props.row, 10) : 0;
        this.offset   = this.row * 8;
        this.numCells = props.numCells || 8;
    }

    renderSquares() {
        var renderStack = [];
        for (var i = 0; i < this.numCells; i++) {
            renderStack.push(this.renderSquare(i));
        }
        return renderStack;
    }

    renderSquare(i) {
        return <Cell
            cellRef={this.props.cellRefs && this.props.cellRefs[i]}
            value={this.props.cells && this.props.cells[i]}
            onKeyDown={this.props.onKeyDown}
            onClick={this.props.onClick}
            key={"cell-" + (this.offset + i)} col={i} row={this.row}
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
