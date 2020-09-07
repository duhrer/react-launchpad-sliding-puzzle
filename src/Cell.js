// @flow
import React  from 'react';

import Colours from "./Colours";

import type {ClickHandler, KeyHandler} from "./HandlerTypes";

// TODO: Figure out how this should work.
// export type CellRef = {current:null | HTMLButtonElement};
export type CellRef = {current:null | any};

export type CellProps = {
    row: number,
    col: number,
    value?: number,
    onClick: ClickHandler,
    onKeyDown: KeyHandler
};


export default class Cell extends React.Component<CellProps, {}> {
    buttonRef: ?CellRef;

    static defaultProps = {
        row: 0,
        col: 0,
        onClick: () => {},
        onKeyDown: () => {}
    }

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
        const className = this.props.value === 0 ? "cell empty":  "cell";
        const stringValue = (this.props.value === null || this.props.value === undefined || this.props.value === 0) ? "":  this.props.value.toString()
        return (
            <button
                className={className}
                ref={this.buttonRef}
                onClick={this.handleClick}
                onKeyDown={this.handleKeyDown}
                style={{"backgroundColor": Colours[this.props.value]}}
            >
                {stringValue}
            </button>
        );
    }
}
