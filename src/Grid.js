// @flow
import React from 'react';
import Row from "./Row";

import type {CellRef} from "./Cell";
import type {RowCells} from "./Row";
import type {ClickHandler, KeyHandler} from "./HandlerTypes";

const watchedKeys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
];

type GridProps = {
    numCells: number,
    numRows: number,
    onClick: ClickHandler,
    grid?: Array<RowCells>
};

export default class Grid extends React.Component <GridProps, {}> {
    cellRefs: Array<Array<CellRef>> // TODO: Refine this to use the right kind of reference.
    static defaultProps = {
        numRows: 8,
        numCells: 8,
        onClick: () => {}
    }

    constructor(props: GridProps) {
        super(props);
        this.rebuildRefs();
    }

    componentDidUpdate (prevProps: GridProps) {
        if (this.props.numRows !== prevProps.numRows || this.props.numCells !== prevProps.numCells) {
            this.rebuildRefs();
        }
    }

    rebuildRefs = () => {
        this.cellRefs = Array(this.props.numRows);

        for (let rowIndex = 0; rowIndex < this.props.numRows; rowIndex++) {
            this.cellRefs[rowIndex] = Array(this.props.numCells);
            for (let colIndex = 0; colIndex < this.props.numRows; colIndex++) {
                this.cellRefs[rowIndex][colIndex] = React.createRef<HTMLButtonElement>();
            }
        }
    }

    handleKeyDown: KeyHandler = (event: KeyboardEvent, targetRow: number, targetCol: number) => {
        if (watchedKeys.indexOf(event.key) !== -1) {
            // ArrowDown
            if (event.key === "ArrowDown") {
                targetRow = (targetRow + 1) % this.props.numRows;
            }

            // ArrowUp
            else if (event.key === "ArrowUp") {
                targetRow = (targetRow + ( this.props.numRows - 1)) % this.props.numRows;
            }

            // ArrowLeft
            else if (event.key === "ArrowLeft") {
                targetCol= (targetCol + ( this.props.numRows - 1)) % this.props.numCells;
            }

            // ArrowRight
            else if (event.key === "ArrowRight") {
                targetCol= (targetCol + 1) % this.props.numCells;
            }

            const toFocus = this.cellRefs[targetRow][targetCol];
            if (toFocus.current) {
                toFocus.current.focus();
            }
        }
    }

    renderRows() {
        const renderStack = [];

        for (let i = 0; i < this.props.numRows; i++) {
            renderStack.push(<Row 
                cellRefs={this.cellRefs[i]}
                numCells={this.props.numCells}
                cells={this.props.grid && this.props.grid[i]}
                onKeyDown={this.handleKeyDown}
                onClick={this.props.onClick}
                key={"row-" + i}
                row={i}
            />)
        }
        return renderStack;

    }
    render() {
        return (
            <div>
                {this.renderRows()}
          </div>
        );
    }
  }
