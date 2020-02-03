const {Router} = require('express')
const router = Router()
const { Todo, sequelize } = require('../models/todo')


router.get('/',  async (req, res) => {
    try {   
        const todos =  await sequelize.models.Todo.findAll()
        res.status(200).json(todos)
    } catch(e) {     
        res.status(500).json({
            message: e
        })
    }
  } 
)

router.post('/',  async (req, res) => {
    try {
        const todo = await Todo.create({
            title: req.body.title,
            done: false,
            important: false,
            UserId: req.user.id
        })
        res.status(201).json(todo)
    } catch(e) {
        res.status(500).json({
            message: e
        })
    }
})

router.put('/done', async (req, res) => {
    try {
        const todo = await Todo.findByPk(+req.body.id)
        todo.done = !todo.done
        todo.save()
        res.status(200).json(todo)
    } catch(e) { 
        res.status(500).json({
            message: e
        })
    }
})
router.put('/important', async (req, res) => {
    try {
        const todo = await Todo.findByPk(+req.body.id)
        todo.important = !todo.important
        todo.save()
        res.status(200).json(todo)
    } catch(e) { 
        res.status(500).json({
            message: e
        })
    }
})

router.delete('/:id',// passport.authenticate('jwt', { session: false }),
 async (req, res) => {
    try {
        const todos = await Todo.findAll({
            where: {
                id: +req.params.id
            }
        })
        await todos[0].destroy()
        res.status(204).send()
    } catch(e) {
        res.status(500).json({
            message: e
        })
    }
})

module.exports = router