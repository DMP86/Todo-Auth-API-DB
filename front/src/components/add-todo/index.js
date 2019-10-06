import React from 'react';

const AddTodo = (props) => {
    
    return <input className='mt-3' type='text' placeholder='Type what to do' 
    onKeyDown={(event) => {
        if (event.target.value && event.keyCode === 13) {
                props.onAddTodo(event.target.value)
                event.target.value = ''
            }
        }
    }></input>
}

export default AddTodo