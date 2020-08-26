import React from 'react';
import Row from "./Row";

const watchedKeys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
];

export default class Grid extends React.Component {
    static defaultProps = {
        numRows: 8,
        numCells: 8
    }

    constructor(props) {
        super(props);
        this.rebuildRefs();
    }

    componentDidUpdate (prevProps) {
        if (this.props.numRows !== prevProps.numRows || this.props.numCells !== prevProps.numCells) {
            this.rebuildRefs();
        }
    }

    rebuildRefs = () => {
        this.cellRefs = Array(this.props.numRows);

        for (var rowIndex = 0; rowIndex < this.props.numRows; rowIndex++) {
            this.cellRefs[rowIndex] = Array(this.props.numCells);
            for (var colIndex = 0; colIndex < this.props.numRows; colIndex++) {
                this.cellRefs[rowIndex][colIndex] = React.createRef();
            }
        }
    }

    handleKeyDown = (event, targetRow, targetCol) => {
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

            var toFocus = this.cellRefs[targetRow][targetCol];
            toFocus.current.focus();
        }
    }

    renderRows() {
        var renderStack = [];

        for (var i = 0; i < this.props.numRows; i++) {
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
