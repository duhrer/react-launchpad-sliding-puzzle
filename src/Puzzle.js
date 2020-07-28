import React from 'react';
import Grid from "./Grid"
import Symbiote from './Symbiote';

export default class Puzzle extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          grid: [
              [ 0, 1, 2, 3, 4, 5, 6, 7],
              [10,11,12,13,14,15,16,17],
              [20,21,22,23,24,25,26,27],
              [30,31,32,33,34,35,36,37],
              [40,41,42,43,44,45,46,47],
              [50,51,52,53,54,55,56,57],
              [60,61,62,63,64,65,66,67],
              [70,71,72,73,74,75,76,-1]
          ]
      };
  }

  handleClick(cellProps) {
      // No move is possible if this is the empty square (value of -1).
      if (cellProps.value === -1) {
          // TODO: Add a sound or flash when an invalid key is pressed.
      }
      else {
          var thisRow = this.state.grid[cellProps.row];
          var emptyCellColumnIndex = thisRow.indexOf(-1);
          
          // We can shift pieces horizontally if our row contains the empty square.
          if (emptyCellColumnIndex !== -1) {
              var rowShiftedState = this.state.grid.slice();

              // Rearrange the row so that the clicked position is now the empty square.            
              var shiftedRow = this.shiftArray(thisRow, emptyCellColumnIndex, cellProps.col);
              rowShiftedState[cellProps.row] = shiftedRow;

              this.setState({grid: rowShiftedState});
          }
          else {
              // Check to see if our column contains the empty sqare
              var thisColumn = this.extractCol(cellProps.col);
              var emptyCellRowIndex = thisColumn.indexOf(-1);
              
              // We can shift pieces vertically if our column contains the empty square.
              if (emptyCellRowIndex !== -1) {
                  var columnShiftedState = this.state.grid.slice();
                  
                  // Rearrange the column so that the clicked position is now the empty square.
                  var shiftedColumn = this.shiftArray(thisColumn, emptyCellRowIndex, cellProps.row);

                  for (var rowIndex = 0; rowIndex < this.state.grid.length; rowIndex++) {
                      columnShiftedState[rowIndex][cellProps.col] = shiftedColumn[rowIndex];
                  }

                  // Save the updated state            
                  this.setState({ grid: columnShiftedState})
              }            
              else {
                  // TODO: Add a sound or flash when an invalid key is pressed.
              }
          }
      }
  }
  
  // TODO: Write tests with these and other patterns.
  // *1 2 3 4 -1 5 6 7 8 => -1 1 2 3 4 5 6 7 8
  // 1 2 *3 4 -1 5 6 7 8 => 1 2 -1 3 4 5 6 7 8
  // 1 2 3 4 -1 5 6 7 *8 => 1 2 3 4 5 6 7 8 -1
  // 1 2 3 4 -1 5 6 *7 8 => 1 2 3 4 5 6 7 -1 8
  shiftArray(originalArray, emptySpaceIndex, clickedEntryIndex) {
      var shiftedArray = originalArray.slice();
      
      // Remove the previous empty space
      shiftedArray.splice(emptySpaceIndex, 1);

      // Add an empty space at the clicked position.
      shiftedArray.splice(clickedEntryIndex, 0, -1)
      return shiftedArray;
  }

  extractCol(colIndex) {
      var columnCells = [];
      for (var rowIndex = 0; rowIndex < this.state.grid.length; rowIndex++) {
          columnCells.push(this.state.grid[rowIndex][colIndex]);
      }
      return columnCells;
  }

  render() {
      return (
      <div className="puzzle">
        <Instructions/>
        <div className="grid">
          <Grid grid={this.state.grid}
              handleClick={(i) => this.handleClick(i)}
          />
        </div>
        <Symbiote/>
      </div>
    );
  }
}

function Instructions (props) {
    return(
      <div className="instructions">
        <p>This is a simple sliding puzzle.  You can use tabs or arrow keys to navigate.</p>
        <p>Click (or hit enter) on any square that shares a row with the empty square to "slide" one or more squares in its direction.</p>
      </div>
    );
}