import { LinearGauge } from '../../linear-gauge';
import { Axis, Tick, Pointer } from './axis';
import { AxisModel } from './axis-model';
import { Animations } from './animation';
import { Rect } from '../utils/helper';
/**
 * To render the axis elements.
 *
 * @private
 */
export declare class AxisRenderer extends Animations {
    private htmlObject;
    private axisObject;
    private axisElements;
    constructor(gauge: LinearGauge);
    renderAxes(): void;
    axisAlign(axes: AxisModel[]): void;
    drawAxisLine(axis: Axis, axisObject: Element, axisIndex: number): void;
    drawTicks(axis: Axis, ticks: Tick, axisObject: Element, tickID: string, tickBounds: Rect, axisIndex: number): void;
    drawAxisLabels(axis: Axis, axisObject: Element, axisIndex: number): void;
    drawPointers(axis: Axis, axisObject: Element, axisIndex: number): void;
    drawMarkerPointer(axis: Axis, axisIndex: number, pointer: Pointer, pointerIndex: number, parentElement: Element): void;
    drawBarPointer(axis: Axis, axisIndex: number, pointer: Pointer, pointerIndex: number, parentElement: Element): void;
    /**
     * @param {Axis} axis - Specifies the axis
     * @param {number} axisIndex - Specifies the axis index
     * @returns {void}
     * @private
     */
    pointerAnimation(axis: Axis, axisIndex: number): void;
    drawRanges(axis: Axis, axisObject: Element, axisIndex: number): void;
    updateTextPointer(pointerId: string, pointer: Pointer, axis: Axis): void;
    /**
     * @private
     */
    destroy(): void;
}
