// @flow
import React from 'react';
import Cell from "./Cell";

type RowProps = {
    row: number,
    numCells: number,
    cells: Array<number>, // TODO: death to "any"
    cellRefs: Array<any>,
    onKeyDown: Function,
    onClick: Function
}

export default class Row extends React.Component<RowProps, {}> {
    offset: number;

    static defaultProps = {
        row: 0,
        numCells: 8,
        cells: [],
        cellRefs: [],
        onKeyDown: () => {},
        onClick: () => {}
    }

    constructor (props: RowProps) {
        super(props);
        this.offset   = this.props.row * 8;
    }

    renderSquares() {
        const renderStack = [];
        for (let i = 0; i < this.props.numCells; i++) {
            renderStack.push(this.renderSquare(i));
        }
        return renderStack;
    }

    renderSquare(i: number) {
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
