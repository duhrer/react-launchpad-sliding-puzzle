import React from 'react';

import MultiSelect from './MultiSelect';

let fluid = {};

// Very naive replacement for `fluid.copy`.
fluid.copy = function (original) {
    return JSON.parse(JSON.stringify(original));
}

export default class MidiPanel extends React.Component {
    constructor(props) {
        super(props);

        // Give the enclosing puzzle some way to listen to and react to MIDI inputs.
        // TODO: Remove this once we allow the Puzzle to send messages instead.
        this.sendMidiMessage = this.sendMidiMessage.bind(this);
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

        this.handleStateChange = this.handleStateChange.bind(this);
        this.updateSelectedInputs = this.updateSelectedInputs.bind(this);
        this.updateSelectedOutputs = this.updateSelectedOutputs.bind(this);

        // Read the initial set of ports and wire up our state change listener.
        let midiAccessPromise = navigator.requestMIDIAccess({ sysex: true});
        midiAccessPromise.then( (access) => {
            const inputs = access.inputs.values();
            let inputDefs = {};
            for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
                inputDefs[input.value.id] = {
                    label: input.value.name,
                    value: input.value.id
                };

                // Wire up our common handler function to catch this input's MIDI messages.
                input.value.onmidimessage = (data) => { this.handleMidiInput(input.value.id, data);};
            }
            this.setState({ inputDefs: inputDefs });

            let outputDefs = {};
            const outputs = access.outputs.values();
            for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
                outputDefs[output.value.id] = {
                    label: output.value.name,
                    value: output.value.id
                };

                // Since we need to "send" to the objects, stash them for later use.
                this.outputPorts[output.value.id] = output.value;
            };

            this.setState({ outputDefs: outputDefs });

            access.addEventListener("statechange", this.handleStateChange);
        });
    }

    updateSelectedInputs(selectedInputs) {
        this.setState({selectedInputs: selectedInputs});
    }

    updateSelectedOutputs(selectedOutputs) {
        this.setState({selectedOutputs: selectedOutputs});
        this.outputChangeListeners.forEach((callback) => {
            callback();
        });
    }

    handleStateChange(event) {
        let changedPort = event.port;

        let defsToUpdate = changedPort.type === "input" ? "inputDefs" : "outputDefs";
        let updatedDefs =fluid.copy(this.state[defsToUpdate]);

        if (changedPort.state === "connected") {
            updatedDefs[changedPort.id] = {
                label: changedPort.name,
                value: changedPort.id
            }
        }
        else {
            delete updatedDefs[changedPort.id];
        }

        let updatedStateFragment = {};
        updatedStateFragment[defsToUpdate] = updatedDefs;
        this.setState(updatedStateFragment);
    }
    
    handleMidiInput (inputId, midiMessageEvent) {
        // Confirm that this input is selected.
        let inputDef = this.state.inputDefs[inputId];
        let inputSelected = this.state.selectedInputs.indexOf(inputId) !== -1;
        if (inputDef && inputSelected && this.inputListeners.length) {
            let dataAsJson = flock.midi.read(midiMessageEvent.data);
            this.inputListeners.forEach((inputListener) => {
                inputListener(dataAsJson);
            });
        }
    }

    sendMidiMessage (dataAsJson) {
        let outputIds = Object.keys(this.state.outputDefs);
        let data = flock.midi.write(dataAsJson);
        outputIds.forEach((outputId) => {
            let outputSelected = this.state.selectedOutputs.indexOf(outputId) !== -1;

            if (outputSelected) {
                let outputPort = this.outputPorts[outputId];
                outputPort.send(data);
            }
        });
    }

    render() {
        return (
            <div class="midi-panel">
                <MultiSelect title="Inputs"  options={this.state.inputDefs}  selectedValues={this.state.selectedInputs} stateChangeCallbacks={[this.updateSelectedInputs]}/>
                <MultiSelect title="Outputs" options={this.state.outputDefs} selectedValues={this.state.selectedOutputs} stateChangeCallbacks={[this.updateSelectedOutputs]}/>
            </div>
        )
    }
}

