import {
  NoCompactStyle,
  NoFormStyle
} from "./chunk-EPSJL57N.js";
import {
  collapse_default
} from "./chunk-YCAGDL42.js";
import {
  _classCallCheck,
  _createClass,
  _createSuper,
  _inherits,
  _toConsumableArray,
  useEvent,
  useLocale_default,
  useMergedState,
  useToken
} from "./chunk-23FKWOUE.js";
import {
  FastColor,
  _defineProperty,
  _extends,
  _objectSpread2,
  _objectWithoutProperties,
  _slicedToArray,
  _typeof,
  require_classnames
} from "./chunk-QKEA2ZC6.js";
import {
  require_react
} from "./chunk-JUEE6Y66.js";
import {
  __toESM
} from "./chunk-KEXKKQVW.js";

// node_modules/antd/es/_util/ContextIsolator.js
var import_react = __toESM(require_react());
var ContextIsolator = (props) => {
  const {
    space,
    form,
    children
  } = props;
  if (children === void 0 || children === null) {
    return null;
  }
  let result = children;
  if (form) {
    result = import_react.default.createElement(NoFormStyle, {
      override: true,
      status: true
    }, result);
  }
  if (space) {
    result = import_react.default.createElement(NoCompactStyle, null, result);
  }
  return result;
};
var ContextIsolator_default = ContextIsolator;

// node_modules/@rc-component/color-picker/es/ColorPicker.js
var import_react11 = __toESM(require_react());

// node_modules/@rc-component/color-picker/es/color.js
var _excluded = ["b"];
var _excluded2 = ["v"];
var getRoundNumber = function getRoundNumber2(value) {
  return Math.round(Number(value || 0));
};
var convertHsb2Hsv = function convertHsb2Hsv2(color) {
  if (color instanceof FastColor) {
    return color;
  }
  if (color && _typeof(color) === "object" && "h" in color && "b" in color) {
    var _ref = color, b = _ref.b, resets = _objectWithoutProperties(_ref, _excluded);
    return _objectSpread2(_objectSpread2({}, resets), {}, {
      v: b
    });
  }
  if (typeof color === "string" && /hsb/.test(color)) {
    return color.replace(/hsb/, "hsv");
  }
  return color;
};
var Color = function(_FastColor) {
  _inherits(Color2, _FastColor);
  var _super = _createSuper(Color2);
  function Color2(color) {
    _classCallCheck(this, Color2);
    return _super.call(this, convertHsb2Hsv(color));
  }
  _createClass(Color2, [{
    key: "toHsbString",
    value: function toHsbString() {
      var hsb = this.toHsb();
      var saturation = getRoundNumber(hsb.s * 100);
      var lightness = getRoundNumber(hsb.b * 100);
      var hue = getRoundNumber(hsb.h);
      var alpha = hsb.a;
      var hsbString = "hsb(".concat(hue, ", ").concat(saturation, "%, ").concat(lightness, "%)");
      var hsbaString = "hsba(".concat(hue, ", ").concat(saturation, "%, ").concat(lightness, "%, ").concat(alpha.toFixed(alpha === 0 ? 0 : 2), ")");
      return alpha === 1 ? hsbString : hsbaString;
    }
  }, {
    key: "toHsb",
    value: function toHsb() {
      var _this$toHsv = this.toHsv(), v = _this$toHsv.v, resets = _objectWithoutProperties(_this$toHsv, _excluded2);
      return _objectSpread2(_objectSpread2({}, resets), {}, {
        b: v,
        a: this.a
      });
    }
  }]);
  return Color2;
}(FastColor);

