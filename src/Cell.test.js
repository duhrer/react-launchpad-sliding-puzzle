// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';

import Cell from "./Cell";

configure({ adapter: new Adapter() });

test('Cell component can work without any optional properties.', () => {
    const wrapper = mount(<Cell/>);

    const props = wrapper.props();
    expect(props.row).toBe(0);
    expect(props.col).toBe(0);

    expect(wrapper.text()).toBe("");
});


test('Cell component can accept non-function properties.', () => {
    const wrapper = mount(<Cell row={1} col={2} value={3}/>);

    const props = wrapper.props();
    expect(props.row).toBe(1);
    expect(props.col).toBe(2);

    expect(wrapper.text()).toBe("3");
});

test("Cell component can accept function properties.", () => {
    const clickHandler = jest.fn();
    const keyHandler   = jest.fn();
    const wrapper = mount(<Cell onClick={clickHandler} onKeyDown={keyHandler}/>);

    wrapper.simulate('click');
    expect(clickHandler.mock.calls.length).toBe(1);

    wrapper.simulate("keydown");
    expect(keyHandler.mock.calls.length).toBe(1);
});

test("Calling the focus method should result in focus moving to the element.", () => {
    const wrapper = mount(<Cell/>);

    const buttonElement = wrapper.find("button");
    expect(document.activeElement).not.toBe(buttonElement.getDOMNode());

    wrapper.instance().focus();

    expect(document.activeElement).toBe(buttonElement.getDOMNode());
});
