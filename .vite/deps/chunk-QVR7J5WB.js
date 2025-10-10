import {
  require_react
} from "./chunk-JUEE6Y66.js";
import {
  __toESM
} from "./chunk-KEXKKQVW.js";

// node_modules/antd/es/_util/reactNode.js
var import_react = __toESM(require_react());
function isFragment(child) {
  return child && import_react.default.isValidElement(child) && child.type === import_react.default.Fragment;
}
var replaceElement = (element, replacement, props) => {
  if (!import_react.default.isValidElement(element)) {
    return replacement;
  }
  return import_react.default.cloneElement(element, typeof props === "function" ? props(element.props || {}) : props);
};
function cloneElement(element, props) {
  return replaceElement(element, element, props);
}

export {
  isFragment,
  cloneElement
};
//# sourceMappingURL=chunk-QVR7J5WB.js.map