// node_modules/@rc-component/color-picker/es/util.js
var ColorPickerPrefixCls = "rc-color-picker";
var generateColor = function generateColor2(color) {
  if (color instanceof Color) {
    return color;
  }
  return new Color(color);
};
var defaultColor = generateColor("#1677ff");
var calculateColor = function calculateColor2(props) {
  var offset = props.offset, targetRef = props.targetRef, containerRef = props.containerRef, color = props.color, type = props.type;
  var _containerRef$current = containerRef.current.getBoundingClientRect(), width = _containerRef$current.width, height = _containerRef$current.height;
  var _targetRef$current$ge = targetRef.current.getBoundingClientRect(), targetWidth = _targetRef$current$ge.width, targetHeight = _targetRef$current$ge.height;
  var centerOffsetX = targetWidth / 2;
  var centerOffsetY = targetHeight / 2;
  var saturation = (offset.x + centerOffsetX) / width;
  var bright = 1 - (offset.y + centerOffsetY) / height;
  var hsb = color.toHsb();
  var alphaOffset = saturation;
  var hueOffset = (offset.x + centerOffsetX) / width * 360;
  if (type) {
    switch (type) {
      case "hue":
        return generateColor(_objectSpread2(_objectSpread2({}, hsb), {}, {
          h: hueOffset <= 0 ? 0 : hueOffset
        }));
      case "alpha":
        return generateColor(_objectSpread2(_objectSpread2({}, hsb), {}, {
          a: alphaOffset <= 0 ? 0 : alphaOffset
        }));
    }
  }
  return generateColor({
    h: hsb.h,
    s: saturation <= 0 ? 0 : saturation,
    b: bright >= 1 ? 1 : bright,
    a: hsb.a
  });
};
var calcOffset = function calcOffset2(color, type) {
  var hsb = color.toHsb();
  switch (type) {
    case "hue":
      return {
        x: hsb.h / 360 * 100,
        y: 50
      };
    case "alpha":
      return {
        x: color.a * 100,
        y: 50
      };
    // Picker panel
    default:
      return {
        x: hsb.s * 100,
        y: (1 - hsb.b) * 100
      };
  }
};

// node_modules/@rc-component/color-picker/es/ColorPicker.js
var import_classnames4 = __toESM(require_classnames());

// node_modules/@rc-component/color-picker/es/components/ColorBlock.js
var import_classnames = __toESM(require_classnames());
var import_react2 = __toESM(require_react());
var ColorBlock = function ColorBlock2(_ref) {
  var color = _ref.color, prefixCls = _ref.prefixCls, className = _ref.className, style = _ref.style, onClick = _ref.onClick;
  var colorBlockCls = "".concat(prefixCls, "-color-block");
  return import_react2.default.createElement("div", {
    className: (0, import_classnames.default)(colorBlockCls, className),
    style,
    onClick
  }, import_react2.default.createElement("div", {
    className: "".concat(colorBlockCls, "-inner"),
    style: {
      background: color
    }
  }));
};
var ColorBlock_default = ColorBlock;

// node_modules/@rc-component/color-picker/es/components/Picker.js
var import_react7 = __toESM(require_react());

