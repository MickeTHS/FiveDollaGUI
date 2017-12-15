"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Anchor;
(function (Anchor) {
    Anchor[Anchor["ANCHOR_TOPLEFT"] = 1] = "ANCHOR_TOPLEFT";
    Anchor[Anchor["ANCHOR_CENTER"] = 2] = "ANCHOR_CENTER";
})(Anchor = exports.Anchor || (exports.Anchor = {}));
var BackgroundImage;
(function (BackgroundImage) {
    BackgroundImage[BackgroundImage["BACKGROUND_IMAGE_STRETCH"] = 1] = "BACKGROUND_IMAGE_STRETCH";
    BackgroundImage[BackgroundImage["BACKGROUND_IMAGE_REPEAT"] = 2] = "BACKGROUND_IMAGE_REPEAT";
    BackgroundImage[BackgroundImage["BACKGROUND_IMAGE_CENTER"] = 3] = "BACKGROUND_IMAGE_CENTER";
})(BackgroundImage = exports.BackgroundImage || (exports.BackgroundImage = {}));
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["MOUSEBUTTON_LEFT"] = 0] = "MOUSEBUTTON_LEFT";
    MouseButton[MouseButton["MOUSEBUTTON_MIDDLE"] = 1] = "MOUSEBUTTON_MIDDLE";
    MouseButton[MouseButton["MOUSEBUTTON_RIGHT"] = 2] = "MOUSEBUTTON_RIGHT";
})(MouseButton = exports.MouseButton || (exports.MouseButton = {}));
var State;
(function (State) {
    State[State["STATE_NO_CHANGE"] = 0] = "STATE_NO_CHANGE";
    State[State["STATE_CHANGE_TO_FRONT"] = 1] = "STATE_CHANGE_TO_FRONT";
    State[State["STATE_CHANGE_TO_BACK"] = 2] = "STATE_CHANGE_TO_BACK";
    State[State["STATE_ICON_ADDED"] = 3] = "STATE_ICON_ADDED";
    State[State["STATE_COLOR_CHANGE"] = 4] = "STATE_COLOR_CHANGE";
})(State = exports.State || (exports.State = {}));
var IconStyle;
(function (IconStyle) {
    IconStyle[IconStyle["ICON_STYLE_NORMAL"] = 1] = "ICON_STYLE_NORMAL";
    IconStyle[IconStyle["ICON_STYLE_STRETCHED"] = 2] = "ICON_STYLE_STRETCHED";
})(IconStyle = exports.IconStyle || (exports.IconStyle = {}));
var NodeOverlaps;
(function (NodeOverlaps) {
    NodeOverlaps[NodeOverlaps["NODE_NOT_INSIDE"] = 0] = "NODE_NOT_INSIDE";
    NodeOverlaps[NodeOverlaps["NODE_PARTIALLY_INSIDE"] = 1] = "NODE_PARTIALLY_INSIDE";
    NodeOverlaps[NodeOverlaps["NODE_FULLY_INSIDE"] = 2] = "NODE_FULLY_INSIDE";
})(NodeOverlaps = exports.NodeOverlaps || (exports.NodeOverlaps = {}));
var RenderType;
(function (RenderType) {
    RenderType[RenderType["RT_SQUARE"] = 0] = "RT_SQUARE";
    RenderType[RenderType["RT_POLYGON"] = 1] = "RT_POLYGON";
    RenderType[RenderType["RT_BORDER_SQUARE"] = 2] = "RT_BORDER_SQUARE";
    RenderType[RenderType["RT_BORDER_POLY"] = 3] = "RT_BORDER_POLY";
    RenderType[RenderType["RT_TEXT"] = 4] = "RT_TEXT";
    RenderType[RenderType["RT_ICON"] = 5] = "RT_ICON";
})(RenderType = exports.RenderType || (exports.RenderType = {}));
