// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';

import MultiSelect from "./MultiSelect";

configure({ adapter: new Adapter() });

test("The MultiSelect component should render without errors.", () => {
    const wrapper = mount(<MultiSelect/>);
    const multiSelect: MultiSelect = wrapper.instance();
    expect(() => multiSelect.render()).not.toThrow();
});


test("The title should be reflected in the final markup.", () => {
    const wrapper = mount(<
        MultiSelect
        title="Sample MultiSelect"
    />);

    const titleElement = wrapper.find("h2");
    const titleText = titleElement.getDOMNode().textContent;
    expect(titleText).toBe("Sample MultiSelect");
});

test("We should be able to use option defs without labels.", () => {
    const optionDefs = {
        "red": {
            "value": "Red"
        }
    };

    const wrapper = mount(<
        MultiSelect
        options={optionDefs}
    />);

    const optionElement = wrapper.find("option");
    const domNode: HTMLElement = optionElement.getDOMNode();

    const optionText = domNode.text;
    expect(optionText).toBe("Red");

    const optionValue = domNode.attributes["value"].textContent;
    expect(optionValue).toBe("Red");
});


test("We should be able to use option defs with labels.", () => {
    const optionDefs = {
        "red": {
            "label": "Red",
            "value": "#ff0000"
        }
    };

    const wrapper = mount(<
        MultiSelect
        options={optionDefs}
    />);

    const optionElement = wrapper.find("option");
    const domNode: HTMLElement = optionElement.getDOMNode();

    const optionText = domNode.text;
    expect(optionText).toBe("Red");

    const optionValue = domNode.attributes["value"].textContent;
    expect(optionValue).toBe("#ff0000");
});

// TODO: Get this working, it may be that there is an actual bug that the test is highlighting.
// test("We should be able pass selected values.", () => {
//     const optionDefs = {
//         "red": {
//             "value": "Red"
//         },
//         "green": {
//             "value": "Green"
//         },
//         "blue": {
//             "value": "Blue"
//         }
//     };
//     const selectedValues   = ["Green", "Blue"];
//     const wrapper = mount(<
//         MultiSelect
//         options={optionDefs}
//         selectedValues={selectedValues}
//     />);
//     const selectElement = wrapper.find("select");
//     const selectNode = selectElement.getDOMNode();
//     const selectedOptions: HTMLOptionsCollection = selectNode.selectedOptions;
//     expect(selectedOptions.length).toBe(2);
//     for (let a = 0; a < selectedOptions.length; a++) {
//         const selectedOption = selectedOptions.item(a);
//         const optionText = selectedOption.text;
//         expect(selectedValues.indexOf(optionText)).not.toBe(-1);
//     }
// });
