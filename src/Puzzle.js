// @flow
import React from 'react';
import Grid from "./Grid"
import MidiPanel from './MidiPanel';
import type {MidiMessage} from "./MidiPanel";

type PuzzleState = {
    grid: Array<Array<number>>
};

type PuzzleProps = {};

type OutputCallback = (message: MidiMessage, filter: RegExp, invertMatches?: boolean) => void;

type CellDef = {
    row: number,
    col: number,
    value: number
};

export default class Puzzle extends React.Component<PuzzleProps, PuzzleState> {
    outputCallbacks: Array<OutputCallback>;

    constructor(props: PuzzleProps) {
        super(props);
        this.outputCallbacks = [];

        // TODO: Make an image pattern instead of simple numeric values. (Do not display the number in the cell.)
        this.state = {
            grid: [
                [70, 71, 72, 73, 74, 75, 76, 77],
                [60, 61, 62, 63, 64, 65, 66, 67],
                [50, 51, 52, 53, 54, 55, 56, 57],
                [40, 41, 42, 43, 44, 45, 46, 47],
                [30, 31, 32, 33, 34, 35, 36, 37],
                [20, 21, 22, 23, 24, 25, 26, 27],
                [10, 11, 12, 13, 14, 15, 16, 17],
                [0, 1, 2, 3, 4, 5, 6, 7]
            ]
        };
    }

    // We don't care about the previous values per se, but if we do in the future, the signature is:
    // componentDidUpdate(object prevProps, object prevState)
    componentDidUpdate(prevProps: PuzzleProps, prevState: PuzzleState) {
        this.updateLaunchpad();
        this.updateOtherDevices(prevState);
    }

    updateLaunchpad = () => {
        if (this.outputCallbacks && this.outputCallbacks.length) {
            const launchpadMessages: Array<MidiMessage> = [];
            for (let row = 0; row < this.state.grid.length; row++) {
                const rowCells = this.state.grid[row];
                for (let col = 0; col < rowCells.length; col++) {
                    const velocity = this.state.grid[row][col];
                    // In "programmer" mode on the Launchpad, the top row is 81-88, bottom is 11-18
                    const note: number = ((8 - row) * 10) + col + 1;
                    const noteOnMessage: MidiMessage = {
                        type: "noteOn",
                        channel: 0,
                        velocity: velocity,
                        note: note
                    };
                    launchpadMessages.push(noteOnMessage);
                }
            }

            for (let o = 0; o < this.outputCallbacks.length; o++) {
                const outputCallback: OutputCallback = this.outputCallbacks[o];
                for (let m = 0; m < launchpadMessages.length; m++) {
                    const onMessage: MidiMessage = launchpadMessages[m];

                    // Update any connected and selected launchpads.
                    outputCallback(onMessage, /Launchpad/);
                }
            }
        }
    }

