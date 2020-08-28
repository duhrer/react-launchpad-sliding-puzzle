// @flow
import React from 'react';
import Cell from "./Cell";

import type {ClickHandler, KeyHandler} from "./HandlerTypes";

export type RowCells = Array<number>;

type RowProps = {
    row: number,
    numCells: number,
    cells: RowCells,
    cellRefs: Array<any>, // TODO: Figure out what to use instead of "any"
    onKeyDown: KeyHandler,
    onClick: ClickHandler
}

export default class Row extends React.Component<RowProps, {}> {
    offset: number;
    onKeyDown: () => void; // TODO: Figure out an existing type or write our own.
    onClick: () => void; // TODO: Figure out an existing type or write our own.å

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