// Pure JS version of functions copied from flocking-midi: https://github.com/continuing-creativity/flocking-midi/blob/master/src/core.js
// TODO: Replace this once Fluid and Flocking support ES6.

// Pure JS equivalent of several `fluid.registerNamespace` calls.
let flock = {};
flock.midi = {};

flock.midi.read = function (data) {
    let status = data[0],
        type = status >> 4,
        channel = status & 0xf,
        fn;

    switch (type) {
        case 8:
            fn = flock.midi.read.noteOff;
            break;
        case 9:
            fn = data[2] > 0 ? flock.midi.read.noteOn : flock.midi.read.noteOff;
            break;
        case 10:
            fn = flock.midi.read.polyAftertouch;
            break;
        case 11:
            fn = flock.midi.read.controlChange;
            break;
        case 12:
            fn = flock.midi.read.programChange;
            break;
        case 13:
            fn = flock.midi.read.channelAftertouch;
            break;
        case 14:
            fn = flock.midi.read.pitchbend;
            break;
        case 15:
            fn = flock.midi.read.system;
            break;
        default:
            return flock.fail("Received an unrecognized MIDI message: " +
                JSON.stringify(data));
    }

    return fn(channel, data);
};

// Unsupported, non-API function.
flock.midi.read.note = function (type, channel, data) {
    return {
        type: type,
        channel: channel,
        note: data[1],
        velocity: data[2]
    };
};

// Unsupported, non-API function.
flock.midi.read.noteOn = function (channel, data) {
    return flock.midi.read.note("noteOn", channel, data);
};

// Unsupported, non-API function.
flock.midi.read.noteOff = function (channel, data) {
    return flock.midi.read.note("noteOff", channel, data);
};

// Unsupported, non-API function.
flock.midi.read.polyAftertouch = function (channel, data) {
    return {
        type: "aftertouch",
        channel: channel,
        note: data[1],
        pressure: data[2]
    };
};

// Unsupported, non-API function.
flock.midi.read.controlChange = function (channel, data) {
    return {
        type: "control",
        channel: channel,
        number: data[1],
        value: data[2]
    };
};

// Unsupported, non-API function.
flock.midi.read.programChange = function (channel, data) {
    return {
        type: "program",
        channel: channel,
        program: data[1]
    };
};

// Unsupported, non-API function.
flock.midi.read.channelAftertouch = function (channel, data) {
    return {
        type: "aftertouch",
        channel: channel,
        pressure: data[1]
    };
};

// Unsupported, non-API function.
flock.midi.read.twoByteValue = function (data) {
    return (data[2] << 7) | data[1];
};

// Unsupported, non-API function.
flock.midi.read.pitchbend = function (channel, data) {
    return {
        type: "pitchbend",
        channel: channel,
        value: flock.midi.read.twoByteValue(data)
    };
};

// Unsupported, non-API function.
flock.midi.read.system = function (status, data) {
    if (status === 1) {
        return flock.midi.messageFailure("quarter frame MTC");
    }

    let fn;
    switch (status) {
        case 0:
            fn = flock.midi.read.sysex;
            break;
        case 2:
            fn = flock.midi.read.songPointer;
            break;
        case 3:
            fn = flock.midi.read.songSelect;
            break;
        case 6:
            fn = flock.midi.read.tuneRequest;
            break;
        case 8:
            fn = flock.midi.read.clock;
            break;
        case 10:
            fn = flock.midi.read.start;
            break;
        case 11:
            fn = flock.midi.read["continue"];
            break;
        case 12:
            fn = flock.midi.read.stop;
            break;
        case 14:
            fn = flock.midi.read.activeSense;
            break;
        case 15:
            fn = flock.midi.read.reset;
            break;
        default:
            return flock.fail("Received an unrecognized MIDI system message: " +
                JSON.stringify(data));
    }

    return fn(data);
};

