// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';

import Grid from "./Grid";
import Cell from "./Cell";

configure({ adapter: new Adapter() });

test('Grid component should work without any optional properties.', () => {
    const wrapper = mount(<Grid/>);

    const props = wrapper.props();
    expect(props.numRows).toBe(8);
    expect(props.numCells).toBe(8);
});

test("We should be able to navigate using the arrow keys.", () => {
    const wrapper = mount(<Grid/>);

    const arrowKeys = [
        { key: "ArrowDown" },
        { key: "ArrowLeft" },
        { key: "ArrowUp" },
        { key: "ArrowRight"}
    ];

    for (let b = 0; b < arrowKeys.length; b++) {
        const keyToSimulate = arrowKeys[b];

        const firstCell = wrapper.find(Cell).first();
        firstCell.instance().focus();
    
        const initialFocus = document.activeElement;
    
        // Down Arrow
        const buttonElement = firstCell.find("button");
        buttonElement.simulate("keyDown", keyToSimulate);
        const secondFocus = document.activeElement;
    
        expect(secondFocus).not.toBe(initialFocus);
    }
});

test("Navigating continuously should wrap around for each arrow key.", () => {
    const wrapper = mount(<Grid/>);
    const numRows = wrapper.instance().props.numRows;
    
    const arrowKeys = [
        "ArrowDown",
        "ArrowLeft",
        "ArrowUp",
        "ArrowRight"];

    for (let b = 0; b < arrowKeys.length; b++) {
        const keyToSimulate = arrowKeys[b];
        const firstCell = wrapper.find(Cell).first();
        firstCell.instance().focus();
    
        let previousFocus = firstCell;
    
        for (let a = 0; a < numRows; a++) {
            previousFocus.simulate("keydown", { key: keyToSimulate});
            const currentFocus = wrapper.find("Cell:focus");
            expect(currentFocus).not.toBe(previousFocus);
            previousFocus = currentFocus;
        }
    
        const finalFocus = wrapper.find("Cell:focus");
        expect(finalFocus).toStrictEqual(firstCell);
    }
});

test("It should be possible to navigate in a loop by hitting each arrow key once.", () => {
    const wrapper = mount(<Grid/>);

    const firstCell = wrapper.find(Cell).first();
    firstCell.instance().focus();

    const keysToSimulate = ["ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight"];

    let previousFocus = firstCell;

    for (let a = 0; a < keysToSimulate.length; a++) {
        const keyToSimulate = keysToSimulate[a];
        previousFocus.simulate("keydown", { key: keyToSimulate});
        const currentFocus = wrapper.find("Cell:focus");
        expect(currentFocus).not.toBe(previousFocus);
        previousFocus = currentFocus;
    }

    const finalFocus = wrapper.find("Cell:focus");
    expect(finalFocus).toStrictEqual(firstCell);
});

test("It should be possible to navigate back and forth using opposing navigation keys.", () => {
    const wrapper = mount(<Grid/>);
    
    const keysPairsToSimulate = [
        [{ key: "ArrowDown"},   { key: "ArrowUp" }],
        [{ key: "ArrowUp" },    { key: "ArrowDown" }],
        [{ key: "ArrowRight" }, { key: "ArrowLeft" }],
        [{ key: "ArrowLeft" },  { key: "ArrowRight"}],
        [{ key: "Tab"}, { key: "Tab", shiftKey: true}],
        [{ key: "Tab", shiftKey: true}, { key: "Tab"}]
    ];
    
    for (let b = 0; b < keysPairsToSimulate.length; b++) {
        const firstCell = wrapper.find(Cell).first();
        firstCell.instance().focus();
        const keysToSimulate = keysPairsToSimulate[b];

        let previousFocus = firstCell;
        for (let a = 0; a < keysToSimulate.length; a++) {
            const keyToSimulate = keysToSimulate[a];
            // Send a single Down Arrow Key
            previousFocus.simulate("keydown", { key: keyToSimulate});
            const currentFocus = wrapper.find("Cell:focus");
            expect(currentFocus).not.toBe(previousFocus);
            previousFocus = currentFocus;
        }
    
        const finalFocus = wrapper.find("Cell:focus");
        expect(finalFocus).toStrictEqual(firstCell);
    }
});

// TODO: Tests just for tab navigation.