import React from 'react';
import Cell from "./Cell";

export default class Row extends React.Component {
<<<<<<< HEAD
    static defaultProps = {
        row: 0,
        numCells: 8
    }

    constructor (props) {
        super(props);
        this.offset   = this.row * 8;
=======
    constructor (props) {
        super(props);
        this.row      = props.row ? parseInt(props.row, 10) : 0;
        this.offset   = this.row * 8;
        this.numCells = props.numCells || 8;
>>>>>>> master
    }

    renderSquares() {
        var renderStack = [];
<<<<<<< HEAD
        for (var i = 0; i < this.props.numCells; i++) {
=======
        for (var i = 0; i < this.numCells; i++) {
>>>>>>> master
            renderStack.push(this.renderSquare(i));
        }
        return renderStack;
    }

    renderSquare(i) {
        return <Cell
<<<<<<< HEAD
            ref={this.props.cellRefs && this.props.cellRefs[i]}
            value={this.props.cells && this.props.cells[i]}
            onKeyDown={this.props.onKeyDown}
            onClick={this.props.onClick}
            key={"cell-" + (this.offset + i)} col={i} row={this.props.row}
=======
            cellRef={this.props.cellRefs && this.props.cellRefs[i]}
            value={this.props.cells && this.props.cells[i]}
            handleKeyDown={this.props.handleKeyDown}
            handleClick={this.props.handleClick}
            key={"cell-" + (this.offset + i)} col={i} row={this.row}
>>>>>>> master
        />;
    }

    render () {
        return (
            <div className="row">
                {this.renderSquares()}
            </div>            
        );
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> master
