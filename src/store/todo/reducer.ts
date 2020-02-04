import { Action, State, Todo } from './types';

const reducer = (state: State, action: Action) => {
  state = state || [];

  switch (action.type) {
    case 'TODO_INIT':
      return [...(action.payload as Todo[])];
    case 'TODO_ADD': {
      const { payload } = action;
      return [...state, payload];
    }
    case 'TODO_DELETE': {
      return state;
    }
    default:
      return state;
  }
};

export default reducer;