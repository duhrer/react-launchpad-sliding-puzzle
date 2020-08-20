import React from 'react';
import Row from "./Row";

const watchedKeys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
];

export default class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.numRows  = props.numRows  || 8;
        this.numCells = props.numCells || 8;

        this.cellRefs = Array(this.numRows);

        for (var rowIndex = 0; rowIndex < this.numRows; rowIndex++) {
            this.cellRefs[rowIndex] = Array(this.numCells);
            for (var colIndex = 0; colIndex < this.numRows; colIndex++) {
                this.cellRefs[rowIndex][colIndex] = React.createRef();
            }
        }
    }

    handleKeyDown = (event, targetRow, targetCol) => {
        if (watchedKeys.indexOf(event.key) !== -1) {
            // ArrowDown
            if (event.key === "ArrowDown") {
                targetRow = (targetRow + 1) % this.numRows;
            }

            // ArrowUp
            else if (event.key === "ArrowUp") {
                targetRow = (targetRow + ( this.numRows - 1)) % this.numRows;
            }

            // ArrowLeft
            else if (event.key === "ArrowLeft") {
                targetCol= (targetCol + ( this.numRows - 1)) % this.numCells;
            }

            // ArrowRight
            else if (event.key === "ArrowRight") {
                targetCol= (targetCol + 1) % this.numCells;
            }

            var toFocus = this.cellRefs[targetRow][targetCol];
            toFocus.current.focus();
        }
    }

    renderRows() {
        var renderStack = [];

        for (var i = 0; i < this.numRows; i++) {
            renderStack.push(<Row 
                cellRefs={this.cellRefs[i]}
                numCells={this.numCells}
                cells={this.props.grid && this.props.grid[i]}
                onKeyDown={this.handleKeyDown}
                onClick={this.props.onClick}
                key={"row-" + i}
                row={i}
            />)
        }
        return renderStack;

    }
    // TODO: Iterate rather than spitting out duplicate lines of HTML
    render() {
        return (
            <div>
                {this.renderRows()}
          </div>
        );
    }
  }
