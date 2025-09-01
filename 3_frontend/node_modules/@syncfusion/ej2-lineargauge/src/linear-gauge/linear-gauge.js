var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/* eslint-disable valid-jsdoc */
import { Component, Property, NotifyPropertyChanges, Internationalization, animationMode } from '@syncfusion/ej2-base';
import { Browser } from '@syncfusion/ej2-base';
import { Event, EventHandler, Complex, Collection, isNullOrUndefined, remove, createElement, Animation } from '@syncfusion/ej2-base';
import { Border, Font, Container, Margin, Annotation, TooltipSettings } from './model/base';
import { Axis } from './axes/axis';
import { load, loaded, gaugeMouseMove, gaugeMouseLeave, gaugeMouseDown, gaugeMouseUp, resized, valueChange } from './model/constant';
import { Size, valueToCoefficient, calculateShapes, calculateTextPosition, removeElement, getElement, getExtraWidth, stringToNumberSize } from './utils/helper';
import { measureText, Rect, TextOption, textElement, GaugeLocation, RectOption, PathOption } from './utils/helper';
import { getBox, withInRange, getPointer, convertPixelToValue, textTrim, showTooltip, removeTooltip } from './utils/helper';
import { dragEnd, dragMove, dragStart } from './model/constant';
import { AxisLayoutPanel } from './axes/axis-panel';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { AxisRenderer } from './axes/axis-renderer';
import { Annotations } from './annotations/annotations';
import { GaugeTooltip } from './user-interaction/tooltip';
import { getThemeStyle } from './model/theme';
import { Gradient } from './axes/gradient';
/**
 * Represents the linear gauge control. This is used to customize the properties of the linear gauge to visualize the data in linear scale.
 * ```html
 * <div id="container"/>
 * <script>
 *   var gaugeObj = new LinearGauge({ });
 *   gaugeObj.appendTo("#container");
 * </script>
 * ```
 */
