const jwt = require('jsonwebtoken')
const SECRET_KEY = 'secretkey23456'

exports.verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"]

    if(!token) {
        return res.status(403).send({
            message: 'No token provided!'
        })
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if(err) {
            return res.status(401).send({
                message: "Unauthorized"
            })
        }
        req.userId = decoded.id
        next()
    })

}