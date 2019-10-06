import React from 'react';
import {TodoListItem} from '../todo-list-item';
import './todo-list.css'

const TodoList = ({todos, onToggleProperty, onDeleted}) => {
   
    const list = todos.map( ({id, ...otherItem}) =>  {
        return <TodoListItem 
        key={id}  {...otherItem} 
        onToggleImportant = {() => onToggleProperty(id, 'important')}
        onToggleDone = {() => onToggleProperty(id, 'done')}
        onDeleted = {() => onDeleted(id)} 
        /> 
    })
    return (
        <ul className='list-group todo-list mt-1'>
            {list}
        </ul>
    )
}

export default TodoList;