var LinearGauge = /** @class */ (function (_super) {
    __extends(LinearGauge, _super);
    /**
     * Constructor for creating the widget
     *
     * @private
     * @hidden
     */
    function LinearGauge(options, element) {
        var _this = _super.call(this, options, element) || this;
        /**
         * Specifies the gradient count of the linear gauge.
         *
         * @private
         */
        _this.gradientCount = 0;
        /** @private */
        _this.isDrag = false;
        /** @private */
        _this.splitUpCount = 0;
        /** @private */
        _this.allowLoadingAnimation = false;
        /** @private */
        _this.isPointerAnimationInProgress = false;
        /** @private */
        _this.isOverAllAnimationComplete = false;
        /** @private */
        _this.pointerDrag = false;
        _this.isTouchPointer = false;
        /** @private */
        _this.isCheckPointerDrag = false;
        /** @private */
        _this.mouseX = 0;
        /** @private */
        _this.mouseY = 0;
        /** @private */
        _this.gaugeResized = false;
        return _this;
    }
    /**
     * Initialize the preRender method.
     */
    LinearGauge.prototype.preRender = function () {
        this.unWireEvents();
        this.isPointerAnimationInProgress = false;
        this.trigger(load, { gauge: this });
        this.initPrivateVariable();
        this.setCulture();
        this.createSvg();
        this.wireEvents();
    };
    LinearGauge.prototype.setTheme = function () {
        this.themeStyle = getThemeStyle(this.theme);
    };
    LinearGauge.prototype.initPrivateVariable = function () {
        if (this.element.id === '') {
            var collection = document.getElementsByClassName('e-lineargauge').length;
            this.element.id = 'lineargauge_' + 'control_' + collection;
        }
        this.renderer = new SvgRenderer(this.element.id);
        this.gaugeAxisLayoutPanel = new AxisLayoutPanel(this);
        this.axisRenderer = new AxisRenderer(this);
    };
    /**
     * Method to set culture for chart
     */
    LinearGauge.prototype.setCulture = function () {
        this.intl = new Internationalization();
    };
    /**
     * Methods to create svg element
     */
    LinearGauge.prototype.createSvg = function () {
        this.removeSvg();
        this.calculateSize();
        if (isNullOrUndefined(this.renderer)) {
            this.renderer = new SvgRenderer(this.element.id);
        }
        if (isNullOrUndefined(this.gaugeAxisLayoutPanel)) {
            this.gaugeAxisLayoutPanel = new AxisLayoutPanel(this);
        }
        if (isNullOrUndefined(this.axisRenderer)) {
            this.axisRenderer = new AxisRenderer(this);
        }
        this.svgObject = this.renderer.createSvg({
            id: this.element.id + '_svg',
            width: this.availableSize.width,
            height: this.availableSize.height
        });
    };
    /**
     * To Remove the SVG.
     *
     * @return {boolean}
     * @private
     */
    LinearGauge.prototype.removeSvg = function () {
        removeElement(this.element.id + '_Secondary_Element');
        if (!(isNullOrUndefined(this.svgObject)) && !isNullOrUndefined(this.svgObject.parentNode)) {
            remove(this.svgObject);
        }
        this.clearTemplate();
    };
    LinearGauge.prototype.renderAnimation = function () {
        var _this = this;
        if (this.allowLoadingAnimation) {
            var element = document.getElementById(this.element.id + '_RangesGroup_0');
            this.axisElementAnimate(element);
            if (this.styleRemove) {
                clearTimeout(this.styleRemove);
            }
            this.styleRemove = setTimeout(function () {
                var styleElement = document.querySelectorAll('style.' + _this.element.id + 'animation');
                if (styleElement.length > 0) {
                    styleElement[0].remove();
                }
            }, (this.animationDuration === 0 && animationMode === 'Enable') ? 1000 : this.animationDuration);
        }
    };
    LinearGauge.prototype.axisElementAnimate = function (element) {
        var _this = this;
        var tempOpacity = 0;
        var opacity = 1;
        var elements = document.querySelectorAll('style.' + this.element.id + 'animation');
        new Animation({}).animate(element, {
            duration: (this.animationDuration === 0 && animationMode === 'Enable') ? 1000 : this.animationDuration > 0 ?
                this.animationDuration / this.splitUpCount : 0,
            progress: function (args) {
                if (args.timeStamp > args.delay) {
                    tempOpacity = ((args.timeStamp - args.delay) / args.duration);
                    elements[0].style.cssText = "opacity: " + opacity * tempOpacity + ";";
                }
            },
            end: function () {
                if (!isNullOrUndefined(elements) && elements.length !== 0) {
                    elements[0].style.cssText = 'opacity: 1;';
                }
                for (var i = 0; i < _this.axes.length; i++) {
                    _this.axisRenderer.pointerAnimation(_this.axes[i], i);
                    if ((_this.axes.length - 1) === 0 && _this.axes[i].pointers.length === 0) {
                        _this.isOverAllAnimationComplete = true;
                    }
                }
            }
        });
    };
    /**
     * Method to calculate the size of the gauge
     */
    LinearGauge.prototype.calculateSize = function () {
        if (!isNullOrUndefined(this.height)) {
            this.element.style.height = this.height;
        }
        if (!isNullOrUndefined(this.width)) {
            this.element.style.width = this.width;
        }
        var width = stringToNumberSize(this.width, this.element.offsetWidth) || this.element.offsetWidth || 600;
        var height = stringToNumberSize(this.height, this.element.offsetHeight) || this.element.offsetHeight || 450;
        this.availableSize = new Size(width, height);
    };
    LinearGauge.prototype.renderElements = function () {
        this.setTheme();
        this.renderGaugeElements();
        this.calculateBounds();
        this.renderAxisElements();
        this.renderAnimation();
        this.renderComplete();
    };
    /**
     * To Initialize the control rendering
     */
    LinearGauge.prototype.render = function () {
        this.isPropertyChange = false;
        this.isCheckPointerDrag = false;
        this.allowLoadingAnimation = ((this.animationDuration === 0 && animationMode === 'Enable') || this.animationDuration > 0)
            && !this.isOverAllAnimationComplete;
        if (this.allowLoadingAnimation) {
            var styleClass = document.getElementsByClassName(this.element.id + 'animation');
            if (styleClass.length === 0) {
                var styleClass_1 = createElement('style', {
                    className: this.element.id + 'animation'
                });
                styleClass_1.style.cssText = '.' + this.element.id + 'animation' + '{opacity: 0}';
                document.body.appendChild(styleClass_1);
            }
        }
        this.renderElements();
    };
    /**
     * To render the gauge elements
     *
     * @private
     */
    LinearGauge.prototype.renderGaugeElements = function () {
        this.appendSecondaryElement();
        this.renderBorder();
        this.renderTitle();
        this.renderContainer();
    };
    LinearGauge.prototype.appendSecondaryElement = function () {
        if (isNullOrUndefined(getElement(this.element.id + '_Secondary_Element'))) {
            var secondaryElement = createElement('div');
            secondaryElement.id = this.element.id + '_Secondary_Element';
            secondaryElement.style.position = 'relative';
            this.element.appendChild(secondaryElement);
        }
    };
    /**
     * To calculate axes bounds
     *
     * @private
     */
    LinearGauge.prototype.calculateBounds = function () {
        this.gaugeAxisLayoutPanel.calculateAxesBounds();
    };
    /**
     * To render axis elements
     *
     * @private
     */
    LinearGauge.prototype.renderAxisElements = function () {
        this.axisRenderer.renderAxes();
        this.element.appendChild(this.svgObject);
        if (this.annotationsModule) {
            this.annotationsModule.renderAnnotationElements(this);
        }
        if (!this.isCheckPointerDrag) {
            this.trigger(loaded, { gauge: this });
        }
        removeElement('gauge-measuretext');
    };
    LinearGauge.prototype.renderBorder = function () {
        var width = this.border.width;
        if (width > 0 || (this.background || this.themeStyle.backgroundColor)) {
            var rect = new RectOption(this.element.id + '_LinearGaugeBorder', this.background || this.themeStyle.backgroundColor, this.border, 1, new Rect(width / 2, width / 2, this.availableSize.width - width, this.availableSize.height - width));
            this.svgObject.appendChild(this.renderer.drawRectangle(rect));
        }
    };
    LinearGauge.prototype.renderTitle = function () {
        var width = (this.availableSize.width - this.margin.left - this.margin.right);
        var style = {
            size: this.titleStyle.size || this.themeStyle.titleFontSize,
            color: this.titleStyle.color,
            fontFamily: this.titleStyle.fontFamily || this.themeStyle.fontFamily,
            fontWeight: this.titleStyle.fontWeight || this.themeStyle.titleFontWeight,
            fontStyle: this.titleStyle.fontStyle || this.themeStyle.titleFontStyle,
            opacity: this.titleStyle.opacity
        };
        var trimmedTitle = textTrim(width, this.title, style);
        var size = measureText(trimmedTitle, style);
        var options = new TextOption(this.element.id + '_LinearGaugeTitle', this.availableSize.width / 2, this.margin.top + (size.height / 2), 'middle', trimmedTitle);
        var titleBounds = {
            x: options.x - (size.width / 2),
            y: options.y,
            width: size.width,
            height: size.height
        };
        var x = this.margin.left;
        var y = titleBounds.y;
        var height = (this.availableSize.height - y - this.margin.bottom);
        this.actualRect = { x: x, y: y, width: width, height: height };
        if (this.title) {
            var element = textElement(options, style, style.color || this.themeStyle.titleFontColor, null, this.svgObject);
            element.setAttribute('aria-label', this.description || this.title);
            element.setAttribute('role', 'region');
            element.setAttribute('tabindex', this.tabIndex.toString());
        }
    };
    /*
     * Method to unbind the gauge events
     */
    LinearGauge.prototype.unWireEvents = function () {
        EventHandler.remove(this.element, Browser.touchStartEvent, this.gaugeOnMouseDown);
        EventHandler.remove(this.element, Browser.touchMoveEvent, this.mouseMove);
        EventHandler.remove(this.element, Browser.touchEndEvent, this.mouseEnd);
        EventHandler.remove(this.element, 'contextmenu', this.gaugeRightClick);
        EventHandler.remove(this.element, (Browser.isPointer ? 'pointerleave' : 'mouseleave'), this.mouseLeave);
        window.removeEventListener((Browser.isTouch && ('orientation' in window && 'onorientationchange' in window)) ? 'orientationchange' : 'resize', this.resizeEvent);
    };
    /*
     * Method to bind the gauge events
     */
    LinearGauge.prototype.wireEvents = function () {
        /*! Bind the Event handler */
        EventHandler.add(this.element, Browser.touchStartEvent, this.gaugeOnMouseDown, this);
        EventHandler.add(this.element, Browser.touchMoveEvent, this.mouseMove, this);
        EventHandler.add(this.element, Browser.touchEndEvent, this.mouseEnd, this);
        EventHandler.add(this.element, 'contextmenu', this.gaugeRightClick, this);
        EventHandler.add(this.element, (Browser.isPointer ? 'pointerleave' : 'mouseleave'), this.mouseLeave, this);
        this.resizeEvent = this.gaugeResize.bind(this);
        EventHandler.add(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window, (Browser.isTouch && ('orientation' in window && 'onorientationchange' in window)) ? 'orientationchange' : 'resize', this.resizeEvent);
        this.setStyle(this.element);
    };
    LinearGauge.prototype.setStyle = function (element) {
        element.style.touchAction = 'element';
        element.style.msTouchAction = 'element';
        element.style.msContentZooming = 'none';
        element.style.msUserSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.position = 'relative';
    };
    /**
     * Handles the gauge resize.
     *
     * @return {boolean} check whether the Linear Gauge is resized or not.
     * @private
     */
    LinearGauge.prototype.gaugeResize = function () {
        var _this = this;
        if (!this.isDestroyed) {
            var args = {
                gauge: this,
                previousSize: new Size(this.availableSize.width, this.availableSize.height),
                name: resized,
                currentSize: new Size(0, 0),
                cancel: false
            };
            var currentSize = this.element.getBoundingClientRect();
            args.currentSize = new Size(currentSize.width, currentSize.height);
            this.trigger(resized, args);
            if (!args.cancel) {
                if (this.resizeTo) {
                    clearTimeout(this.resizeTo);
                }
                if (!isNullOrUndefined(this.element) && this.element.classList.contains('e-lineargauge')) {
                    this.resizeTo = window.setTimeout(function () {
                        _this.gaugeResized = true;
                        _this.createSvg();
                        _this.allowLoadingAnimation = false;
                        _this.renderElements();
                    }, 500);
                }
            }
        }
        return false;
    };
    /**
     * This method destroys the linear gauge. This method removes the events associated with the linear gauge and disposes the objects created for rendering and updating the linear gauge.
     */
    LinearGauge.prototype.destroy = function () {
        this.unWireEvents();
        _super.prototype.destroy.call(this);
        if (!isNullOrUndefined(this.gaugeAxisLayoutPanel)) {
            this.gaugeAxisLayoutPanel.destroy();
        }
        if (!isNullOrUndefined(this.axisRenderer)) {
            this.axisRenderer.destroy();
        }
        this.gaugeAxisLayoutPanel = null;
        this.axisRenderer = null;
        this.activePointer = null;
        this.activeAxis = null;
        this.actualRect = null;
        this.containerObject = null;
        this.containerBounds = null;
        this.availableSize = null;
        this.mouseElement = null;
        this.nearSizes = [];
        this.farSizes = [];
        this.themeStyle = null;
        this.intl = null;
        this.removeSvg();
        this.resizeEvent = null;
        this.svgObject = null;
        this.renderer = null;
    };
    /**
     * To render the gauge container
     *
     * @private
     */
    LinearGauge.prototype.renderContainer = function () {
        var width;
        var height;
        var x;
        var y;
        var options;
        var labelPadding = 20;
        var extraPadding = 30;
        var path = '';
        var fill = (this.container.backgroundColor !== 'transparent'
            || (this.theme !== 'Bootstrap4' && this.theme !== 'Material' && this.theme !== 'Material3' && this.theme !== 'Material3Dark'
                && this.theme !== 'Fluent2' && this.theme !== 'Fluent2Dark' && this.theme !== 'Bootstrap5' && this.theme !== 'Bootstrap5Dark'
                && this.theme !== 'Tailwind' && this.theme !== 'TailwindDark' && this.theme !== 'Tailwind3' && this.theme !== 'Tailwind3Dark'))
            ? this.container.backgroundColor : this.themeStyle.containerBackground;
        var rect;
        var radius = this.container.width;
        var bottomRadius = radius + ((radius / 2) / Math.PI);
        var topRadius = radius / 2;
        var allowContainerRender = false;
        for (var i = 0; i < this.axes.length; i++) {
            if (this.axes[i].minimum !== this.axes[i].maximum) {
                allowContainerRender = true;
                break;
            }
        }
        if (this.orientation === 'Vertical') {
            if (this.allowMargin) {
                height = this.actualRect.height;
                height = (this.container.height > 0) ? this.container.height :
                    ((height / 2) - ((height / 2) / 4)) * 2;
                height = (this.container.type === 'Thermometer') ? height - (bottomRadius * 2) - topRadius : height;
            }
            else {
                height = this.actualRect.height - labelPadding - extraPadding;
                height = (this.container.type === 'Thermometer') ? (radius !== 0) ? (this.actualRect.height - (bottomRadius * 2) - topRadius - extraPadding) : height : height;
            }
            width = this.container.width;
            x = (this.actualRect.x + ((this.actualRect.width / 2) - (this.container.width / 2))) + this.container.offset;
            y = this.actualRect.y + ((this.actualRect.height / 2) - ((this.container.type === 'Thermometer') ?
                ((height + (bottomRadius * 2) - topRadius)) / 2 : height / 2));
        }
        else {
            if (this.allowMargin) {
                width = (this.container.height > 0) ? this.container.height :
                    ((this.actualRect.width / 2) - ((this.actualRect.width / 2) / 4)) * 2;
                width = (this.container.type === 'Thermometer') ? width - (bottomRadius * 2) - topRadius : width;
            }
            else {
                width = this.actualRect.width - labelPadding;
                width = (this.container.type === 'Thermometer') ? (this.actualRect.width - (bottomRadius * 2) - topRadius) : width;
            }
            x = this.actualRect.x + ((this.actualRect.width / 2) - ((this.container.type === 'Thermometer') ?
                (width - (bottomRadius * 2) + topRadius) / 2 : width / 2));
            y = (this.actualRect.y + ((this.actualRect.height / 2) - (this.container.width / 2))) + this.container.offset;
            height = this.container.width;
        }
        this.containerBounds = (!allowContainerRender) ? { x: 0, y: 0, width: 0, height: 0 } : { x: x, y: y, width: width, height: height };
        if ((this.containerBounds.width > 0 && this.orientation === 'Vertical') || (this.containerBounds.height > 0 && this.orientation === 'Horizontal')) {
            this.containerObject = this.renderer.createGroup({ id: this.element.id + '_Container_Group', transform: 'translate( 0, 0)' });
            if (this.container.type === 'Normal') {
                var containerBorder = { color: this.container.border.color || this.themeStyle.containerBorderColor,
                    width: this.container.border.width, dashArray: this.container.border.dashArray };
                rect = new RectOption(this.element.id + '_' + this.container.type + '_Layout', fill, containerBorder, 1, new Rect(x, y, width, height));
                this.containerObject.appendChild(this.renderer.drawRectangle(rect));
                if (this.allowLoadingAnimation) {
                    this.containerObject.classList.add(this.element.id + 'animation');
                }
            }
            else {
                path = getBox(this.containerBounds, this.container.type, this.orientation, new Size(this.container.height, this.container.width), 'container', null, null, this.container.roundedCornerRadius);
                options = new PathOption(this.element.id + '_' + this.container.type + '_Layout', fill, this.container.border.width, this.container.border.color || this.themeStyle.containerBorderColor, 1, this.container.border.dashArray, path);
                this.containerObject.appendChild(this.renderer.drawPath(options));
                if (this.allowLoadingAnimation) {
                    this.containerObject.classList.add(this.element.id + 'animation');
                }
            }
            this.svgObject.appendChild(this.containerObject);
        }
    };
    /**
     * Method to set mouse x, y from events
     */
    LinearGauge.prototype.setMouseXY = function (e) {
        var pageX;
        var pageY;
        var svgRect = getElement(this.element.id + '_svg').getBoundingClientRect();
        var rect = this.element.getBoundingClientRect();
        if (e.type.indexOf('touch') > -1) {
            this.isTouch = true;
            var touchArg = e;
            pageY = touchArg.changedTouches[0].clientY;
            pageX = touchArg.changedTouches[0].clientX;
        }
        else {
            this.isTouch = e.pointerType === 'touch' || e.pointerType === '2';
            pageX = e.clientX;
            pageY = e.clientY;
        }
        this.mouseY = (pageY - rect.top) - Math.max(svgRect.top - rect.top, 0);
        this.mouseX = (pageX - rect.left) - Math.max(svgRect.left - rect.left, 0);
    };
    /**
     * Handles the mouse down on gauge.
     *
     * @param {PointerEvent} e - Specifies the event argument.
     * @return {boolean}
     * @private
     */
    LinearGauge.prototype.gaugeOnMouseDown = function (e) {
        var _this = this;
        var current;
        var currentPointer;
        this.setMouseXY(e);
        var args = this.getMouseArgs(e, 'touchstart', gaugeMouseDown);
        this.trigger(gaugeMouseDown, args, function () {
            _this.mouseX = args.x;
            _this.mouseY = args.y;
            if (_this.isTouch) {
                e.preventDefault();
                _this.isTouchPointer = true;
            }
            if (args.target) {
                if (!args.cancel && ((args.target.id.indexOf('MarkerPointer') > -1) || (args.target.id.indexOf('BarPointer') > -1))) {
                    _this.isOverAllAnimationComplete = true;
                    current = _this.moveOnPointer(args.target);
                    currentPointer = getPointer(args.target, _this);
                    _this.activeAxis = _this.axes[currentPointer.axisIndex];
                    _this.activePointer = _this.activeAxis.pointers[currentPointer.pointerIndex];
                    if (isNullOrUndefined(_this.activePointer.pathElement)) {
                        _this.activePointer.pathElement = [e.target];
                    }
                    var pointInd = parseInt(_this.activePointer.pathElement[0].id.slice(-1), 10);
                    var axisInd = parseInt(_this.activePointer.pathElement[0].id.match(/\d/g)[0], 10);
                    if (currentPointer.pointer.enableDrag) {
                        _this.trigger(dragStart, {
                            axis: _this.activeAxis,
                            name: dragStart,
                            pointer: _this.activePointer,
                            currentValue: _this.activePointer.currentValue,
                            pointerIndex: pointInd,
                            axisIndex: axisInd
                        });
                    }
                    if (!isNullOrUndefined(current) && current.pointer) {
                        _this.pointerDrag = true;
                        _this.mouseElement = args.target;
                    }
                }
            }
        });
        return false;
    };
    /**
     * Handles the mouse move.
     *
     * @return {boolean}
     * @private
     */
    LinearGauge.prototype.mouseMove = function (e) {
        var _this = this;
        var current;
        this.setMouseXY(e);
        var args = this.getMouseArgs(e, 'touchmove', gaugeMouseMove);
        this.trigger(gaugeMouseMove, args, function () {
            _this.mouseX = args.x;
            _this.mouseY = args.y;
            var dragArgs;
            if (args.target && !args.cancel) {
                if (_this.pointerDrag && _this.activePointer) {
                    if (!isNullOrUndefined(_this.activePointer.pathElement)) {
                        if (_this.isTouch) {
                            _this.isTouchPointer = true;
                            e.preventDefault();
                        }
                        var pointerIndex = parseInt(_this.activePointer.pathElement[0].id.slice(-1), 10);
                        var axisIndex = parseInt(_this.activePointer.pathElement[0].id.split('AxisIndex_')[1].match(/\d/g)[0], 10);
                        if (_this.axes[axisIndex].pointers[pointerIndex].enableDrag) {
                            current = _this.moveOnPointer(_this.activePointer.pathElement[0]);
                            if (!(isNullOrUndefined(current)) && current.pointer) {
                                _this.element.style.cursor = current.style;
                            }
                            _this.isDrag = _this.isCheckPointerDrag = true;
                            dragArgs = {
                                axis: _this.activeAxis,
                                pointer: _this.activePointer,
                                previousValue: _this.activePointer.currentValue,
                                name: dragMove,
                                currentValue: null,
                                axisIndex: axisIndex,
                                pointerIndex: pointerIndex
                            };
                            if (_this.activePointer.pathElement[0].id.indexOf('MarkerPointer') > -1) {
                                _this.markerDrag(_this.activeAxis, (_this.activeAxis.pointers[pointerIndex]));
                            }
                            else {
                                _this.barDrag(_this.activeAxis, (_this.activeAxis.pointers[pointerIndex]));
                            }
                            dragArgs.currentValue = _this.activePointer.currentValue;
                            _this.trigger(dragMove, dragArgs);
                        }
                    }
                }
                else {
                    if (args.target.id.indexOf('Pointer') > -1 && isNullOrUndefined(_this.activePointer)) {
                        var pointerIndex = parseInt(args.target.id.split('Pointer_')[1], 10);
                        var axisIndex = parseInt(args.target.id.split('AxisIndex_')[1].match(/\d/g)[0], 10);
                        if (_this.axes[axisIndex].pointers[pointerIndex].enableDrag) {
                            _this.element.style.cursor = 'pointer';
                        }
                    }
                    else {
                        _this.element.style.cursor = (_this.pointerDrag) ? _this.element.style.cursor : 'auto';
                    }
                }
                _this.gaugeOnMouseMove();
            }
        });
        this.notify(Browser.touchMoveEvent, e);
        if ((!isNullOrUndefined(args.target) && args.target.id === (this.element.id + '_LinearGaugeTitle')) || document.getElementById(this.element.id + '_EJ2_Title_Tooltip')) {
            this.titleTooltip(e, false);
        }
        return false;
    };
    LinearGauge.prototype.titleTooltip = function (event, isTitleTouch) {
        var targetId = event.target.id;
        if ((targetId === (this.element.id + '_LinearGaugeTitle')) && (event.target.textContent.indexOf('...') > -1)) {
            clearTimeout(this.tooltipTimeout);
            showTooltip(this.title, this);
            if (isTitleTouch) {
                this.tooltipTimeout = setTimeout(removeTooltip.bind(this), 2000);
            }
        }
        else {
            removeElement(this.element.id + '_EJ2_Title_Tooltip');
        }
    };
    /**
     * To find the mouse move on pointer.
     *
     * @param element
     */
    LinearGauge.prototype.moveOnPointer = function (element) {
        var clientRect = this.element.getBoundingClientRect();
        var isPointer = false;
        var top;
        var left;
        var pointerElement = getElement(element.id);
        var svgPath = pointerElement;
        var cursorStyle;
        var process;
        var current = getPointer(element, this);
        var axis = current.axis;
        var pointer = current.pointer;
        if (pointer.enableDrag) {
            if (pointer.type === 'Bar') {
                if (this.orientation === 'Vertical') {
                    top = pointerElement.getBoundingClientRect().top - clientRect.top;
                    top = (!axis.isInversed) ? top : top + svgPath.getBBox().height;
                    isPointer = !axis.isInversed ? (this.mouseY < (top + 10) && this.mouseY >= top) :
                        (this.mouseY <= top && this.mouseY > (top - 10));
                    cursorStyle = 'grabbing';
                }
                else {
                    left = pointerElement.getBoundingClientRect().left - clientRect.left;
                    left = (!axis.isInversed) ? left + svgPath.getBBox().width : left;
                    isPointer = !axis.isInversed ? (this.mouseX > (left - 10) && this.mouseX <= left) :
                        (this.mouseX >= left && this.mouseX < (left + 10));
                    cursorStyle = 'grabbing';
                }
            }
            else {
                isPointer = true;
                cursorStyle = 'grabbing';
            }
        }
        if (isPointer) {
            process = { pointer: isPointer, style: cursorStyle };
        }
        return process;
    };
    /**
     * Handle the right click
     *
     * @param {PointerEvent | TouchEvent} event - Specifies the pointer event argument.
     * @returns {boolean} - Specifies whether right click is performed on the Linear Gauge.
     * @private
     *
     */
    LinearGauge.prototype.gaugeRightClick = function (event) {
        if (event.buttons === 2 || event.pointerType === 'touch') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    };
    /**
     * Handles the mouse leave.
     *
     * @return {boolean}
     * @private
     */
    LinearGauge.prototype.mouseLeave = function (e) {
        this.activeAxis = null;
        this.activePointer = null;
        var args = this.getMouseArgs(e, 'touchmove', gaugeMouseLeave);
        this.trigger(gaugeMouseLeave, args);
        if (!isNullOrUndefined(this.mouseElement)) {
            this.mouseElement = null;
            this.pointerDrag = false;
        }
        return false;
    };
    /**
     * Handles the mouse move on gauge.
     *
     * @param {PointerEvent | TouchEvent} e - Specifies the pointer event argument.
     * @return {boolean}
     * @private
     */
    LinearGauge.prototype.gaugeOnMouseMove = function () {
        var current;
        if (this.pointerDrag) {
            current = getPointer(this.mouseElement, this);
            if (current.pointer.enableDrag && current.pointer.animationComplete) {
                this[current.pointer.type.toLowerCase() + 'Drag'](current.axis, current.pointer);
            }
        }
        return true;
    };
    /**
     * Handles the mouse up.
     *
     * @return {boolean}
     * @private
     */
    LinearGauge.prototype.mouseEnd = function (e) {
        this.isTouchPointer = false;
        this.setMouseXY(e);
        var isImage = isNullOrUndefined(this.activePointer) ? false : this.activePointer.markerType === 'Image';
        var args = this.getMouseArgs(e, 'touchend', gaugeMouseUp);
        this.trigger(gaugeMouseUp, args);
        if (this.activeAxis && this.activePointer) {
            var pointerInd = parseInt(this.activePointer.pathElement[0].id.slice(-1), 10);
            var axisInd = parseInt(this.activePointer.pathElement[0].id.split('_AxisIndex_')[1], 10);
            if (this.activePointer.enableDrag) {
                this.trigger(dragEnd, {
                    name: dragEnd,
                    axis: this.activeAxis,
                    pointer: this.activePointer,
                    currentValue: this.activePointer.currentValue,
                    axisIndex: axisInd,
                    pointerIndex: pointerInd
                });
                this.axes[axisInd].pointers[pointerInd].value = this.activePointer.currentValue;
                this.activeAxis = null;
                this.activePointer = null;
                this.isDrag = false;
                if (!isNullOrUndefined(this.mouseElement && !isImage)) {
                    this.triggerDragEvent(this.mouseElement);
                }
            }
        }
        if (!isNullOrUndefined(this.mouseElement)) {
            this.mouseElement = null;
            this.pointerDrag = false;
        }
        this.element.style.cursor = 'auto';
        this.notify(Browser.touchEndEvent, e);
        if (args.target.id === (this.element.id + '_LinearGaugeTitle') || document.getElementById(this.element.id + '_EJ2_Title_Tooltip')) {
            this.titleTooltip(e, true);
        }
        return true;
    };
    /**
     * This method handles the print functionality for linear gauge.
     *
     * @param id - Specifies the element to print the linear gauge.
     */
    LinearGauge.prototype.print = function (id) {
        if ((this.allowPrint) && (this.printModule)) {
            this.printModule.print(this, id);
        }
    };
    /**
     * This method handles the export functionality for linear gauge.
     *
     * @param {ExportType} type - Specifies the extension type of the exported document.
     * @param {string} fileName - Specifies file name for exporting the rendered Linear Gauge.
     * @param {PdfPageOrientation} orientation - Specifies the orientation of the PDF document.
     * @param {boolean} allowDownload - Specifies whether the exported file should be downloaded or not.
     * @returns {string} - Specifies the base64 string of the exported image which is returned when the allowDownload is set to false.
     */
    LinearGauge.prototype.export = function (type, fileName, orientation, allowDownload) {
        var _this = this;
        if (isNullOrUndefined(allowDownload)) {
            allowDownload = true;
        }
        if ((type !== 'PDF') && (this.allowImageExport) && (this.imageExportModule)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            return new Promise(function (resolve, reject) {
                resolve(_this.imageExportModule.export(_this, type, fileName, allowDownload));
            });
        }
        else if ((this.allowPdfExport) && (this.pdfExportModule)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            return new Promise(function (resolve, reject) {
                resolve(_this.pdfExportModule.export(_this, type, fileName, orientation, allowDownload));
            });
        }
        return null;
    };
    /**
     * Handles the mouse event arguments.
     *
     * @return {IMouseEventArgs}
     * @private
     */
    LinearGauge.prototype.getMouseArgs = function (e, type, name) {
        var rect = this.element.getBoundingClientRect();
        var location = new GaugeLocation(-rect.left, -rect.top);
        var isTouch = (e.type === type);
        location.x += isTouch ? e.changedTouches[0].clientX : e.clientX;
        location.y += isTouch ? e.changedTouches[0].clientY : e.clientY;
        return {
            cancel: false, name: name,
            model: this,
            x: location.x, y: location.y,
            target: isTouch ? e.target : e.target
        };
    };
    /**
     * @private
     * @param axis
     * @param pointer
     */
    LinearGauge.prototype.markerDrag = function (axis, pointer) {
        var options;
        var textOptions;
        var x;
        var y;
        var value = convertPixelToValue(this.element, this.mouseElement, this.orientation, axis, 'drag', new GaugeLocation(this.mouseX, this.mouseY));
        if (withInRange(value, null, null, axis.visibleRange.max, axis.visibleRange.min, 'pointer')) {
            options = new PathOption('pointerID', pointer.color || this.themeStyle.pointerColor, pointer.border.width, pointer.border.color, pointer.opacity, pointer.border.dashArray, null, '');
            if (this.orientation === 'Vertical') {
                pointer.bounds.y = this.mouseY;
            }
            else {
                pointer.bounds.x = this.mouseX + getExtraWidth(this.element);
            }
            pointer.currentValue = this.isTouch ? (pointer.startValue = value) : (pointer.value = value);
            if (pointer.markerType === 'Text') {
                textOptions = new TextOption('pointerID', x, y, 'middle', pointer.text, null, 'auto');
                textOptions = calculateTextPosition(pointer.bounds, pointer.markerType, textOptions, this.orientation, axis, pointer);
            }
            options = calculateShapes(pointer.bounds, pointer.markerType, new Size(pointer.width, pointer.height), pointer.imageUrl, options, this.orientation, axis, pointer);
            if (pointer.markerType === 'Image' || pointer.markerType === 'Text') {
                this.mouseElement.setAttribute('x', (pointer.markerType === 'Text' ? textOptions.x : pointer.bounds.x - (pointer.bounds.width / 2)).toString());
                this.mouseElement.setAttribute('y', (pointer.markerType === 'Text' ? textOptions.y : pointer.bounds.y - (pointer.bounds.height / 2)).toString());
            }
            else if (pointer.markerType === 'Circle') {
                this.mouseElement.setAttribute('cx', (options.cx).toString());
                this.mouseElement.setAttribute('cy', (options.cy).toString());
                this.mouseElement.setAttribute('r', (options.r).toString());
            }
            else {
                this.mouseElement.setAttribute('d', options.d);
            }
        }
    };
    /**
     * @private
     * @param axis
     * @param pointer
     */
    LinearGauge.prototype.barDrag = function (axis, pointer) {
        var line = axis.lineBounds;
        var range = axis.visibleRange;
        var isDrag;
        var lineHeight = (this.orientation === 'Vertical') ? line.height : line.width;
        var lineY = (this.orientation === 'Vertical') ? line.y : line.x;
        var path;
        var value1 = ((valueToCoefficient(range.min, axis, this.orientation, range) * lineHeight) + lineY);
        var value2 = ((valueToCoefficient(range.max, axis, this.orientation, range) * lineHeight) + lineY);
        if (this.orientation === 'Vertical') {
            isDrag = (!axis.isInversed) ? (this.mouseY > value2 && this.mouseY < value1) : (this.mouseY > value1 && this.mouseY < value2);
            if (isDrag) {
                if ((this.container.type === 'Normal' || this.container.width === 0) && !isNullOrUndefined(this.mouseElement)) {
                    if (!axis.isInversed) {
                        this.mouseElement.setAttribute('y', this.mouseY.toString());
                    }
                    this.mouseElement.setAttribute('height', Math.abs(value1 - this.mouseY).toString());
                }
                else {
                    if (!axis.isInversed) {
                        pointer.bounds.y = this.mouseY;
                    }
                    pointer.bounds.height = Math.abs(value1 - this.mouseY);
                }
            }
        }
        else {
            var extraWidth = getExtraWidth(this.element);
            isDrag = (!axis.isInversed) ? (this.mouseX + extraWidth > value1 && this.mouseX + extraWidth < value2) :
                (this.mouseX + extraWidth > value2 && this.mouseX + extraWidth < value1);
            if (isDrag) {
                if ((this.container.type === 'Normal' || this.container.width === 0) && !isNullOrUndefined(this.mouseElement)) {
                    if (axis.isInversed) {
                        this.mouseElement.setAttribute('x', (this.mouseX + extraWidth).toString());
                    }
                    this.mouseElement.setAttribute('width', Math.abs(value1 - (this.mouseX + extraWidth)).toString());
                }
                else {
                    if (axis.isInversed) {
                        pointer.bounds.x = this.mouseX + extraWidth;
                    }
                    pointer.bounds.width = Math.abs(value1 - (this.mouseX + extraWidth));
                }
            }
        }
        if (!isNullOrUndefined(this.mouseElement)) {
            var value = convertPixelToValue(this.element, this.mouseElement, this.orientation, axis, 'drag', new GaugeLocation(this.mouseX, this.mouseY));
            pointer.currentValue = this.isTouch ? (pointer.startValue = value) : (pointer.value = value);
        }
        if (isDrag && !isNullOrUndefined(this.mouseElement) && this.mouseElement.tagName === 'path') {
            path = getBox(pointer.bounds, this.container.type, this.orientation, new Size(pointer.bounds.width, pointer.bounds.height), 'bar', this.container.width, axis, pointer.roundedCornerRadius);
            this.mouseElement.setAttribute('d', path);
        }
    };
    /**
     * Triggers when drag the pointer
     *
     * @param activeElement
     */
    LinearGauge.prototype.triggerDragEvent = function (activeElement) {
        var _this = this;
        var active = getPointer(activeElement, this);
        var value = convertPixelToValue(this.element, activeElement, this.orientation, active.axis, 'tooltip', null);
        var dragArgs = {
            name: 'valueChange',
            gauge: this,
            element: activeElement,
            axisIndex: active.axisIndex,
            axis: active.axis,
            pointerIndex: active.pointerIndex,
            pointer: active.pointer,
            value: value
        };
        this.trigger(valueChange, dragArgs, function (pointerArgs) {
            if (value !== pointerArgs.value) {
                _this.setPointerValue(pointerArgs.axisIndex, pointerArgs.pointerIndex, pointerArgs.value);
            }
        });
    };
    /**
     * This method is used to set the pointer value in the linear gauge.
     *
     * @param {number} axisIndex - Specifies the index of the axis.
     * @param {number} pointerIndex - Specifies the index of the pointer.
     * @param {number} value - Specifies the pointer value.
     */
    LinearGauge.prototype.setPointerValue = function (axisIndex, pointerIndex, value) {
        if (!this.isDestroyed) {
            var axis = this.axes[axisIndex];
            var pointer = axis.pointers[pointerIndex];
            this.gaugeResized = false;
            if (this.allowLoadingAnimation) {
                this.allowLoadingAnimation = false;
                this.createSvg();
                this.renderGaugeElements();
                this.calculateBounds();
                this.renderAxisElements();
            }
            if (pointer.startValue !== value) {
                this.isPointerAnimationInProgress = false;
                var id = this.element.id + '_AxisIndex_' + axisIndex + '_' + pointer.type + 'Pointer_' + pointerIndex;
                var pointerElement = getElement(id);
                value = (value < axis.visibleRange.min) ? axis.visibleRange.min : ((value > axis.visibleRange.max) ?
                    axis.visibleRange.max : value);
                pointer.currentValue = value;
                pointer.isPointerAnimation = true;
                this.isPropertyChange = true;
                if ((pointerElement !== null) && withInRange(pointer.currentValue, null, null, axis.visibleRange.max, axis.visibleRange.min, 'pointer')) {
                    pointer.value = this.pointerDrag ? this.isTouch ? pointer.startValue : value : pointer.value;
                    this.gaugeAxisLayoutPanel['calculate' + pointer.type + 'Bounds'](axis, pointer);
                    this.axisRenderer['draw' + pointer.type + 'Pointer'](axis, axisIndex, pointer, pointerIndex, pointerElement.parentElement);
                }
                this.isProtectedOnChange = true;
                pointer.startValue = pointer.currentValue;
                pointer.currentValue = value;
                pointer.value = value;
                this.isProtectedOnChange = false;
            }
        }
    };
    /**
     * This method is used to set the annotation value in the linear gauge.
     *
     * @param {number} annotationIndex - Specifies the index value for the annotation in linear gauge.
     * @param {string | Function} content - Specifies the content for the annotation in linear gauge.
     * @param {number} axisValue - Specifies the axis value to which the annotation must be positioned.
     */
    LinearGauge.prototype.setAnnotationValue = function (annotationIndex, content, axisValue) {
        if (!this.isDestroyed) {
            var elementExist = getElement(this.element.id + '_Annotation_' + annotationIndex) === null;
            var element = getElement(this.element.id + '_AnnotationsGroup') ||
                createElement('div', {
                    id: this.element.id + '_AnnotationsGroup'
                });
            var annotation = this.annotations[annotationIndex];
            if (content !== null) {
                removeElement(this.element.id + '_Annotation_' + annotationIndex);
                annotation.content = content;
                annotation.axisValue = !isNullOrUndefined(axisValue) ? axisValue : annotation.axisValue;
                this.annotationsModule.createAnnotationTemplate(element, annotationIndex, this);
                if (!isNullOrUndefined(annotation.axisIndex)) {
                    var axis = this.axes[annotation.axisIndex];
                    var range = axis.visibleRange;
                    var annotationElement = getElement(this.element.id + '_Annotation_' + annotationIndex);
                    if (!elementExist && annotation.axisValue >= range.min && annotation.axisValue <= range.max
                        && !isNullOrUndefined(annotationElement) && typeof (annotationElement) === 'object') {
                        element.appendChild(annotationElement);
                    }
                }
                else if (!elementExist) {
                    var annotationElement = getElement(this.element.id + '_Annotation_' + annotationIndex);
                    if (!isNullOrUndefined(annotationElement) && typeof (annotationElement) === 'object') {
                        element.appendChild(annotationElement);
                    }
                }
            }
        }
    };
    LinearGauge.prototype.isGradientVisible = function () {
        var isVisible = false;
        for (var _i = 0, _a = this.axes; _i < _a.length; _i++) {
            var axis = _a[_i];
            for (var _b = 0, _c = axis.pointers; _b < _c.length; _b++) {
                var pointer = _c[_b];
                if (!isNullOrUndefined(pointer.linearGradient) || !isNullOrUndefined(pointer.radialGradient)) {
                    isVisible = true;
                    break;
                }
            }
            for (var _d = 0, _e = axis.ranges; _d < _e.length; _d++) {
                var range = _e[_d];
                if (!isNullOrUndefined(range.linearGradient) || !isNullOrUndefined(range.radialGradient)) {
                    isVisible = true;
                    break;
                }
            }
        }
        return isVisible;
    };
    /**
     * To provide the array of modules needed for control rendering
     *
     * @return {ModuleDeclaration[]}
     * @private
     */
    LinearGauge.prototype.requiredModules = function () {
        var modules = [];
        var annotationEnable = false;
        this.annotations.map(function (annotation) {
            if (!annotationEnable) {
                annotationEnable = ((!isNullOrUndefined(annotation.content) && annotation.content.length !== 0) || typeof (annotation.content) === 'function');
            }
        });
        if (annotationEnable) {
            modules.push({
                member: 'Annotations',
                args: [this, Annotations],
                name: 'Annotations'
            });
        }
        if (this.tooltip.enable) {
            modules.push({
                member: 'Tooltip',
                args: [this, GaugeTooltip],
                name: 'GaugeTooltip'
            });
        }
        if (this.allowPrint) {
            modules.push({
                member: 'Print',
                args: [this],
                name: 'Print'
            });
        }
        if (this.allowImageExport) {
            modules.push({
                member: 'ImageExport',
                args: [this],
                name: 'ImageExport'
            });
        }
        if (this.allowPdfExport) {
            modules.push({
                member: 'PdfExport',
                args: [this],
                name: 'PdfExport'
            });
        }
        if (this.isGradientVisible()) {
            modules.push({
                member: 'Gradient',
                args: [this, Gradient],
                name: 'Gradient'
            });
        }
        return modules;
    };
    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @private
     */
    LinearGauge.prototype.getPersistData = function () {
        var keyEntity = ['loaded'];
        return this.addOnPersist(keyEntity);
    };
    /**
     * Get component name
     *
     * @private
     */
    LinearGauge.prototype.getModuleName = function () {
        return 'lineargauge';
    };
    /**
     * Called internally if any of the property value changed.
     *
     * @private
     */
    LinearGauge.prototype.onPropertyChanged = function (newProp, oldProp) {
        if (!this.isDestroyed) {
            var renderer = false;
            var refreshBounds = false;
            this.allowLoadingAnimation = this.animationDuration > 0 && !this.isOverAllAnimationComplete ? true : false;
            this.isPropertyChange = this.animationDuration > 0 && !this.isOverAllAnimationComplete ? false : true;
            this.gaugeResized = false;
            for (var _i = 0, _a = Object.keys(newProp); _i < _a.length; _i++) {
                var prop = _a[_i];
                switch (prop) {
                    case 'height':
                    case 'width':
                    case 'margin':
                        this.createSvg();
                        refreshBounds = true;
                        break;
                    case 'title':
                        refreshBounds = (newProp.title === '' || oldProp.title === '');
                        renderer = !(newProp.title === '' || oldProp.title === '');
                        break;
                    case 'titleStyle':
                        if (newProp.titleStyle && newProp.titleStyle.size) {
                            refreshBounds = true;
                        }
                        else {
                            renderer = true;
                        }
                        break;
                    case 'border':
                        renderer = true;
                        break;
                    case 'background':
                        renderer = true;
                        break;
                    case 'container':
                        refreshBounds = true;
                        break;
                    case 'orientation':
                        this.isOverAllAnimationComplete = true;
                        this.isPointerAnimationInProgress = this.allowLoadingAnimation = false;
                        for (var i = 0; i < this.axes.length; i++) {
                            for (var j = 0; j < this.axes[i].pointers.length; j++) {
                                this.axes[i].pointers[j]['startValue'] = this.axes[i].minimum;
                                this.axes[i].pointers[j]['isPointerAnimation'] = true;
                            }
                        }
                        refreshBounds = true;
                        break;
                    case 'axes':
                        for (var x = 0; x < this.axes.length; x++) {
                            if (!isNullOrUndefined(newProp.axes[x])) {
                                var collection = Object.keys(newProp.axes[x]);
                                for (var _b = 0, collection_1 = collection; _b < collection_1.length; _b++) {
                                    var collectionProp = collection_1[_b];
                                    if (collectionProp === 'pointers') {
                                        var pointerPropertyLength = Object.keys(newProp.axes[x].pointers).length;
                                        for (var y = 0; y < pointerPropertyLength; y++) {
                                            var index = parseInt(Object.keys(newProp.axes[x].pointers)[y], 10);
                                            if (!isNaN(index) &&
                                                !isNullOrUndefined(Object.keys(newProp.axes[x].pointers[index]))) {
                                                this.allowLoadingAnimation = false;
                                                this.isPointerAnimationInProgress = false;
                                                this.axes[x].pointers[index]['startValue'] = this.axes[x].pointers[index]['currentValue'];
                                                this.axes[x].pointers[index]['isPointerAnimation'] = Object.keys(newProp.axes[x].pointers[index]).indexOf('value') > -1;
                                                if (this.pointerDrag) {
                                                    this.axes[x].pointers[index]['isPointerAnimation'] = false;
                                                    if (this.isTouchPointer &&
                                                        newProp.axes[x].pointers[index].text
                                                            !== oldProp.axes[x].pointers[index].text) {
                                                        var currentPointer = this.axes[x].pointers[index];
                                                        var pointerId = this.element.id + '_AxisIndex_' + x + '_' + currentPointer.type + 'Pointer' + '_' + index;
                                                        this.axisRenderer.updateTextPointer(pointerId, currentPointer, this.axes[x]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        refreshBounds = true;
                        break;
                }
            }
            if (!this.isTouchPointer && isNullOrUndefined(this.activePointer)) {
                if (!refreshBounds && renderer) {
                    this.removeSvg();
                    this.renderGaugeElements();
                    this.renderAxisElements();
                }
                if (refreshBounds || this.allowLoadingAnimation) {
                    this.createSvg();
                    this.renderGaugeElements();
                    this.calculateBounds();
                    this.renderAxisElements();
                    if (this.allowLoadingAnimation) {
                        this.allowLoadingAnimation = this.animationDuration > 0 && !this.isOverAllAnimationComplete ? true : false;
                        this.renderAnimation();
                    }
                }
            }
        }
    };
    __decorate([
        Property(null)
    ], LinearGauge.prototype, "width", void 0);
    __decorate([
        Property(true)
    ], LinearGauge.prototype, "allowMargin", void 0);
    __decorate([
        Property(null)
    ], LinearGauge.prototype, "height", void 0);
    __decorate([
        Property(0)
    ], LinearGauge.prototype, "animationDuration", void 0);
    __decorate([
        Property('Vertical')
    ], LinearGauge.prototype, "orientation", void 0);
    __decorate([
        Property('None')
    ], LinearGauge.prototype, "edgeLabelPlacement", void 0);
    __decorate([
        Property(false)
    ], LinearGauge.prototype, "allowPrint", void 0);
    __decorate([
        Property(false)
    ], LinearGauge.prototype, "allowImageExport", void 0);
    __decorate([
        Property(false)
    ], LinearGauge.prototype, "allowPdfExport", void 0);
    __decorate([
        Complex({}, Margin)
    ], LinearGauge.prototype, "margin", void 0);
    __decorate([
        Complex({ color: '', width: 0 }, Border)
    ], LinearGauge.prototype, "border", void 0);
    __decorate([
        Property(null)
    ], LinearGauge.prototype, "background", void 0);
    __decorate([
        Property('')
    ], LinearGauge.prototype, "title", void 0);
    __decorate([
        Complex({ size: null, color: null, fontFamily: null, fontStyle: null, fontWeight: null }, Font)
    ], LinearGauge.prototype, "titleStyle", void 0);
    __decorate([
        Complex({}, Container)
    ], LinearGauge.prototype, "container", void 0);
    __decorate([
        Collection([{}], Axis)
    ], LinearGauge.prototype, "axes", void 0);
    __decorate([
        Complex({}, TooltipSettings)
    ], LinearGauge.prototype, "tooltip", void 0);
    __decorate([
        Collection([{}], Annotation)
    ], LinearGauge.prototype, "annotations", void 0);
    __decorate([
        Property([])
    ], LinearGauge.prototype, "rangePalettes", void 0);
    __decorate([
        Property(false)
    ], LinearGauge.prototype, "useGroupingSeparator", void 0);
    __decorate([
        Property(null)
    ], LinearGauge.prototype, "description", void 0);
    __decorate([
        Property(0)
    ], LinearGauge.prototype, "tabIndex", void 0);
    __decorate([
        Property(null)
    ], LinearGauge.prototype, "format", void 0);
    __decorate([
        Property('Material')
    ], LinearGauge.prototype, "theme", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "loaded", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "load", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "animationComplete", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "axisLabelRender", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "dragStart", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "dragMove", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "dragEnd", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "annotationRender", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "tooltipRender", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "gaugeMouseMove", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "gaugeMouseLeave", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "gaugeMouseDown", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "gaugeMouseUp", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "valueChange", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "resized", void 0);
    __decorate([
        Event()
    ], LinearGauge.prototype, "beforePrint", void 0);
    LinearGauge = __decorate([
        NotifyPropertyChanges
    ], LinearGauge);
    return LinearGauge;
}(Component));
export { LinearGauge };
