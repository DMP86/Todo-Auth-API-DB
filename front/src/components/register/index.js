import React, {useState} from 'react'
import axios from 'axios'

export const Register = (props) => {

    const _api = 'http://localhost:8000/api/auth/'
    let errMsg = null
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function login() {
        if(email&&password) {
            axios.post(_api+'login', {email, password})
            .then( ({data}) => {
                localStorage.setItem('jwt', data.token)
                props.setAuth(true)
                errMsg = null
            }).catch( err => {
                console.log(err)
                errMsg = err
            })
        }
    }

    return (
      <>
        <form className="mx-auto mt-4 col-8">
            <fieldset> 
            <legend>Войти</legend>
                <h3>{errMsg}</h3>
                <div className="form-group">
                    <label htmfor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control" placeholder="Enter email" 
                    value={email} onChange={e => {setEmail(e.target.value)}} 
                    required />
                </div>
                <div className="form-group">
                    <label htmfor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control" placeholder="Password" 
                    value={password} onChange={e => {setPassword(e.target.value)}} 
                    required />
                </div>
            <button type='button' className="btn btn-primary" onClick={login} >Submit</button>
            </fieldset>
        </form>
      </>
    )
}