import React from 'react';

class MultiSelectOption extends React.Component {
    render() {
        return(
            <option value={this.props.value}>{this.props.label}</option>
        );
    }
}

export default class MultiSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            selectedValues: props.selectedValues || []
        }

        this.handleChange = this.handleChange.bind(this);
    }

    // Apparently react can't track the selected attribute of individual options, there's an explicit warning against it.
    // It seems like you're supposed to listen to changes on select elements instead.
    handleChange(event) {
        let selectedValueMap = {};
        for (let i = 0; i < event.target.options.length; i++) {
            let singleOption = event.target.options[i];
            if (singleOption.selected) {
                selectedValueMap[singleOption.value] = true;
            }
        }

        let selectedValues = Object.keys(selectedValueMap);
        this.setState({
            selectedValues: selectedValues
        });

        if (this.props.stateChangeCallbacks) {
            this.props.stateChangeCallbacks.forEach((callback) => {
                callback(selectedValues);
            });
        }
    }

    render() {
        const optionsMarkup = [];
        const optionsKeys = Object.keys(this.props.options);
        for (let a = 0; a < optionsKeys.length; a++) {
            let key = optionsKeys[a];
            let optionDef = this.props.options[key];
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