// Unsupported, non-API function.
flock.midi.messageFailure = function (type) {
    flock.fail("Flocking does not currently support MIDI " + type + " messages.");
    return;
};

// Unsupported, non-API function.
flock.midi.read.sysex = function (data) {
    let begin = data[0] === 0xF0 ? 1 : 0,
        end = data.length - (data[data.length - 1] === 0xF7 ? 1 : 0);

    // Avoid copying the data if we're working with a typed array.
    let trimmedData = data instanceof Uint8Array ?
        data.subarray(begin, end) :
        data.slice(begin, end);

    return {
        type: "sysex",
        data: trimmedData
    };
};

// Unsupported, non-API function.
flock.midi.read.valueMessage = function (type, value) {
    return {
        type: type,
        value: value
    };
};

// Unsupported, non-API function.
flock.midi.read.songPointer = function (data) {
    let val = flock.midi.read.twoByteValue(data);
    return flock.midi.read.valueMessage("songPointer", val);
};

// Unsupported, non-API function.
flock.midi.read.songSelect = function (data) {
    return flock.midi.read.valueMessage("songSelect", data[1]);
};

// Unsupported, non-API function.
flock.midi.read.tuneRequest = function () {
    return {
        type: "tuneRequest"
    };
};

flock.midi.systemRealtimeMessages = [
    "tuneRequest",
    "clock",
    "start",
    "continue",
    "stop",
    "activeSense",
    "reset"
];

// Unsupported, non-API function.
flock.midi.createSystemRealtimeMessageReaders = function (systemRealtimeMessages) {
    // Modified to avoid use of `fluid.each`.
    systemRealtimeMessages.forEach((type) => {
        flock.midi.read[type] = function () {
            return {
                type: type
            };
        };
    })
};

// Unsupported, non-API function.
flock.midi.createSystemRealtimeMessageReaders(flock.midi.systemRealtimeMessages);


/**
 *
 * Take a MIDI messageSpec object and convert it to an array of raw bytes suitable for sending to a MIDI device.
 *
 * @param {Object} midiMessage a MIDI messageSpec object
 * @return {Uint8Array} - an array containing the encoded MIDI message's bytes
 *
 */
flock.midi.write = function (midiMessage) {
    if (midiMessage.type === "sysex") {
        return flock.midi.write.sysex(midiMessage);
    }

    // MIDI status nibbles are helpfully documented in this
    // SparkFun article:
    // https://learn.sparkfun.com/tutorials/midi-tutorial/all#messages
    switch (midiMessage.type) {
        case "noteOn":
            return flock.midi.write.note(9, midiMessage);
        case "noteOff":
            return flock.midi.write.note(8, midiMessage);
        case "aftertouch":
            return flock.midi.write.aftertouch(midiMessage);
        case "control":
            return flock.midi.write.controlChange(midiMessage);
        case "program":
            return flock.midi.write.programChange(midiMessage);
        case "pitchbend":
            return flock.midi.write.largeValueMessage(14, midiMessage.channel, midiMessage);
        case "songPointer":
            return flock.midi.write.largeValueMessage(15, 2, midiMessage);
        case "songSelect":
            return flock.midi.write.largeValueMessage(15, 3, midiMessage);
        case "tuneRequest":
            return flock.midi.write.singleByteMessage(15, 6);
        case "clock":
            return flock.midi.write.singleByteMessage(15, 8);
        case "start":
            return flock.midi.write.singleByteMessage(15, 10);
        case "continue":
            return flock.midi.write.singleByteMessage(15, 11);
        case "stop":
            return flock.midi.write.singleByteMessage(15, 12);
        case "activeSense":
            return flock.midi.write.singleByteMessage(15, 14);
        case "reset":
            return flock.midi.write.singleByteMessage(15, 15);
        default:
            flock.fail("Cannot write an unrecognized MIDI message of type '" + midiMessage.type + "'.");
    }
};

// Unsupported, non-API function.
flock.midi.write.note = function (status, midiMessage) {
    return flock.midi.write.threeByteMessage(status, midiMessage.channel,
        midiMessage.note, midiMessage.velocity);
};

