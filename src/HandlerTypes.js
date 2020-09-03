// @flow
import type {MidiMessage} from "./MidiPanel";
export type ClickHandler = (row: number, col: number) => void;
export type KeyHandler = (event: KeyboardEvent, row: number, col: number) => void;
export type OutputCallback = (message: MidiMessage, filter: RegExp, invertMatches?: boolean) => void;
