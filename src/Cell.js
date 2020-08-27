// @flow
import React  from 'react';

import Colours from "./Colours";

type CellProps = {
    row: number,
    col: number,
    value: number,
    onClick: Function,
    onKeyDown: Function
};

export default class Cell extends React.Component<CellProps, {}> {
    buttonRef: { current:null | HTMLButtonElement};

    constructor(props: CellProps) {
        super(props);
        this.buttonRef = React.createRef();
    }

    focus() {
        if (this.buttonRef && this.buttonRef.current) {
            this.buttonRef.current.focus();
        }
    }

    handleClick = () => {
        this.props.onClick(this.props.row, this.props.col);
    };

    handleKeyDown = (event: Event) => {
        this.props.onKeyDown(event, this.props.row, this.props.col);
    };

    render() {
        return (
            <button
                className={this.props.value === 0 ? "cell empty":  "cell"}
                ref={this.buttonRef}
                onClick={this.handleClick}
                onKeyDown={this.handleKeyDown}
                style={{"backgroundColor": Colours[this.props.value]}}
            >
                {this.props.value === 0 ? "":  this.props.value.toString()}
            </button>
        );
    }
}
