const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const sequelize = new Sequelize('todo', 'root', '123456', {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

class Todo  extends Sequelize.Model{}
Todo.init (
     {
    id : {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    done: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    important: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
  }, { sequelize, modelName: 'Todo'}
)

class User extends Sequelize.Model{}
  User.init(
  {
    id : {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    email: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false
    }
  }, { sequelize, modelName: 'User', }
)

User.compare = async function(password) {
    return bcrypt.compare(password, this.hash)
}

User.hasMany(Todo)

module.exports = { sequelize, Todo, User }