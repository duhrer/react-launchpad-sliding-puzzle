// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';

import Puzzle from "./Puzzle";
import type {PuzzleState} from "./Puzzle";

configure({ adapter: new Adapter() });

// The initial puzzle state is as follows:
const initialGrid = [
    [70, 71, 72, 73, 74, 75, 76, 77],
    [60, 61, 62, 63, 64, 65, 66, 67],
    [50, 51, 52, 53, 54, 55, 56, 57],
    [40, 41, 42, 43, 44, 45, 46, 47],
    [30, 31, 32, 33, 34, 35, 36, 37],
    [20, 21, 22, 23, 24, 25, 26, 27],
    [10, 11, 12, 13, 14, 15, 16, 17],
    [0, 1, 2, 3, 4, 5, 6, 7]
];

// Clicking or pressing enter on any cell that shares a row or column with the empty cell (value 0 above) will change the state.

test('Puzzle component should work without any optional properties.', () => {
    const wrapper = mount(<Puzzle/>);

    const state: PuzzleState = wrapper.state();
    expect(state.grid).toStrictEqual(initialGrid);
});

test("Pushing from the empty square should not change the state.", () => {
    const wrapper = mount(<Puzzle/>);
    const puzzle: Puzzle = wrapper.instance();
    puzzle.pushFromSquare(7,0);
    expect(puzzle.state.grid).toStrictEqual(initialGrid);
});

test("Pushing from a square that does not share a row or column with the empty square should not change the state.", () => {
    const wrapper = mount(<Puzzle/>);
    const puzzle: Puzzle = wrapper.instance();
    puzzle.pushFromSquare(0,5);
    expect(puzzle.state.grid).toStrictEqual(initialGrid);
});

test("Pushing from a square that shares a row with the empty square should change the state.", () => {
    const wrapper = mount(<Puzzle/>);
    const puzzle: Puzzle = wrapper.instance();
    puzzle.pushFromSquare(7,5);
    expect(puzzle.state.grid).not.toStrictEqual(initialGrid);
});

test("Pushing from a square that shares a column with the empty square should change the state.", () => {
    const wrapper = mount(<Puzzle/>);
    const puzzle: Puzzle = wrapper.instance();
    puzzle.pushFromSquare(5,0);
    expect(puzzle.state.grid).not.toStrictEqual(initialGrid);
});