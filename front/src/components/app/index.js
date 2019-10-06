import React, { useState } from 'react'

import Header from '../header'
import ToDo from '../../page/todo'
import {Register} from '../register'

export const App = () => {

    const [isAuth, setAuth] = useState(false)
    
    let content
    
    if(!isAuth) content = <Register setAuth = {setAuth}/>
    else content = <ToDo setAuth = {setAuth}/>

    return (
        <>
            <Header />
            {content}
        </>
    )
}



