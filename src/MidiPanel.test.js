// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';

import MidiPanel from "./MidiPanel";

configure({ adapter: new Adapter() });

test("The MidiPanel should render without errors.", () => {
    const wrapper = mount(<MidiPanel/>);
    const midiPanel: MidiPanel = wrapper.instance();
    expect(() => midiPanel.render()).not.toThrow();
});