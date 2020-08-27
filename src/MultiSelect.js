// @flow
import React from 'react';

type MultiSelectOptionProps = {
    label: string,
    value: string
};

class MultiSelectOption extends React.Component<MultiSelectOptionProps, {}> {
    render() {
        return(
            <option value={this.props.value}>{this.props.label}</option>
        );
    }
}

type OptionDef = {
    value: string,
    label?: string
}

type MultiSelectProps = {
    title: string,
    selectedValues?: Array<Object>,
    stateChangeCallbacks?: Array<Function>,
    defaultValue?: any,
    options: { [string]: OptionDef }
}

type MultiSelectState = {
    selectedValues: Array<Object>
};

export default class MultiSelect extends React.Component<MultiSelectProps, MultiSelectState> {
    constructor(props: MultiSelectProps) {
        super(props);
        this.state = {
            selectedValues: props.selectedValues || []
        }
    }

    // Apparently react can't track the selected attribute of individual options, there's an explicit warning against it.
    // It seems like you're supposed to listen to changes on select elements instead.
    handleChange = (event: SyntheticEvent<HTMLSelectElement>) => {
        const selectedValueMap = { };
        for (let i = 0; i < event.currentTarget.options.length; i++) {
            const singleOption: HTMLOptionElement = event.currentTarget.options[i];
            if (singleOption.selected) {
                selectedValueMap[singleOption.value] = true;
            }
        }

        const selectedValues: Array<string> = Object.keys(selectedValueMap);
        this.setState({
            selectedValues: selectedValues
        });

        // TODO: Discuss why type coverage is not picked up based on the annotations above.
        if (this.props.stateChangeCallbacks) {
            this.props.stateChangeCallbacks.forEach((callback: Function) => {
                callback(selectedValues);
            });
        }
    }

    render() {
        const optionsMarkup = [];
        const optionsKeys = Object.keys(this.props.options);
        for (let a = 0; a < optionsKeys.length; a++) {
            const key = optionsKeys[a];
            const optionDef :OptionDef = this.props.options[key];
            optionsMarkup.push(<MultiSelectOption value={optionDef.value} key={"option-" + key} label={(optionDef.label || optionDef.value)}/>);
        }
        return (
            <div>
                <h2>{this.props.title}</h2>
                <select multiple={true} onChange={this.handleChange} defaultValue={this.props.defaultValue}>
                    {optionsMarkup}
                </select>
            </div>
        );
    }
}