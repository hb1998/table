import Table, { MoveDirection } from '.';
import { Range } from '@lumel/table-renderer';
import { DataCell } from './data';
import Selector from './selector';
export interface SelectedCell {
    row: number;
    col: number;
}
declare function init(t: Table): void;
declare function setCellValue(t: Table, value: DataCell): void;
declare function addRange(t: Table, r: number, c: number, clear: boolean): void;
declare function unionRange(t: Table, r: number, c: number): void;
declare function reset(t: Table): void;
declare function move(t: Table, reselect: boolean, direction: MoveDirection, step?: number): void;
declare function bindMousemove(t: Table, moveChange: (row: number, col: number) => void, changedRange: (s: Selector) => Range | null | undefined, upAfter?: (s: Selector) => void): void;
declare function showCopy(t: Table): void;
declare function clearCopy(t: Table): void;
declare const _default: {
    init: typeof init;
    setCellValue: typeof setCellValue;
    addRange: typeof addRange;
    unionRange: typeof unionRange;
    reset: typeof reset;
    move: typeof move;
    bindMousemove: typeof bindMousemove;
    showCopy: typeof showCopy;
    clearCopy: typeof clearCopy;
};
export default _default;
