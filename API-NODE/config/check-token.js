const jwt = require('jsonwebtoken')
require('dotenv').config()

const checkToken = async (req, res, next) => {
    
    if(req.headers.authorization) {
      const [type, token] = req.headers.authorization.split(' ');
      jwt.verify(token, process.env.SECRET, (err, payload) => {
        if(err) {
          return res.status(401).json({ message: 'Wrong token' });
        }
        req.user = payload;
        next();
      });
    } else {
        res.status(401).json({ message: 'No token present' });
    }
}
module.exports = {checkToken}