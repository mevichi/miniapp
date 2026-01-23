declare module 'spin-wheel' {
  export interface ItemProps {
    backgroundColor?: string | null;
    image?: HTMLImageElement | null;
    imageOpacity?: number;
    imageRadius?: number;
    imageRotation?: number;
    imageScale?: number;
    label?: string;
    labelColor?: string | null;
    value?: any;
    weight?: number;
  }

  export interface WheelProps {
    borderColor?: string;
    borderWidth?: number;
    debug?: boolean;
    image?: HTMLImageElement;
    isInteractive?: boolean;
    itemBackgroundColors?: string[];
    itemLabelAlign?: string;
    itemLabelBaselineOffset?: number;
    itemLabelColors?: string[];
    itemLabelFont?: string;
    itemLabelFontSizeMax?: number;
    itemLabelRadius?: number;
    itemLabelRadiusMax?: number;
    itemLabelRotation?: number;
    itemLabelStrokeColor?: string;
    itemLabelStrokeWidth?: number;
    items?: ItemProps[];
    lineColor?: string;
    lineWidth?: number;
    pixelRatio?: number;
    radius?: number;
    rotation?: number;
    rotationResistance?: number;
    rotationSpeedMax?: number;
    offset?: { w: number; h: number };
    onCurrentIndexChange?: (event: any) => void;
    onRest?: (event: any) => void;
    onSpin?: (event: any) => void;
    overlayImage?: HTMLImageElement;
    pointerAngle?: number;
  }

  export class Item {
    constructor(wheel: Wheel, props?: ItemProps);
    init(props: ItemProps): void;

    backgroundColor: string | null;
    image: HTMLImageElement | null;
    imageOpacity: number;
    imageRadius: number;
    imageRotation: number;
    imageScale: number;
    label: string | null;
    labelColor: string | null;
    value: any;
    weight: number;

    getIndex(): number;
    getCenterAngle(): number;
    getStartAngle(): number;
    getEndAngle(): number;
    getRandomAngle(): number;
  }

  export class Wheel {
    constructor(container: Element, props?: WheelProps);

    init(props?: WheelProps): void;
    add(container: Element): void;
    remove(): void;
    resize(): void;
    draw(now?: number): void;
    spin(rotationSpeed?: number): void;
    spinTo(rotation?: number, duration?: number, easingFunction?: (n: number) => number): void;
    spinToItem(
      itemIndex?: number,
      duration?: number,
      spinToCenter?: boolean,
      numberOfRevolutions?: number,
      direction?: number,
      easingFunction?: (n: number) => number
    ): void;
    animate(newRotation: number, duration: number, easingFunction?: (n: number) => number): void;
    stop(): void;
    getScaledNumber(n: number): number;
    getActualPixelRatio(): number;
    wheelHitTest(point?: { x: number; y: number }): boolean;
    refreshCursor(): void;
    getAngleFromCenter(point?: { x: number; y: number }): number;
    getCurrentIndex(): number;
    refreshCurrentIndex(angles?: number[]): void;
    getItemAngles(initialRotation?: number): number[];
    refresh(): void;
    limitSpeed(speed?: number, max?: number): number;
    beginSpin(speed?: number, spinMethod?: string): void;
    refreshAriaLabel(): void;
    dragStart(point?: { x: number; y: number }): void;
    dragMove(point?: { x: number; y: number }): void;
    dragEnd(): void;
    isDragEventTooOld(now?: number, event?: any): boolean;
    raiseEvent_onCurrentIndexChange(data?: any): void;
    raiseEvent_onRest(data?: any): void;
    raiseEvent_onSpin(data?: any): void;

    borderColor: string;
    borderWidth: number;
    debug: boolean;
    image: HTMLImageElement;
    isInteractive: boolean;
    itemBackgroundColors: string[];
    itemLabelAlign: string;
    itemLabelBaselineOffset: number;
    itemLabelColors: string[];
    itemLabelFont: string;
    itemLabelFontSizeMax: number;
    itemLabelRadius: number;
    itemLabelRadiusMax: number;
    itemLabelRotation: number;
    itemLabelStrokeColor: string;
    itemLabelStrokeWidth: number;
    items: ItemProps[];
    lineColor: string;
    lineWidth: number;
    offset: { w: number; h: number };
    onCurrentIndexChange: (event: any) => void;
    onRest: (event: any) => void;
    onSpin: (event: any) => void;
    overlayImage: HTMLImageElement;
    pointerAngle: number;
    pixelRatio: number;
    radius: number;
    rotation: number;
    readonly rotationSpeed: number;
    rotationResistance: number;
    rotationSpeedMax: number;
  }
}
