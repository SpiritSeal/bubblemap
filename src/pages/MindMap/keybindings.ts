// Hotkey strings for react-hotkeys-hook (matched against KeyboardEvent.code,
// so letters/digits are layout-independent and '`' is 'backquote').
// Keep in sync with the tables in overlays/BottomBar/KeyBindsDialog.tsx.
const keyBindings = {
  ADD_NODE: 'ctrl+enter',
  DELETE_NODE: 'delete, backspace',
  EDIT_NODE_TEXT: 'shift+enter',
  // 'mod' is cmd on macOS, ctrl elsewhere.
  UNDO: 'mod+z',
  GENERATE_IDEAS: 'ctrl+shift+enter',
  TOGGLE_SIDE_MENU: 'ctrl+shift+s',
  // Not Implemented
  TOGGLE_SETTINGS: 'ctrl+shift+p',
  MOVE_SELECTION_TO_PARENT: 'up, backquote',
  MOVE_SELECTION_TO_CHILD: 'down',
  MOVE_SELECTION_TO_NEXT_SIBLING: 'right',
  MOVE_SELECTION_TO_PREVIOUS_SIBLING: 'left',
  MOVE_SELECTION_TO_ROOT: '0, ctrl+up',
  RESET_VIEW: 'ctrl+0, home',
  LOCK_NODE: 'l, ctrl+l, space',
} as const;

export default keyBindings;
