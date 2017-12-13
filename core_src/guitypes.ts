
export enum Anchor {
    ANCHOR_TOPLEFT    = 1,
    ANCHOR_CENTER
}

export enum BackgroundImage {
    BACKGROUND_IMAGE_STRETCH  = 1,
    BACKGROUND_IMAGE_REPEAT,
    BACKGROUND_IMAGE_CENTER }

export enum MouseButton {
    MOUSEBUTTON_LEFT = 0,
    MOUSEBUTTON_MIDDLE,
    MOUSEBUTTON_RIGHT }

export enum State {
    STATE_NO_CHANGE = 0,
    STATE_CHANGE_TO_FRONT,
    STATE_CHANGE_TO_BACK,
    STATE_ICON_ADDED,
    STATE_COLOR_CHANGE }

export enum IconStyle {
    ICON_STYLE_NORMAL = 1,
    ICON_STYLE_STRETCHED }


export enum NodeOverlaps {
    NODE_NOT_INSIDE = 0,
    NODE_PARTIALLY_INSIDE = 1,
    NODE_FULLY_INSIDE = 2
}

export enum RenderType {
    RT_SQUARE         = 0,
    RT_POLYGON,
    RT_BORDER_SQUARE,
    RT_BORDER_POLY,
    RT_TEXT,
    RT_ICON
}
