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

export type OptionDef = {
    value: string,
    label?: string
}

type MultiSelectProps = {
    title: string,
    selectedValues?: Array<string>,
    stateChangeCallbacks?: Array<(selectedItems: Array<string>) => void>,
    defaultValue?: string,
    options: { [string]: OptionDef }
}

type MultiSelectState = {
    selectedValues: Array<string>
};

export default class MultiSelect extends React.Component<MultiSelectProps, MultiSelectState> {
    static defaultProps = {
        title: "",
        options: {}
    }

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

        if (this.props.stateChangeCallbacks) {
            this.props.stateChangeCallbacks.forEach((callback: (selectedValues:Array<string>) => void) => {
                callback(selectedValues);
            });
        }
    }

    render() {
        const optionsMarkup = [];
        const optionsKeys = Object.keys(this.props.options);
        for (let a = 0; a < optionsKeys.length; a++) {
            const key = optionsKeys[a];
            const optionDef: OptionDef = this.props.options[key];
            const optionLabel: string = (optionDef.label !== undefined && optionDef.label.length > 0) ? optionDef.label : optionDef.value;
            optionsMarkup.push(<MultiSelectOption value={optionDef.value} key={"option-" + key} label={optionLabel}/>);
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