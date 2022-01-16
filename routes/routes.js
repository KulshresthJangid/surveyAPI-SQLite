const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const sqlite3 = require('sqlite3')
const middleware = require('../middleware/auth')
const cookieParser = require('cookie-parser')

const { createUsersTable, findUserByEmail, createUser, createSurvey, createSurveyTable, findSurvey, getQuestions, updateYesQuestion, updateNoQuestion } = require('../utils/utils')
const { route } = require('express/lib/application')
const e = require('express')
const { db } = require('../db/db')

createUsersTable()
createSurveyTable()

const SECRET_KEY = "secretkey23456"

const app = express()
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/', middleware.verifyToken,(req, res) => {
    res.status(200).send('this is an authentication server')
    
})

router.post('/register', async (req, res) => {
    const { name, email } = req.body
    const password = bcrypt.hashSync(req.body.password)

    createUser([name, email, password], err => {
        if(err) {
            console.log("-----------------",err)
            return res.send({
                error: true, 
                message: err
            })
        } findUserByEmail(email, (err, user) => {
            if(err) {
                return res.status(500).send('Server error!')
            }
            const expiresIn = 24 * 60 * 60
            const access_token = jwt.sign({ id: user.id }, SECRET_KEY, {
                expiresIn
            })
            res.cookie('user', user)
            // console.log('--------------user id', user.id)
            res.status(200).send({
                user,
                access_token,
                expiresIn
            })
        })
    })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    findUserByEmail(email, (err, user) => {
        if(err) {
            return res.status(500).send('Server error', err.message)
        }
        if(!user) {
            return res.status(404).send('User not found')
        }
        const result = bcrypt.compareSync(password, user.password)
        if(!result) {
            return res.status(401).send('Password not valid!')
        }

        const expiresIn = 24 * 60 * 60
        const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn
        }) 
        console.log(user)
        res.cookie('user', user.email)
        res.status(200).send({
            user,
            accessToken,
            expiresIn
        })
    })
})

router.post('/createSurvey', middleware.verifyToken, (req, res) => {
    const { survey_name, questions } = req.body

    let created_by_user = req.cookies.user.email
    
    questions.forEach((el) => {
        createSurvey([survey_name, el, created_by_user], (err) => {
            if(err) {
                console.log('Error while creating the survey', err)
                res.status(400).send({
                    error: true,
                    message: err.message
                })
            }

            console.log(`Survey created successfully, survey name ${this.survey_name}`)
        })
    })

    res.status(200).send({
        error: false,
        message: `Survey of name ${survey_name} is created`
    })
})

router.get('/findSurvey/:surveyName',async (req, res) => {
    const name = req.params.surveyName
        findSurvey(name, (err, rows) => {
            if(err) {
                console.log("Error while fetching the surveys", err)
                res.status(400).send({
                    error: true,
                    message: err.message
                })
            }
            if(rows.length === 0) {
                res.status(404).send({
                    message: `No such survey found named ${name}`
                })
                return
            }
            let questions = rows.map((el) => el.questions)
            res.status(200).send(questions.join(', \n'))
        })
})

router.post('/takeSurvey/:surveyName', async (req, res) => {
    try {
        let responseBody = req.body.response 
        let survey_name = req.params.surveyName
        let questions = await getQuestions(survey_name)
        if(questions.length == 0) {
            res.status(404).send({
                message: `Sorry no survey found as name ${survey_name}`
            })
            return
        }
        if(!responseBody) {
            console.log(questions)
            res.send(questions.join('\n'))
        } else {
            if(questions.length != responseBody.length) {
                res.status(499).send({
                    error: true,
                    message: "Please answer all the questions || Incomplete response"
                })
            } else {
                for(let i=0;i<questions.length;i++) {
                    if(responseBody[i] === 'yes') {
                        updateYesQuestion(questions[i], (err, row) => {
                            if(err) {
                                console.log("Error while updating the 'yes' responses")
                            }
                            console.log("Responses are saved", row)
                        })
                    } else {
                        updateNoQuestion(questions[i], (err, row) => {
                            if(err) {
                                console.log("Error while updating the 'no' response", err)
                            }
                            console.log("responses are saved successfully", row)
                        })
                    }
                }
                res.status(200).send({
                    message: "Your response is saved successfully"
                })
            }

        }
    } catch (e) {
        console.log('------------', e)
        res.status(400).send(e.message)
    }
})

router.get('/getResults/:surveyName', middleware.verifyToken, async (req, res) => {
    let name = req.params.surveyName
    findSurvey(name, (err, row) => {
        if(err) {
            console.log('error while getting the survey result', err)
            res.status(400).send({
                error: true,
                message: err.message
            })
        }
        if(row.length === 0) {
            res.status(404).send({
                message: `No survey found as named ${name}`
            })
        }
        console.log("Survey result found", row)
        let arr = row.map(el => {
            let total = el.yes + el.no
            let no = el.no/total * 100
            let yes = el.yes/total * 100
            return {
                question: el.questions,
                yes: yes + '%',
                no: no + '%'
            }
        })
        res.status(200).send(arr)
    })
})

module.exports = router