// node_modules/@rc-component/color-picker/es/hooks/useColorDrag.js
var import_react3 = __toESM(require_react());
function getPosition(e) {
  var obj = "touches" in e ? e.touches[0] : e;
  var scrollXOffset = document.documentElement.scrollLeft || document.body.scrollLeft || window.pageXOffset;
  var scrollYOffset = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
  return {
    pageX: obj.pageX - scrollXOffset,
    pageY: obj.pageY - scrollYOffset
  };
}
function useColorDrag(props) {
  var targetRef = props.targetRef, containerRef = props.containerRef, direction = props.direction, onDragChange = props.onDragChange, onDragChangeComplete = props.onDragChangeComplete, calculate = props.calculate, color = props.color, disabledDrag = props.disabledDrag;
  var _useState = (0, import_react3.useState)({
    x: 0,
    y: 0
  }), _useState2 = _slicedToArray(_useState, 2), offsetValue = _useState2[0], setOffsetValue = _useState2[1];
  var mouseMoveRef = (0, import_react3.useRef)(null);
  var mouseUpRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(function() {
    setOffsetValue(calculate());
  }, [color]);
  (0, import_react3.useEffect)(function() {
    return function() {
      document.removeEventListener("mousemove", mouseMoveRef.current);
      document.removeEventListener("mouseup", mouseUpRef.current);
      document.removeEventListener("touchmove", mouseMoveRef.current);
      document.removeEventListener("touchend", mouseUpRef.current);
      mouseMoveRef.current = null;
      mouseUpRef.current = null;
    };
  }, []);
  var updateOffset = function updateOffset2(e) {
    var _getPosition = getPosition(e), pageX = _getPosition.pageX, pageY = _getPosition.pageY;
    var _containerRef$current = containerRef.current.getBoundingClientRect(), rectX = _containerRef$current.x, rectY = _containerRef$current.y, width = _containerRef$current.width, height = _containerRef$current.height;
    var _targetRef$current$ge = targetRef.current.getBoundingClientRect(), targetWidth = _targetRef$current$ge.width, targetHeight = _targetRef$current$ge.height;
    var centerOffsetX = targetWidth / 2;
    var centerOffsetY = targetHeight / 2;
    var offsetX = Math.max(0, Math.min(pageX - rectX, width)) - centerOffsetX;
    var offsetY = Math.max(0, Math.min(pageY - rectY, height)) - centerOffsetY;
    var calcOffset3 = {
      x: offsetX,
      y: direction === "x" ? offsetValue.y : offsetY
    };
    if (targetWidth === 0 && targetHeight === 0 || targetWidth !== targetHeight) {
      return false;
    }
    onDragChange === null || onDragChange === void 0 || onDragChange(calcOffset3);
  };
  var onDragMove = function onDragMove2(e) {
    e.preventDefault();
    updateOffset(e);
  };
  var onDragStop = function onDragStop2(e) {
    e.preventDefault();
    document.removeEventListener("mousemove", mouseMoveRef.current);
    document.removeEventListener("mouseup", mouseUpRef.current);
    document.removeEventListener("touchmove", mouseMoveRef.current);
    document.removeEventListener("touchend", mouseUpRef.current);
    mouseMoveRef.current = null;
    mouseUpRef.current = null;
    onDragChangeComplete === null || onDragChangeComplete === void 0 || onDragChangeComplete();
  };
  var onDragStart = function onDragStart2(e) {
    document.removeEventListener("mousemove", mouseMoveRef.current);
    document.removeEventListener("mouseup", mouseUpRef.current);
    if (disabledDrag) {
      return;
    }
    updateOffset(e);
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragStop);
    document.addEventListener("touchmove", onDragMove);
    document.addEventListener("touchend", onDragStop);
    mouseMoveRef.current = onDragMove;
    mouseUpRef.current = onDragStop;
  };
  return [offsetValue, onDragStart];
}
var useColorDrag_default = useColorDrag;

// node_modules/@rc-component/color-picker/es/components/Handler.js
var import_classnames2 = __toESM(require_classnames());
var import_react4 = __toESM(require_react());
var Handler = function Handler2(_ref) {
  var _ref$size = _ref.size, size = _ref$size === void 0 ? "default" : _ref$size, color = _ref.color, prefixCls = _ref.prefixCls;
  return import_react4.default.createElement("div", {
    className: (0, import_classnames2.default)("".concat(prefixCls, "-handler"), _defineProperty({}, "".concat(prefixCls, "-handler-sm"), size === "small")),
    style: {
      backgroundColor: color
    }
  });
};
var Handler_default = Handler;

// node_modules/@rc-component/color-picker/es/components/Palette.js
var import_react5 = __toESM(require_react());
var Palette = function Palette2(_ref) {
  var children = _ref.children, style = _ref.style, prefixCls = _ref.prefixCls;
  return import_react5.default.createElement("div", {
    className: "".concat(prefixCls, "-palette"),
    style: _objectSpread2({
      position: "relative"
    }, style)
  }, children);
};
var Palette_default = Palette;

// node_modules/@rc-component/color-picker/es/components/Transform.js
var import_react6 = __toESM(require_react());
var Transform = (0, import_react6.forwardRef)(function(props, ref) {
  var children = props.children, x = props.x, y = props.y;
  return import_react6.default.createElement("div", {
    ref,
    style: {
      position: "absolute",
      left: "".concat(x, "%"),
      top: "".concat(y, "%"),
      zIndex: 1,
      transform: "translate(-50%, -50%)"
    }
  }, children);
});
var Transform_default = Transform;

