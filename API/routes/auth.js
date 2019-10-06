const { Router } = require('express')
const router = Router()
const { User } = require('../models/todo')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.post('/register', async (req, res) => {
  try {
    const candidate = await User.findOne({
        where: {email: req.body.email}
    })
    if(candidate) res.status(401).json({msg: 'Такой пользователь уже существует'})
    else {
        const hash = await bcrypt.hash(req.body.password, 10)
        const user = await User.create({
            email: req.body.email,
            hash
        })
        res.status(201).json(user)
    }
  } catch(e) {console.log(e)}
})

router.post( '/login', async (req, res) => {
  try {
    const candidate = await User.findOne({
        where: {email: req.body.email}
    })

    if(candidate) {
      const isPass = await bcrypt.compare(req.body.password, candidate.hash)
      
      if(isPass) {
        const token = jwt.sign({
          email: candidate.email,
          id: candidate.id
        }, process.env.SECRET , { expiresIn: 3 * 60 * 60 })
        res.status(200).json({
          token: `Bearer ${token}`
        })
      } else res.status(401).json({ msg: 'Ошибка в пароле'})
    } else res.status(401).json({ msg: 'Нет такого пользователя'})
  } catch(e) { console.log(e) }
})

module.exports = router