// Unsupported, non-API function.
flock.midi.write.controlChange = function (midiMessage) {
    return flock.midi.write.threeByteMessage(11, midiMessage.channel,
        midiMessage.number, midiMessage.value);
};

// Unsupported, non-API function.
flock.midi.write.programChange = function (midiMessage) {
    return flock.midi.write.twoByteMessage(12, midiMessage.channel, midiMessage.program);
};

// Unsupported, non-API function.
flock.midi.write.aftertouch = function (midiMessage) {
    // polyAfterTouch
    if (midiMessage.note) {
        return flock.midi.write.note(10, midiMessage);
    }

    // afterTouch
    return flock.midi.write.twoByteMessage(13, midiMessage.channel, midiMessage.pressure);
};

// Unsupported, non-API function.
flock.midi.write.singleByteMessage = function (msNibble, lsNibble) {
    let data = new Uint8Array(1);
    data[0] = flock.midi.write.statusByte(msNibble, lsNibble);
    return data;
};

// Unsupported, non-API function.
flock.midi.write.twoByteMessage = function (msNibble, lsNibble, data1) {
    let data = new Uint8Array(2);
    data[0] = flock.midi.write.statusByte(msNibble, lsNibble);
    data[1] = data1;
    return data;
};

// Unsupported, non-API function.
flock.midi.write.threeByteMessage = function (msNibble, lsNibble, data1, data2) {
    let data = new Uint8Array(3);
    data[0] = flock.midi.write.statusByte(msNibble, lsNibble);
    data[1] = data1;
    data[2] = data2;
    return data;
};

// Unsupported, non-API function.
flock.midi.write.largeValueMessage = function (msNibble, lsNibble, midiMessage) {
    let data = new Uint8Array(3);
    data[0] = flock.midi.write.statusByte(msNibble, lsNibble);
    flock.midi.write.twoByteValue(midiMessage.value, data, 1);
    return data;
};

/**
 *
 * Output a status byte.
 *
 * @param {Number} msNibble - the first nibble of the status byte (often the command code).
 * @param {Number} lsNibble - the second nibble of the status byte (often the channel).
 * @return {Byte} A status byte that combines the two inputs.
 */
// Unsupported, non-API function.
flock.midi.write.statusByte = function (msNibble, lsNibble) {
    return (msNibble << 4) + lsNibble;
};

/**
 *
 * Converts a 14-bit numeric value to two MIDI bytes.
 *
 * @param {Number} value - A 14-bit number to convert
 * @param {Unit8TypedArray} array - An array to write the value to.
 * @param {Integer} offset - The optional offset in the array to start writing at.  Defaults to 0.
 *
 */
// Unsupported, non-API function.
flock.midi.write.twoByteValue =  function (value, array, offset) {
    offset = offset || 0;
    array[offset] = value & 0x7f; // LSB
    array[offset + 1] = (value >> 7) & 0x7f; // MSB
};

/**
 *
 * Convert a MIDI Message represented as a Javascript Object into a Sysex message represented as a Uint8Array.
 *
 * NOTE: This function does not accept framing, i.e. a leading 0xF0 and/or trailing 0xF7, and will fail if called
 * with either.
 *
 * @param {Object} midiMessage - The MIDI message represented as a Javascript Object.
 * @return {Uint8Array} - The sysex message.
 */
// Unsupported, non-API function.
flock.midi.write.sysex = function (midiMessage) {
    if (midiMessage.data[0] === 0xF0 || midiMessage.data[midiMessage.data.length - 1] === 0xF7) {
        flock.fail("Sysex payloads should not include framing bytes.");
    }

    let data = midiMessage.data,
        len = data.length;

    let framedData = new Uint8Array(len + 2);
    framedData[0] = 0xF0;
    framedData[len + 1] = 0xF7;
    framedData.set(data, 1);

    return framedData;
};

// QnD replacement for flock.fail
flock.fail = function(error) {
    throw(new Error(error));
};