// node_modules/@rc-component/color-picker/es/components/Picker.js
var Picker = function Picker2(_ref) {
  var color = _ref.color, onChange = _ref.onChange, prefixCls = _ref.prefixCls, onChangeComplete = _ref.onChangeComplete, disabled = _ref.disabled;
  var pickerRef = (0, import_react7.useRef)();
  var transformRef = (0, import_react7.useRef)();
  var colorRef = (0, import_react7.useRef)(color);
  var onDragChange = useEvent(function(offsetValue) {
    var calcColor = calculateColor({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: pickerRef,
      color
    });
    colorRef.current = calcColor;
    onChange(calcColor);
  });
  var _useColorDrag = useColorDrag_default({
    color,
    containerRef: pickerRef,
    targetRef: transformRef,
    calculate: function calculate() {
      return calcOffset(color);
    },
    onDragChange,
    onDragChangeComplete: function onDragChangeComplete() {
      return onChangeComplete === null || onChangeComplete === void 0 ? void 0 : onChangeComplete(colorRef.current);
    },
    disabledDrag: disabled
  }), _useColorDrag2 = _slicedToArray(_useColorDrag, 2), offset = _useColorDrag2[0], dragStartHandle = _useColorDrag2[1];
  return import_react7.default.createElement("div", {
    ref: pickerRef,
    className: "".concat(prefixCls, "-select"),
    onMouseDown: dragStartHandle,
    onTouchStart: dragStartHandle
  }, import_react7.default.createElement(Palette_default, {
    prefixCls
  }, import_react7.default.createElement(Transform_default, {
    x: offset.x,
    y: offset.y,
    ref: transformRef
  }, import_react7.default.createElement(Handler_default, {
    color: color.toRgbString(),
    prefixCls
  })), import_react7.default.createElement("div", {
    className: "".concat(prefixCls, "-saturation"),
    style: {
      backgroundColor: "hsl(".concat(color.toHsb().h, ",100%, 50%)"),
      backgroundImage: "linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))"
    }
  })));
};
var Picker_default = Picker;

