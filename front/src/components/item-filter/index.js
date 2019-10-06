import React from 'react'

const ItemFilter = ({filter, onChageTerm, onFilterChange, term}) => {

    const buttonsName = [ {name: 'All'}, {name: 'Active'}, {name: 'Done'} ]

    const buttons = buttonsName.map(({name}) => {
        const clazz = filter === name ? 'btn-info' : 'btn-outline-secondary'

        return (
            <button key={name} className={`btn ${clazz}`} onClick={() => onFilterChange(name)}>{name}</button>
        )
    })
    return (
        <div className='d-flex mt-1'>
        <input className='form-control' 
            value = {term} 
            onChange = {onChageTerm}
        />
        <div className='btn-group'>
            {buttons}
        </div>
        </div>
    )
}

export default ItemFilter