    // Play the note on anything else with a timed release.
    updateOtherDevices = (prevState: PuzzleState) => {
        if (this.outputCallbacks && this.outputCallbacks.length) {
            const updatedCells: Array<CellDef> = [];
            for (let row = 0; row < this.state.grid.length; row++) {
                const rowCells: Array<number> = this.state.grid[row];
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

            const inverted: boolean = updatedCells[0].value === 0;
            const betweenNotes = 500 / (updatedCells.length - 1);
            const noteLength = betweenNotes * 0.8;
            for (let m = 0; m < updatedCells.length; m++) {
                const updatedCell: CellDef = inverted ? updatedCells[(updatedCells.length - 1) - m]:  updatedCells[m];
                if (updatedCell.value !== 0) {
                    // We derive the note from the row and column, but use different logic than the launchpad to avoid playing far too low or high.
                    const note = 30 + ((8 - updatedCell.row) * 8) + updatedCell.col;
                    const onMessage: MidiMessage = {
                        type: "noteOn",
                        channel: 0,
                        velocity: 64,
                        note: note
                    };
                    const offMessage: MidiMessage = {
                        type: "noteOff",
                        channel: 0,
                        velocity: 0,
                        note: note
                    };
                    const timeOn: number = m * betweenNotes;
                    const timeOff: number = timeOn + noteLength;
                    for (let o: number = 0; o < this.outputCallbacks.length; o++) {
                        const outputCallback: OutputCallback = this.outputCallbacks[o];

                        // TODO: replace with bergson
                        setTimeout(
                            () => { outputCallback(onMessage, /Launchpad/, true); },
                            timeOn
                        );
                        setTimeout(
                            () => { outputCallback(offMessage, /Launchpad/, true); },
                            timeOff
                        );
                    }
                }
            }
        }
    }

    registerOutput = (outputCallback: OutputCallback) => {
        this.outputCallbacks.push(outputCallback);
    }

    handleMidiInput = (midiMessage: MidiMessage) => {
        if (midiMessage.type === "noteOn") {
            const note = midiMessage.note || 0;
            const col = (note % 10) - 1;
            const row = 8 - Math.floor(note / 10);
            this.pushFromSquare(row, col);
        }
    }

    pushFromSquare(row: number, col: number) {
        // We use the function version of `setState` so that we can safely handle asynchronous changes.
        // https://reactjs.org/docs/react-component.html#setstate
        this.setState((currentState, props) => {
            const cellValue = currentState.grid[row][col];
            // No move is possible if this is the empty square (value of 0).
            if (cellValue === 0) {
                // TODO: Add a sound or flash when an invalid key is pressed.
            }
            else {
                const thisRow = currentState.grid[row];
                const emptyCellColumnIndex = thisRow.indexOf(0);

                // We can shift pieces horizontally if our row contains the empty square.
                if (emptyCellColumnIndex !== -1) {
                    const rowShiftedState = currentState.grid.slice();

                    // Rearrange the row so that the clicked position is now the empty square.            
                    const shiftedRow = this.shiftArray(thisRow, emptyCellColumnIndex, col);
                    rowShiftedState[row] = shiftedRow;

                    return { grid: rowShiftedState };
                }
                else {
                    // Check to see if our column contains the empty sqare
                    const thisColumn = this.extractCol(currentState, col);
                    const emptyCellRowIndex = thisColumn.indexOf(0);

                    // We can shift pieces vertically if our column contains the empty square.
                    if (emptyCellRowIndex !== -1) {
                        const columnShiftedState = JSON.parse(JSON.stringify(currentState.grid));

                        // Rearrange the column so that the clicked position is now the empty square.
                        const shiftedColumn = this.shiftArray(thisColumn, emptyCellRowIndex, row);

                        for (let rowIndex = 0; rowIndex < currentState.grid.length; rowIndex++) {
                            columnShiftedState[rowIndex][col] = shiftedColumn[rowIndex];
                        }

                        return { grid: columnShiftedState };
                    }
                    else {
                        // TODO: Add a sound or flash when an invalid key is pressed.
                    }
                }
            }

            // If  we have not previously returned a state change, return `null` to indicate that no change is required.
            // https://reactjs.org/blog/2017/09/26/react-v16.0.html#breaking-changes (see the "setState" changes)
            return null;
        });
    }

    handleClick = (row: number, col: number) => {
        this.pushFromSquare(row, col);
    }

    // TODO: Write tests with these and other patterns.
    // *1 2 3 4 0 5 6 7 8 => 0 1 2 3 4 5 6 7 8
    // 1 2 *3 4 0 5 6 7 8 => 1 2 0 3 4 5 6 7 8
    // 1 2 3 4 0 5 6 7 *8 => 1 2 3 4 5 6 7 8 0
    // 1 2 3 4 0 5 6 *7 8 => 1 2 3 4 5 6 7 0 8
    shiftArray(originalArray: Array<any>, emptySpaceIndex: number, clickedEntryIndex: number) {
        const shiftedArray: Array<any> = originalArray.slice();

        // Remove the previous empty space
        shiftedArray.splice(emptySpaceIndex, 1);

        // Add an empty space at the clicked position.
        shiftedArray.splice(clickedEntryIndex, 0, 0)
        return shiftedArray;
    }

    extractCol(currentState: PuzzleState, colIndex: number) {
        const columnCells = [];
        for (let rowIndex = 0; rowIndex < currentState.grid.length; rowIndex++) {
            columnCells.push(currentState.grid[rowIndex][colIndex]);
        }
        return columnCells;
    }

    render() {
        return (
            <div className="puzzle">
                <Instructions />
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

function Instructions() {
    return (
        <div className="instructions">
            <p>This is a simple sliding puzzle.  You can use tabs or arrow keys to navigate.</p>
            <p>Click (or hit enter) on any square that shares a row with the empty square to "slide" one or more squares in its direction.</p>
        </div>
    );
}
