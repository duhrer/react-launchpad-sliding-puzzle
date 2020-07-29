import React from 'react';
import Grid from "./Grid"
import MidiPanel from './MidiPanel';

export default class Puzzle extends React.Component {
  constructor(props) {
      super(props);
      this.outputCallbacks = [];
      this.state = {
          grid: [
              [70,71,72,73,74,75,76,77],
              [60,61,62,63,64,65,66,67],
              [50,51,52,53,54,55,56,57],
              [40,41,42,43,44,45,46,47],
              [30,31,32,33,34,35,36,37],
              [20,21,22,23,24,25,26,27],
              [10,11,12,13,14,15,16,17],
              [ 0, 1, 2, 3, 4, 5, 6, 7]
          ]
      };

      this.registerOutput  = this.registerOutput.bind(this);
      this.handleMidiInput = this.handleMidiInput.bind(this);
      this.updateLaunchpad = this.updateLaunchpad.bind(this);
  }

  // We don't care about the previous values per se, but if we do in the future, the signature is:
  // componentDidUpdate(object prevProps, object prevState)
  componentDidUpdate() {
      this.updateLaunchpad();
  }

  // TODO: break this out into a "full" and "targeted" refresh, the latter should only update the row or column that has changed.
  updateLaunchpad() {
      if (this.outputCallbacks.length) {
          var messages = [];
          for (let row = 0; row < this.state.grid.length; row ++) {
              let rowCells = this.state.grid[row];
              for (let col = 0; col < rowCells.length; col++) {
                  let velocity = this.state.grid[row][col];
                  // Top row is 81-88, bottom is 11-18
                  let note = ((8-row) * 10) + col + 1;
                  messages.push({
                      type:     "noteOn",
                      channel:  0,
                      velocity: velocity,
                      note:     note
                  });
              }
          }

          for (let o = 0; o < this.outputCallbacks.length; o++) {
              let outputCallback = this.outputCallbacks[o];
              for (let m = 0; m < messages.length; m++) {
                  let message = messages[m];
                  outputCallback(message);
              }
          }
      }
  }

  registerOutput (outputCallback) {
      this.outputCallbacks.push(outputCallback);
  }

  handleMidiInput (midiMessage) {
      if (midiMessage.type === "noteOn") {
          let col = (midiMessage.note % 10) - 1;
          let row = 8 - Math.floor(midiMessage.note / 10);
          this.pushFromSquare(row, col);
      }
  }

  pushFromSquare(row, col) {
    let cellValue = this.state.grid[row][col];
    // No move is possible if this is the empty square (value of 0).
    if (cellValue === 0) {
        // TODO: Add a sound or flash when an invalid key is pressed.
    }
    else {
        var thisRow = this.state.grid[row];
        var emptyCellColumnIndex = thisRow.indexOf(0);
        
        // We can shift pieces horizontally if our row contains the empty square.
        if (emptyCellColumnIndex !== -1) {
            var rowShiftedState = this.state.grid.slice();

            // Rearrange the row so that the clicked position is now the empty square.            
            var shiftedRow = this.shiftArray(thisRow, emptyCellColumnIndex, col);
            rowShiftedState[row] = shiftedRow;

            this.setState({grid: rowShiftedState});
        }
        else {
            // Check to see if our column contains the empty sqare
            var thisColumn = this.extractCol(col);
            var emptyCellRowIndex = thisColumn.indexOf(0);
            
            // We can shift pieces vertically if our column contains the empty square.
            if (emptyCellRowIndex !== -1) {
                var columnShiftedState = this.state.grid.slice();
                
                // Rearrange the column so that the clicked position is now the empty square.
                var shiftedColumn = this.shiftArray(thisColumn, emptyCellRowIndex, row);

                for (var rowIndex = 0; rowIndex < this.state.grid.length; rowIndex++) {
                    columnShiftedState[rowIndex][col] = shiftedColumn[rowIndex];
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

  handleClick(cellProps) {
    this.pushFromSquare(cellProps.row, cellProps.col);
  }
  
  // TODO: Write tests with these and other patterns.
  // *1 2 3 4 0 5 6 7 8 => 0 1 2 3 4 5 6 7 8
  // 1 2 *3 4 0 5 6 7 8 => 1 2 0 3 4 5 6 7 8
  // 1 2 3 4 0 5 6 7 *8 => 1 2 3 4 5 6 7 8 0
  // 1 2 3 4 0 5 6 *7 8 => 1 2 3 4 5 6 7 0 8
  shiftArray(originalArray, emptySpaceIndex, clickedEntryIndex) {
      var shiftedArray = originalArray.slice();
      
      // Remove the previous empty space
      shiftedArray.splice(emptySpaceIndex, 1);

      // Add an empty space at the clicked position.
      shiftedArray.splice(clickedEntryIndex, 0, 0)
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
        <MidiPanel
            outputAccumulator={this.registerOutput}
            inputListeners={[this.handleMidiInput]}
            outputChangeListeners={[this.updateLaunchpad]}
        />
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