// node_modules/@rc-component/color-picker/es/hooks/useColorState.js
var import_react8 = __toESM(require_react());
var useColorState = function useColorState2(defaultValue, value) {
  var _useMergedState = useMergedState(defaultValue, {
    value
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedValue = _useMergedState2[0], setValue = _useMergedState2[1];
  var color = (0, import_react8.useMemo)(function() {
    return generateColor(mergedValue);
  }, [mergedValue]);
  return [color, setValue];
};
var useColorState_default = useColorState;

// node_modules/@rc-component/color-picker/es/hooks/useComponent.js
var React9 = __toESM(require_react());

// node_modules/@rc-component/color-picker/es/components/Slider.js
var import_react10 = __toESM(require_react());
var import_classnames3 = __toESM(require_classnames());

// node_modules/@rc-component/color-picker/es/components/Gradient.js
var import_react9 = __toESM(require_react());
var Gradient = function Gradient2(_ref) {
  var colors = _ref.colors, children = _ref.children, _ref$direction = _ref.direction, direction = _ref$direction === void 0 ? "to right" : _ref$direction, type = _ref.type, prefixCls = _ref.prefixCls;
  var gradientColors = (0, import_react9.useMemo)(function() {
    return colors.map(function(color, idx) {
      var result = generateColor(color);
      if (type === "alpha" && idx === colors.length - 1) {
        result = new Color(result.setA(1));
      }
      return result.toRgbString();
    }).join(",");
  }, [colors, type]);
  return import_react9.default.createElement("div", {
    className: "".concat(prefixCls, "-gradient"),
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(".concat(direction, ", ").concat(gradientColors, ")")
    }
  }, children);
};
var Gradient_default = Gradient;

// node_modules/@rc-component/color-picker/es/components/Slider.js
var Slider = function Slider2(props) {
  var prefixCls = props.prefixCls, colors = props.colors, disabled = props.disabled, onChange = props.onChange, onChangeComplete = props.onChangeComplete, color = props.color, type = props.type;
  var sliderRef = (0, import_react10.useRef)();
  var transformRef = (0, import_react10.useRef)();
  var colorRef = (0, import_react10.useRef)(color);
  var getValue = function getValue2(c) {
    return type === "hue" ? c.getHue() : c.a * 100;
  };
  var onDragChange = useEvent(function(offsetValue) {
    var calcColor = calculateColor({
      offset: offsetValue,
      targetRef: transformRef,
      containerRef: sliderRef,
      color,
      type
    });
    colorRef.current = calcColor;
    onChange(getValue(calcColor));
  });
  var _useColorDrag = useColorDrag_default({
    color,
    targetRef: transformRef,
    containerRef: sliderRef,
    calculate: function calculate() {
      return calcOffset(color, type);
    },
    onDragChange,
    onDragChangeComplete: function onDragChangeComplete() {
      onChangeComplete(getValue(colorRef.current));
    },
    direction: "x",
    disabledDrag: disabled
  }), _useColorDrag2 = _slicedToArray(_useColorDrag, 2), offset = _useColorDrag2[0], dragStartHandle = _useColorDrag2[1];
  var handleColor = import_react10.default.useMemo(function() {
    if (type === "hue") {
      var hsb = color.toHsb();
      hsb.s = 1;
      hsb.b = 1;
      hsb.a = 1;
      var lightColor = new Color(hsb);
      return lightColor;
    }
    return color;
  }, [color, type]);
  var gradientList = import_react10.default.useMemo(function() {
    return colors.map(function(info) {
      return "".concat(info.color, " ").concat(info.percent, "%");
    });
  }, [colors]);
  return import_react10.default.createElement("div", {
    ref: sliderRef,
    className: (0, import_classnames3.default)("".concat(prefixCls, "-slider"), "".concat(prefixCls, "-slider-").concat(type)),
    onMouseDown: dragStartHandle,
    onTouchStart: dragStartHandle
  }, import_react10.default.createElement(Palette_default, {
    prefixCls
  }, import_react10.default.createElement(Transform_default, {
    x: offset.x,
    y: offset.y,
    ref: transformRef
  }, import_react10.default.createElement(Handler_default, {
    size: "small",
    color: handleColor.toHexString(),
    prefixCls
  })), import_react10.default.createElement(Gradient_default, {
    colors: gradientList,
    type,
    prefixCls
  })));
};
var Slider_default = Slider;

// node_modules/@rc-component/color-picker/es/hooks/useComponent.js
function useComponent(components) {
  return React9.useMemo(function() {
    var _ref = components || {}, slider = _ref.slider;
    return [slider || Slider_default];
  }, [components]);
}

// node_modules/@rc-component/color-picker/es/ColorPicker.js
var HUE_COLORS = [{
  color: "rgb(255, 0, 0)",
  percent: 0
}, {
  color: "rgb(255, 255, 0)",
  percent: 17
}, {
  color: "rgb(0, 255, 0)",
  percent: 33
}, {
  color: "rgb(0, 255, 255)",
  percent: 50
}, {
  color: "rgb(0, 0, 255)",
  percent: 67
}, {
  color: "rgb(255, 0, 255)",
  percent: 83
}, {
  color: "rgb(255, 0, 0)",
  percent: 100
}];
var ColorPicker = (0, import_react11.forwardRef)(function(props, ref) {
  var value = props.value, defaultValue = props.defaultValue, _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? ColorPickerPrefixCls : _props$prefixCls, onChange = props.onChange, onChangeComplete = props.onChangeComplete, className = props.className, style = props.style, panelRender = props.panelRender, _props$disabledAlpha = props.disabledAlpha, disabledAlpha = _props$disabledAlpha === void 0 ? false : _props$disabledAlpha, _props$disabled = props.disabled, disabled = _props$disabled === void 0 ? false : _props$disabled, components = props.components;
  var _useComponent = useComponent(components), _useComponent2 = _slicedToArray(_useComponent, 1), Slider3 = _useComponent2[0];
  var _useColorState = useColorState_default(defaultValue || defaultColor, value), _useColorState2 = _slicedToArray(_useColorState, 2), colorValue = _useColorState2[0], setColorValue = _useColorState2[1];
  var alphaColor = (0, import_react11.useMemo)(function() {
    return colorValue.setA(1).toRgbString();
  }, [colorValue]);
  var handleChange = function handleChange2(data, type) {
    if (!value) {
      setColorValue(data);
    }
    onChange === null || onChange === void 0 || onChange(data, type);
  };
  var getHueColor = function getHueColor2(hue) {
    return new Color(colorValue.setHue(hue));
  };
  var getAlphaColor = function getAlphaColor2(alpha) {
    return new Color(colorValue.setA(alpha / 100));
  };
  var onHueChange = function onHueChange2(hue) {
    handleChange(getHueColor(hue), {
      type: "hue",
      value: hue
    });
  };
  var onAlphaChange = function onAlphaChange2(alpha) {
    handleChange(getAlphaColor(alpha), {
      type: "alpha",
      value: alpha
    });
  };
  var onHueChangeComplete = function onHueChangeComplete2(hue) {
    if (onChangeComplete) {
      onChangeComplete(getHueColor(hue));
    }
  };
  var onAlphaChangeComplete = function onAlphaChangeComplete2(alpha) {
    if (onChangeComplete) {
      onChangeComplete(getAlphaColor(alpha));
    }
  };
  var mergeCls = (0, import_classnames4.default)("".concat(prefixCls, "-panel"), className, _defineProperty({}, "".concat(prefixCls, "-panel-disabled"), disabled));
  var sharedSliderProps = {
    prefixCls,
    disabled,
    color: colorValue
  };
  var defaultPanel = import_react11.default.createElement(import_react11.default.Fragment, null, import_react11.default.createElement(Picker_default, _extends({
    onChange: handleChange
  }, sharedSliderProps, {
    onChangeComplete
  })), import_react11.default.createElement("div", {
    className: "".concat(prefixCls, "-slider-container")
  }, import_react11.default.createElement("div", {
    className: (0, import_classnames4.default)("".concat(prefixCls, "-slider-group"), _defineProperty({}, "".concat(prefixCls, "-slider-group-disabled-alpha"), disabledAlpha))
  }, import_react11.default.createElement(Slider3, _extends({}, sharedSliderProps, {
    type: "hue",
    colors: HUE_COLORS,
    min: 0,
    max: 359,
    value: colorValue.getHue(),
    onChange: onHueChange,
    onChangeComplete: onHueChangeComplete
  })), !disabledAlpha && import_react11.default.createElement(Slider3, _extends({}, sharedSliderProps, {
    type: "alpha",
    colors: [{
      percent: 0,
      color: "rgba(255, 0, 4, 0)"
    }, {
      percent: 100,
      color: alphaColor
    }],
    min: 0,
    max: 100,
    value: colorValue.a * 100,
    onChange: onAlphaChange,
    onChangeComplete: onAlphaChangeComplete
  }))), import_react11.default.createElement(ColorBlock_default, {
    color: colorValue.toRgbString(),
    prefixCls
  })));
  return import_react11.default.createElement("div", {
    className: mergeCls,
    style,
    ref
  }, typeof panelRender === "function" ? panelRender(defaultPanel) : defaultPanel);
});
if (true) {
  ColorPicker.displayName = "ColorPicker";
}
var ColorPicker_default = ColorPicker;

// node_modules/@rc-component/color-picker/es/index.js
var es_default = ColorPicker_default;

// node_modules/antd/es/color-picker/color.js
var toHexFormat = (value, alpha) => (value === null || value === void 0 ? void 0 : value.replace(/[^\w/]/g, "").slice(0, alpha ? 8 : 6)) || "";
var getHex = (value, alpha) => value ? toHexFormat(value, alpha) : "";
var AggregationColor = function() {
  function AggregationColor2(color) {
    _classCallCheck(this, AggregationColor2);
    var _a;
    this.cleared = false;
    if (color instanceof AggregationColor2) {
      this.metaColor = color.metaColor.clone();
      this.colors = (_a = color.colors) === null || _a === void 0 ? void 0 : _a.map((info) => ({
        color: new AggregationColor2(info.color),
        percent: info.percent
      }));
      this.cleared = color.cleared;
      return;
    }
    const isArray = Array.isArray(color);
    if (isArray && color.length) {
      this.colors = color.map(({
        color: c,
        percent
      }) => ({
        color: new AggregationColor2(c),
        percent
      }));
      this.metaColor = new Color(this.colors[0].color.metaColor);
    } else {
      this.metaColor = new Color(isArray ? "" : color);
    }
    if (!color || isArray && !this.colors) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }
  return _createClass(AggregationColor2, [{
    key: "toHsb",
    value: function toHsb() {
      return this.metaColor.toHsb();
    }
  }, {
    key: "toHsbString",
    value: function toHsbString() {
      return this.metaColor.toHsbString();
    }
  }, {
    key: "toHex",
    value: function toHex() {
      return getHex(this.toHexString(), this.metaColor.a < 1);
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      return this.metaColor.toHexString();
    }
  }, {
    key: "toRgb",
    value: function toRgb() {
      return this.metaColor.toRgb();
    }
  }, {
    key: "toRgbString",
    value: function toRgbString() {
      return this.metaColor.toRgbString();
    }
  }, {
    key: "isGradient",
    value: function isGradient() {
      return !!this.colors && !this.cleared;
    }
  }, {
    key: "getColors",
    value: function getColors() {
      return this.colors || [{
        color: this,
        percent: 0
      }];
    }
  }, {
    key: "toCssString",
    value: function toCssString() {
      const {
        colors
      } = this;
      if (colors) {
        const colorsStr = colors.map((c) => `${c.color.toRgbString()} ${c.percent}%`).join(", ");
        return `linear-gradient(90deg, ${colorsStr})`;
      }
      return this.metaColor.toRgbString();
    }
  }, {
    key: "equals",
    value: function equals(color) {
      if (!color || this.isGradient() !== color.isGradient()) {
        return false;
      }
      if (!this.isGradient()) {
        return this.toHexString() === color.toHexString();
      }
      return this.colors.length === color.colors.length && this.colors.every((c, i) => {
        const target = color.colors[i];
        return c.percent === target.percent && c.color.equals(target.color);
      });
    }
  }]);
}();

// node_modules/antd/es/color-picker/util.js
var generateColor3 = (color) => {
  if (color instanceof AggregationColor) {
    return color;
  }
  return new AggregationColor(color);
};
var getRoundNumber3 = (value) => Math.round(Number(value || 0));
var getColorAlpha = (color) => getRoundNumber3(color.toHsb().a * 100);
var genAlphaColor = (color, alpha) => {
  const rgba = color.toRgb();
  if (!rgba.r && !rgba.g && !rgba.b) {
    const hsba = color.toHsb();
    hsba.a = alpha || 1;
    return generateColor3(hsba);
  }
  rgba.a = alpha || 1;
  return generateColor3(rgba);
};
var getGradientPercentColor = (colors, percent) => {
  const filledColors = [{
    percent: 0,
    color: colors[0].color
  }].concat(_toConsumableArray(colors), [{
    percent: 100,
    color: colors[colors.length - 1].color
  }]);
  for (let i = 0; i < filledColors.length - 1; i += 1) {
    const startPtg = filledColors[i].percent;
    const endPtg = filledColors[i + 1].percent;
    const startColor = filledColors[i].color;
    const endColor = filledColors[i + 1].color;
    if (startPtg <= percent && percent <= endPtg) {
      const dist = endPtg - startPtg;
      if (dist === 0) {
        return startColor;
      }
      const ratio = (percent - startPtg) / dist * 100;
      const startRcColor = new Color(startColor);
      const endRcColor = new Color(endColor);
      return startRcColor.mix(endRcColor, ratio).toRgbString();
    }
  }
  return "";
};

// node_modules/antd/es/color-picker/components/ColorPresets.js
var import_react12 = __toESM(require_react());
var import_classnames5 = __toESM(require_classnames());
var genPresetColor = (list) => list.map((value) => {
  value.colors = value.colors.map(generateColor3);
  return value;
});
var isBright = (value, bgColorToken) => {
  const {
    r,
    g,
    b,
    a
  } = value.toRgb();
  const hsv = new Color(value.toRgbString()).onBackground(bgColorToken).toHsv();
  if (a <= 0.5) {
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
};
var genCollapsePanelKey = (preset, index) => {
  var _a;
  const mergedKey = (_a = preset.key) !== null && _a !== void 0 ? _a : index;
  return `panel-${mergedKey}`;
};
var ColorPresets = ({
  prefixCls,
  presets,
  value: color,
  onChange
}) => {
  const [locale] = useLocale_default("ColorPicker");
  const [, token] = useToken();
  const [presetsValue] = useMergedState(genPresetColor(presets), {
    value: genPresetColor(presets),
    postState: genPresetColor
  });
  const colorPresetsPrefixCls = `${prefixCls}-presets`;
  const activeKeys = (0, import_react12.useMemo)(() => presetsValue.reduce((acc, preset, index) => {
    const {
      defaultOpen = true
    } = preset;
    if (defaultOpen) {
      acc.push(genCollapsePanelKey(preset, index));
    }
    return acc;
  }, []), [presetsValue]);
  const handleClick = (colorValue) => {
    onChange === null || onChange === void 0 ? void 0 : onChange(colorValue);
  };
  const items = presetsValue.map((preset, index) => {
    var _a;
    return {
      key: genCollapsePanelKey(preset, index),
      label: import_react12.default.createElement("div", {
        className: `${colorPresetsPrefixCls}-label`
      }, preset === null || preset === void 0 ? void 0 : preset.label),
      children: import_react12.default.createElement("div", {
        className: `${colorPresetsPrefixCls}-items`
      }, Array.isArray(preset === null || preset === void 0 ? void 0 : preset.colors) && ((_a = preset.colors) === null || _a === void 0 ? void 0 : _a.length) > 0 ? preset.colors.map((presetColor, index2) => import_react12.default.createElement(
        ColorBlock_default,
        {
          // eslint-disable-next-line react/no-array-index-key
          key: `preset-${index2}-${presetColor.toHexString()}`,
          color: generateColor3(presetColor).toRgbString(),
          prefixCls,
          className: (0, import_classnames5.default)(`${colorPresetsPrefixCls}-color`, {
            [`${colorPresetsPrefixCls}-color-checked`]: presetColor.toHexString() === (color === null || color === void 0 ? void 0 : color.toHexString()),
            [`${colorPresetsPrefixCls}-color-bright`]: isBright(presetColor, token.colorBgElevated)
          }),
          onClick: () => handleClick(presetColor)
        }
      )) : import_react12.default.createElement("span", {
        className: `${colorPresetsPrefixCls}-empty`
      }, locale.presetEmpty))
    };
  });
  return import_react12.default.createElement("div", {
    className: colorPresetsPrefixCls
  }, import_react12.default.createElement(collapse_default, {
    defaultActiveKey: activeKeys,
    ghost: true,
    items
  }));
};
var ColorPresets_default = ColorPresets;

export {
  ContextIsolator_default,
  ColorBlock_default,
  es_default,
  toHexFormat,
  AggregationColor,
  generateColor3 as generateColor,
  getRoundNumber3 as getRoundNumber,
  getColorAlpha,
  genAlphaColor,
  getGradientPercentColor,
  isBright,
  ColorPresets_default
};
//# sourceMappingURL=chunk-L5EPG2HS.js.map
