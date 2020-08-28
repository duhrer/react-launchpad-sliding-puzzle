// @flow
import React from 'react';

import MultiSelect from './MultiSelect';

import type {OptionDef} from "./MultiSelect";

import flock from "./flock";
import fluid from "./fluid";

export type MidiMessage = {
    type: string,
    note?: number,
    velocity?: number,
    channel: number,
    number?: number,
    value?: number,
    pressure?: number,
    data?: Array<number>
};

type InputListener = (message: MidiMessage) => void;
type OutputChangeListener = () => void;

type MidiPanelProps = {
    numRows: number,
    numCells: number,
    inputListeners: Array<InputListener>,
    outputAccumulator?: (fn: Function) => void,
    outputChangeListeners?: Array<OutputChangeListener>
};

type MidiPanelState = {
    inputDefs: { [string]: OptionDef },
    selectedInputs: Array<string>,
    outputDefs: { [string]: OptionDef },
    selectedOutputs: Array<string>
};


export default class MidiPanel extends React.Component<MidiPanelProps, MidiPanelState> {
    inputListeners: Array<InputListener>;
    outputChangeListeners: Array<OutputChangeListener>;
    outputPorts: { [string]: MIDIOutput };

    static defaultProps = {
        numRows: 8,
        numCells: 8
    }

    constructor(props: MidiPanelProps) {
        super(props);

        // Give the enclosing puzzle some way to listen to and react to MIDI inputs.
        // TODO: Remove this once we allow the Puzzle to send messages instead.
        this.inputListeners = props.inputListeners || [this.sendMidiMessage];
        this.outputChangeListeners = props.outputChangeListeners || [];

        // Provide some means of letting this component transmit MIDI messages received from "outside".
        if (props.outputAccumulator) {
            props.outputAccumulator(this.sendMidiMessage);
        }

        this.outputPorts = {};
        this.state={
            inputDefs: {},
            selectedInputs: [],
            outputDefs: {},
            selectedOutputs: []
        }

        // Read the initial set of ports and wire up our state change listener.
        if (navigator && navigator.requestMIDIAccess) {
            const midiAccessPromise = navigator.requestMIDIAccess({ sysex: true, software: true});
            midiAccessPromise.then( (access: MIDIAccess) => {
                const inputs: Iterator<MIDIInput> = access.inputs.values();
                const inputDefs = {};
                for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
                    inputDefs[input.value.id] = {
                        label: input.value.name,
                        value: input.value.id
                    };
    
                    // Wire up our common handler function to catch this input's MIDI messages.
                    input.value.onmidimessage = (data) => {
                        if (input.value) {
                            this.handleMidiInput(input.value.id, data);
                        }
                    };
                }
                this.setState({ inputDefs: inputDefs });
    
                const outputDefs = {};
                const outputs: Iterator<MIDIOutput> = access.outputs.values();
                for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
                    outputDefs[output.value.id] = {
                        label: output.value.name,
                        value: output.value.id
                    };
    
                    // Since we need to "send" to the objects, stash them for later use.
                    this.outputPorts[output.value.id] = output.value;
                };
    
                this.setState({ outputDefs: outputDefs });
    
                access.onstatechange = this.handleStateChange;
            });
        }
    }

    updateSelectedInputs = (selectedInputs: Array<string>) => {
        this.setState({selectedInputs: selectedInputs});
    }

    updateSelectedOutputs = (selectedOutputs:  Array<string>) => {
        this.setState({selectedOutputs: selectedOutputs});
        this.outputChangeListeners.forEach((callback: () => void) => {
            callback();
        });
    }

    handleStateChange = (event: MIDIConnectionEvent) =>{
        const changedPort = event.port;

        const defsToUpdate = changedPort.type === "input" ? "inputDefs":  "outputDefs";
        const updatedDefs: { [string]: OptionDef } = fluid.copy(this.state[defsToUpdate]);

        if (changedPort.state === "connected") {
            updatedDefs[changedPort.id] = {
                label: changedPort.name,
                value: changedPort.id
            }
        }
        else {
            delete updatedDefs[changedPort.id];
        }

        const updatedStateFragment: MidiPanelState = {};
        updatedStateFragment[defsToUpdate] = updatedDefs;
        this.setState(updatedStateFragment);
    }
    
    handleMidiInput (inputId: string, midiMessageEvent: MIDIMessageEvent) {
        // Confirm that this input is selected.
        const inputDef: OptionDef = this.state.inputDefs[inputId];
        const inputSelected: boolean = this.state.selectedInputs.indexOf(inputId) !== -1;
        if (inputDef && inputSelected && this.inputListeners.length) {
            const dataAsJson :MidiMessage = flock.midi.read(midiMessageEvent.data);
            this.inputListeners.forEach((inputListener: (message: MidiMessage) => void) => {
                inputListener(dataAsJson);
            });
        }
    }

    sendMidiMessage = (dataAsJson: MidiMessage, filterRegexp: RegExp, invert: Boolean) => {
        const outputIds = Object.keys(this.state.outputDefs);
        const data: Iterable<number> = flock.midi.write(dataAsJson);
        outputIds.forEach((outputId: string) => {
            const outputSelected = this.state.selectedOutputs.indexOf(outputId) !== -1;

            if (outputSelected) {
                let matchesFilter = true;

                if (filterRegexp) {
                    const outputDef = this.state.outputDefs[outputId];
                    const valueToMatch = outputDef.label || outputDef.value;
                    const matchesPattern = valueToMatch.match(filterRegexp);
                    if ( (!matchesPattern && !invert) || (invert && matchesPattern)) {
                        matchesFilter = false;
                    }
                }

                if (matchesFilter) {
                    const outputPort = this.outputPorts[outputId];
                    outputPort.send(data);
                }
            }
        });
    }

    render() {
        return (
            <div className="midi-panel">
                <MultiSelect title="Inputs"  options={this.state.inputDefs}  selectedValues={this.state.selectedInputs} stateChangeCallbacks={[this.updateSelectedInputs]}/>
                <MultiSelect title="Outputs" options={this.state.outputDefs} selectedValues={this.state.selectedOutputs} stateChangeCallbacks={[this.updateSelectedOutputs]}/>
            </div>
        )
    }
}