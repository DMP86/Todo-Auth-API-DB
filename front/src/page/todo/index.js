import React, { Component } from 'react'
import axios from 'axios'

import TodoList from '../../components/todo-list'
import AddTodo from '../../components/add-todo'
import ItemFilter from '../../components/item-filter'

export default class ToDo extends Component {
    
    _api = 'http://localhost:8000/api/todo'

    state = {
        todos : [],
        term: '',
        filter: 'All',
    }

    handleError = (err) => {
        console.log(err.response)
        if(err.status === 401) this.props.setAuth(false)
        console.log(err)
    }

    getItems = () => {
        axios.get(this._api, {
            headers: {
                'authorization': localStorage.getItem('jwt')
            }
        }).then( (res) => {
            console.log(res)
            this.setState({todos: res.data})
        })
        .catch(this.handleError)
    }

    addItem = (text) => {
        axios.post(this._api, 
            { title: text.trim() }, { headers: {'authorization': localStorage.getItem('jwt')} }
        ).then( ({data}) => {
            console.log(data)
            this.setState((prevState) => {
                return { 
                    todos: [ ...prevState.todos, data ] // для получения предыдущего состояния без ошибок
                }
            })
        }).catch(this.handleError)   
    }

    delItem = (id) => {
        axios.delete(this._api+'/'+id, { headers: { 'Authorization': localStorage.getItem('jwt') }}
        ).then( res => {
            const idx = this.state.todos.findIndex(el => el.id === id)
            this.setState( ({todos}) => {
                return {
                    todos: [...todos.slice(0,idx), ...todos.slice(idx+1) ] 
                }
            })
        }).catch(this.handleError)
    }
        
    toggleProperty = (id, propName) => {
        axios.put('http://localhost:8000/api/todo/'+propName, { id }, 
            { headers: { 'authorization': localStorage.getItem('jwt') }
        }).then( ({data}) => {
            const idx = this.state.todos.findIndex(el => el.id === id)
            this.setState( ({todos}) => {
                return {
                    todos: [...todos.slice(0,idx), data, ...todos.slice(idx+1) ]
                }         
            })
        }).catch(this.handleError)
    }

    chageTerm = (term) => {
        this.setState({term})
    }
    changeFilter = (filter) => {
        this.setState({filter})
    }
    
    searchItem(items, term) {
        if (!term) return items
        return items.filter( item => item.title.toLowerCase().indexOf(term.toLowerCase()) > -1)
    }

    filterItem(items, filter) {
        if(filter === 'All') return items
        else if (filter === 'Active') return items.filter( item => !item.done )
        else return items.filter( item => item.done )
    }

    async componentDidMount() {
        await this.getItems()
    }

    render() {

        const { todos, term, filter } = this.state         
        const termItems = this.searchItem(todos, term)
        const filterItems = this.filterItem(termItems, filter)

        return (
            <div className='col-lg-8 mr-auto ml-auto'>      
                <ItemFilter 
                term = {term}
                onChageTerm={this.chageTerm}
                filter={filter}
                onFilterChange={this.changeFilter} />
                <TodoList 
                todos={filterItems}
                onDeleted={this.delItem}
                onToggleProperty = {this.toggleProperty}
                />
                <AddTodo onAddTodo={this.addItem}/>
            </div> 
        )
    }
}
