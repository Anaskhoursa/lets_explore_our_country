const { playStats, updateCasparConfig, getCasparConfig, playScore, playBackground, stopScore, stopStats, stopBackground, playStats2, playScore2, playBackground2, stopStats2, stopScore2, stopBackground2, playCorrectOption, playCorrectOption2, playName, StopName, playLogo, stopLogo } = require('../controllers/casparCGController')
const { GetUsers, addUser, addQuestion, getQuestions, adjustScore, removeUser, removeQuestion, updateQuestion, updateUser, getMidiPorts, setMidiOutputPort, resetAll } = require('../controllers/controllers')

const router = require('express').Router()

router.get('/get-users', GetUsers)
router.post('/add-user', addUser)
router.post('/update-user', updateUser)

router.post('/add-question', addQuestion)
router.post('/update-question', updateQuestion)

router.get('/get-questions', getQuestions)
router.post('/adjust-score', adjustScore)
router.post('/remove-user', removeUser)
router.post('/remove-question', removeQuestion)
router.get('/get-midi-ports', getMidiPorts)
router.post('/set-midi-port', setMidiOutputPort)
router.post('/show-caspar', playStats)
router.post('/show-correct', playCorrectOption)
router.post('/show-correct2', playCorrectOption2)

router.post('/show-caspar2', playStats2)

router.post('/show-score', playScore)
router.post('/show-score2', playScore2)

router.post('/show-background', playBackground)
router.post('/show-background2', playBackground2)


router.post('/stop-caspar', stopStats)
router.post('/stop-caspar2', stopStats2)

router.post('/stop-score', stopScore)
router.post('/stop-score2', stopScore2)

router.post('/stop-background', stopBackground)
router.post('/stop-background2', stopBackground2)
router.post('/play-name', playName)
router.post('/stop-name', StopName)
router.post('/play-logo', playLogo)
router.post('/stop-logo', stopLogo)

router.post('/modify-caspar', updateCasparConfig)
router.get('/get-caspar', getCasparConfig)
router.get('/reset-all', resetAll)






module.exports =  router 