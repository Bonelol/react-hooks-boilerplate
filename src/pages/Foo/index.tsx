/**
 *
 * Foo
 *
 */

import React from 'react';

import { useDispatch, useState } from '@store/todo/index';
import { Props } from 'src/types';
import './index.less';
import { getAll } from '@api/todo';

const Foo = (props: Props) => {
  const dispatch = useDispatch();
  const todos = useState();

  React.useEffect(() => {
    if (!todos.length) {
      //
      getAll().then(r => dispatch({ type: 'TODO_INIT', payload: r.data }));
    }
  }, [todos.length, dispatch]);


  return (
    <div>
      {todos.map(todo => (<div>{todo.name}</div>))}
    </div>
  );
}

export default Foo;
