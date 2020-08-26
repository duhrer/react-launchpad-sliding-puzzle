import React from 'react';
import Row from "./Row";

const watchedKeys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
];

export default class Grid extends React.Component {
<<<<<<< HEAD
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
=======
    constructor(props) {
        super(props);

        this.numRows  = props.numRows  || 8;
        this.numCells = props.numCells || 8;

        this.cellRefs = Array(this.numRows);

        for (var rowIndex = 0; rowIndex < this.numRows; rowIndex++) {
            this.cellRefs[rowIndex] = Array(this.numCells);
            for (var colIndex = 0; colIndex < this.numRows; colIndex++) {
>>>>>>> master
                this.cellRefs[rowIndex][colIndex] = React.createRef();
            }
        }
    }

<<<<<<< HEAD
    handleKeyDown = (event, targetRow, targetCol) => {
        if (watchedKeys.indexOf(event.key) !== -1) {
            // ArrowDown
            if (event.key === "ArrowDown") {
                targetRow = (targetRow + 1) % this.props.numRows;
=======
    handleKeyDown(gridComponent, event, cellProps) {
        if (watchedKeys.indexOf(event.key) !== -1) {
            var targetRow = cellProps.row;
            var targetCol = cellProps.col;
            
            // ArrowDown
            if (event.key === "ArrowDown") {
                targetRow = (targetRow + 1) % this.numRows;
>>>>>>> master
            }

            // ArrowUp
            else if (event.key === "ArrowUp") {
<<<<<<< HEAD
                targetRow = (targetRow + ( this.props.numRows - 1)) % this.props.numRows;
=======
                targetRow = (targetRow + ( this.numRows - 1)) % this.numRows;
>>>>>>> master
            }

            // ArrowLeft
            else if (event.key === "ArrowLeft") {
<<<<<<< HEAD
                targetCol= (targetCol + ( this.props.numRows - 1)) % this.props.numCells;
=======
                targetCol= (targetCol + ( this.numRows - 1)) % this.numCells;
>>>>>>> master
            }

            // ArrowRight
            else if (event.key === "ArrowRight") {
<<<<<<< HEAD
                targetCol= (targetCol + 1) % this.props.numCells;
            }

            var toFocus = this.cellRefs[targetRow][targetCol];
=======
                targetCol= (targetCol + 1) % this.numCells;
            }

            var toFocus = gridComponent.cellRefs[targetRow][targetCol];
>>>>>>> master
            toFocus.current.focus();
        }
    }

    renderRows() {
        var renderStack = [];

<<<<<<< HEAD
        for (var i = 0; i < this.props.numRows; i++) {
            renderStack.push(<Row 
                cellRefs={this.cellRefs[i]}
                numCells={this.props.numCells}
                cells={this.props.grid && this.props.grid[i]}
                onKeyDown={this.handleKeyDown}
                onClick={this.props.onClick}
                key={"row-" + i}
                row={i}
=======
        for (var i = 0; i < this.numRows; i++) {
            renderStack.push(<Row 
                cellRefs={this.cellRefs[i]}
                numCells={this.numCells}
                cells={this.props.grid && this.props.grid[i]}
                handleKeyDown= {(event, cellProps) => {this.handleKeyDown(this,event, cellProps)}}
                handleClick={this.props.handleClick} key={"row-" + i} row={i}
>>>>>>> master
            />)
        }
        return renderStack;

    }
<<<<<<< HEAD
=======
    // TODO: Iterate rather than spitting out duplicate lines of HTML
>>>>>>> master
    render() {
        return (
            <div>
                {this.renderRows()}
          </div>
        );
    }
<<<<<<< HEAD
  }
=======
  }
>>>>>>> master
