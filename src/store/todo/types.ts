export type Reducer = (state: State, action: Action) => State;

export interface Todo {
  name: string;
  id: number;
}

export type State = Todo[];

export type Action =
  | { type: 'TODO_INIT'; payload: Todo[] }
  | { type: 'TODO_ADD'; payload: Todo }
  | { type: 'TODO_DELETE'; payload: Todo };