const { playStats, updateCasparConfig, getCasparConfig, playScore, playBackground, stopScore, stopStats, stopBackground, playStats2, playScore2, playBackground2, stopStats2, stopScore2, stopBackground2, playCorrectOption, playCorrectOption2, playName, StopName, playLogo, stopLogo, play40Sec, stop40Sec, playVS, StopVS, playAllDetails, stopAllDetails, playCategory, stopCategory } = require('../controllers/casparCGController')
const { getComPorts, setComPorts, setComTime } = require('../controllers/comController')
const { GetUsers, addUser, addQuestion, getQuestions, adjustScore, removeUser, removeQuestion, updateQuestion, updateUser, getMidiPorts, setMidiOutputPort, resetAll, removeAllQuestions, incrementScore, decrementScore } = require('../controllers/controllers')

const router = require('express').Router()

router.get('/get-users', GetUsers)
router.post('/add-user', addUser)
router.post('/update-user', updateUser)

router.post('/add-question', addQuestion)
router.post('/remove-all-questions', removeAllQuestions)

router.post('/update-question', updateQuestion)

router.get('/get-questions', getQuestions)
router.post('/adjust-score', adjustScore)
router.post('/increment-score', incrementScore)
router.post('/decrement-score', decrementScore)

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
router.post('/play-40', play40Sec)
router.post('/stop-40', stop40Sec)
router.post('/play-all', playAllDetails)
router.post('/stop-all', stopAllDetails)
router.post('/play-category', playCategory)
router.post('/stop-category', stopCategory)

router.post('/play-vs', playVS)
router.post('/stop-vs', StopVS)

router.post('/modify-caspar', updateCasparConfig)
router.get('/get-caspar', getCasparConfig)
router.get('/reset-all', resetAll)

router.get('/get-com', getComPorts)
router.post('/set-com', setComPorts)
router.post('/set-time', setComTime)







module.exports =  router 