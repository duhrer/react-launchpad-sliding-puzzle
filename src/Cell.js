// @flow
import React  from 'react';

import Colours from "./Colours";

import type {ClickHandler, KeyHandler} from "./HandlerTypes";

// TODO: Figure out how this should work.
// export type CellRef = {current:null | HTMLButtonElement};
export type CellRef = {current:null | any};

type CellProps = {
    row: number,
    col: number,
    value: number,
    onClick: ClickHandler,
    onKeyDown: KeyHandler
};


export default class Cell extends React.Component<CellProps, {}> {
    buttonRef: ?CellRef;

    constructor(props: CellProps) {
        super(props);
        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    focus() {
        if (this.buttonRef && this.buttonRef.current) {
            this.buttonRef.current.focus();
        }
    }

    handleClick = () => {
        this.props.onClick(this.props.row, this.props.col);
    };

    handleKeyDown = (event: KeyboardEvent) => {
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
