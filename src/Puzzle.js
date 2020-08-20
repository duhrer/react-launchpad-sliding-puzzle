    import React from 'react';
    import Grid from "./Grid"
    import MidiPanel from './MidiPanel';

    export default class Puzzle extends React.Component {
    constructor(props) {
        super(props);
        this.outputCallbacks = [];

        // TODO: Make an image pattern instead of simple numeric values. (Do not display the number in the cell.)
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

        this.registerOutput     = this.registerOutput.bind(this);
        this.handleMidiInput    = this.handleMidiInput.bind(this);
        this.updateLaunchpad    = this.updateLaunchpad.bind(this);
        this.updateOtherDevices = this.updateOtherDevices.bind(this);
    }

    // We don't care about the previous values per se, but if we do in the future, the signature is:
    // componentDidUpdate(object prevProps, object prevState)
    componentDidUpdate(prevProps, prevState) {
        this.updateLaunchpad();
        this.updateOtherDevices(prevState);
    }

    updateLaunchpad() {
        if (this.outputCallbacks && this.outputCallbacks.length) {
            var launchpadMessages = [];
            for (let row = 0; row < this.state.grid.length; row ++) {
                let rowCells = this.state.grid[row];
                for (let col = 0; col < rowCells.length; col++) {
                    let velocity = this.state.grid[row][col];
                    // In "programmer" mode on the Launchpad, the top row is 81-88, bottom is 11-18
                    let note = ((8-row) * 10) + col + 1;
                    let noteOnMessage = {
                        type:     "noteOn",
                        channel:  0,
                        velocity: velocity,
                        note:     note
                    };
                    launchpadMessages.push(noteOnMessage);
                }
            }

            for (let o = 0; o < this.outputCallbacks.length; o++) {
                let outputCallback = this.outputCallbacks[o];
                for (let m = 0; m < launchpadMessages.length; m++) {
                    let onMessage = launchpadMessages[m];

                    // Update any connected and selected launchpads.
                    outputCallback(onMessage, /Launchpad/);
                }
            }
        }
    }

    // Play the note on anything else with a timed release.
    updateOtherDevices(prevState) {
        if (this.outputCallbacks && this.outputCallbacks.length) {
            var updatedCells = [];
            for (let row = 0; row < this.state.grid.length; row ++) {
                let rowCells = this.state.grid[row];
                for (let col = 0; col < rowCells.length; col++) {
                    if (prevState.grid[row][col] !== rowCells[col]) {
                        updatedCells.push({
                            row: row,
                            col: col,
                            value: rowCells[col]
                        });
                    }
                }
            }
            
            let inverted = updatedCells[0].value === 0;
            let betweenNotes = 500 / (updatedCells.length -1);
            let noteLength = betweenNotes * 0.8;
            for (let m = 0; m < updatedCells.length; m++) {
                let updatedCell = inverted ? updatedCells[ (updatedCells.length - 1) - m] : updatedCells[m];
                if (updatedCell.value !== 0) {
                    // We derive the note from the row and column, but use different logic than the launchpad to avoid playing far too low or high.
                    let note = 30 + ((8 - updatedCell.row) * 8) + updatedCell.col;
                    let onMessage = {
                        type: "noteOn",
                        channel: 0,
                        velocity: 64,
                        note: note
                    };
                    let offMessage = {
                        type: "noteOff",
                        channel: 0,
                        velocity: 0,
                        note: note
                    };
                    let timeOn = m * betweenNotes;
                    let timeOff = timeOn + noteLength;
                    for (let o = 0; o < this.outputCallbacks.length; o++) {
                        let outputCallback = this.outputCallbacks[o];
                        
                        // TODO: replace with bergson
                        setTimeout(
                            () => { outputCallback(onMessage, /Launchpad/, true); },
                            timeOn
                            );
                            setTimeout(
                            ()=>{ outputCallback(offMessage, /Launchpad/, true); },
                            timeOff
                        );
                    }
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
                    var columnShiftedState = JSON.parse(JSON.stringify(this.state.grid));
                    
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

    handleClick = (row, col) => {
        this.pushFromSquare(row, col);
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
                onClick={this.handleClick}
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
