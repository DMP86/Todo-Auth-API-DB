import React from 'react'
import './todo-list-item.css'

export const TodoListItem = (props) => {
    
        const {title, important, done, onToggleImportant, onDeleted, onToggleDone, createdAt} = props

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };
        const time =  new Intl.DateTimeFormat('ru', options)
        
        let clazz = ''
 
        if(done) clazz += 'done'
        if(important) clazz += ' important'
        console.log(createdAt)
        return  (
        <li className='list-group-item'>
            <span className={clazz} onClick={onToggleDone}>{time.format(new Date(createdAt))}<br/>{title}</span>
            <div className='btn-group float-right'>
                <button 
                className='btn btn-outline-success btn-sm'
                onClick={onToggleImportant}>
                   <i className='fa fa-exclamation' />
                </button>
                <button 
                    onClick = {onDeleted}
                    className='btn btn-outline-danger btn-sm'>
                  <i className='fa fa-trash-o' />
                </button>
            </div>
        </li>
        );
}


