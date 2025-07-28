const express = require('express');
const router = require('./routes/routes');
require('dotenv').config();
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io');
const pool = require('./pg');
const { stringify } = require('querystring');
const midi = require('midi');
const fs = require('fs');
const path = require('path');

const { SerialPort, SerialPortStream } = require('serialport');
const { time } = require('console');




const corsOptions = {
  origin: "http://localhost",
  credentials: true,
}



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"],
    credentials: true,
  },
}); app.use(express.json());



app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cors(corsOptions))

app.use('/api', router)


const midiOutput = new midi.Output();
let currentMidiPortIndex = -1;
let isMidiPortCurrentlyOpen = false;
const CONFIG_FILE_PATH = path.join(__dirname, 'midiConfig.json');

// const configPath = path.join(__dirname, 'comConfig.json');
// let config;



// try {
//   const raw = fs.readFileSync(configPath, 'utf-8');
//   config = JSON.parse(raw);
// } catch (err) {
//   console.error('Failed to read comConfig.json:', err.message);
//   process.exit(1);
// }

// if (!config.port) {
//   console.error('No port specified in comconfig.json');
//   process.exit(1);
// }

// const port = new SerialPort({
//   path: config.port,
//   baudRate: 9600,
// });

// port.on('open', () => {
//   console.log(`Serial port ${config.port} open`);
// });

// port.on('data', (data) => {
//   const value = data.toString().trim();
//   console.log(`Buzzer pressed: ${value}`);

//   // test
// });





async function getDesiredMidiPortIndex() {
  try {
    const data = await fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const config = JSON.parse(data);
    return config.outputPortIndex;
  } catch (error) {
    console.warn(`MIDI config file not found or unreadable: ${error.message}. Defaulting to no specific port.`);
    return -1;
  }
}

async function ensureMidiPort(desiredPortIndex) {
  if (isMidiPortCurrentlyOpen && currentMidiPortIndex === desiredPortIndex) {
    return true;
  }

  if (isMidiPortCurrentlyOpen) {
    try {
      midiOutput.closePort();
      isMidiPortCurrentlyOpen = false;
      console.log(`MIDI port ${currentMidiPortIndex} closed.`);
    } catch (err) {
      console.error(`Error closing MIDI port ${currentMidiPortIndex}:`, err.message);
    }
  }

  if (desiredPortIndex !== -1 && desiredPortIndex < midiOutput.getPortCount()) {
    try {
      midiOutput.openPort(desiredPortIndex);
      currentMidiPortIndex = desiredPortIndex;
      isMidiPortCurrentlyOpen = true;
      console.log(`MIDI output port "${midiOutput.getPortName(desiredPortIndex)}" (index ${desiredPortIndex}) opened successfully.`);
      return true;
    } catch (error) {
      console.error(`Failed to open MIDI output port at index ${desiredPortIndex}:`, error.message);
      currentMidiPortIndex = -1;
      isMidiPortCurrentlyOpen = false;
      return false;
    }
  } else {
    console.warn(`Desired MIDI port index ${desiredPortIndex} is invalid or no ports found. No MIDI output will be active.`);
    currentMidiPortIndex = -1;
    isMidiPortCurrentlyOpen = false;
    return false;
  }
}
process.on('exit', () => {
  if (midiOutputPortOpen) {
    output.closePort();
    console.log('MIDI output port closed.');
  }
});

(async () => {
  try {
    const ports = await SerialPort.list();
    const timedata = await fs.readFileSync(path.join(__dirname, 'comTime.json'), 'utf8');
    const timeconfig = JSON.parse(timedata).time;
    const portsdata = await fs.readFileSync(path.join(__dirname, 'comConfig.json'), 'utf8');
    const portsconfig = JSON.parse(portsdata);
    let lastTime = 0;

    if (!ports.length) {
      console.log('No COM ports found.');
      return;
    }

    ports.forEach((portInfo) => {
      const port = new SerialPort({
        path: portInfo.path,
        baudRate: 9600,
        autoOpen: true,
      });

      port.on('open', () => {
        console.log(`Serial port ${portInfo.path} opened`);
      });

      port.on('data', async (data) => {
        const value = data.toString().trim();
        const now = Date.now();
        const midi = portsconfig.filter(p => p.port === portInfo.path)[0].midi

        if (now - lastTime > timeconfig) {
          console.log(`Buzzer triggered: ${value}`);
          lastBuzzer = value;
          lastTime = now;

          const desiredPortIndex = await getDesiredMidiPortIndex();
          const portManagedSuccessfully = await ensureMidiPort(desiredPortIndex);

          if (portManagedSuccessfully) {
            const velocity = 100;
            const duration = 500;

            midiOutput.sendMessage([0x90, midi, velocity]);
            console.log(`Sending MIDI Note ON: ${midi} for user ${userId} on port ${currentMidiPortIndex}`);

            setTimeout(() => {

              if (isMidiPortCurrentlyOpen && currentMidiPortIndex === desiredPortIndex) {
                midiOutput.sendMessage([0x80, midi, velocity]);
                console.log(`Sending MIDI Note OFF: ${midi} on port ${currentMidiPortIndex}`);
              } else {
                console.log(`MIDI port changed or closed (${currentMidiPortIndex} vs desired ${desiredPortIndex}), skipping Note OFF for ${newMidiNoteToStore}.`);
              }
            }, duration);
          } else {
            console.warn(`MIDI output not available or port could not be opened/managed. Cannot send note ${midi}.`);
          }
        }
      });

      port.on('error', (err) => {
        console.error(`Error on ${portInfo.path}:`, err.message);
      });
    });
  } catch (err) {
    console.error('Error listing or opening ports:', err);
  }
})();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




const users = {};


io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("check_connected_users", async (callback) => {
    const dbUsers = await pool.query('select * from users')
    console.log("Connected users:", Object.keys(users).length);
    console.log("Total DB users:", dbUsers.rowCount);

    if (Object.keys(users).length - 1 >= dbUsers.rowCount) {
      if (callback) callback({ success: true, users: Object.keys(users) });

    }
    else {
      if (callback) callback({ success: false, users: Object.keys(users) });

    }
  })

  socket.on("register_user", async (user_id) => {
    users[user_id] = socket.id;
    const dbUsers = await pool.query('select * from users');

    const connectedCount = Object.keys(users).length;
    const totalCount = dbUsers.rowCount;
    console.log("Connected users:", Object.keys(users).length);
    console.log("Total DB users:", dbUsers.rowCount);
    const allConnected = connectedCount - 1 >= totalCount;

    io.emit('users_connected', { success: allConnected });
    io.emit('online-users', Object.keys(users));

    console.log(`User Registered: ${user_id} with ID: ${socket.id}`);
  });



  socket.on('start_game', (qIndex) => {
    console.log('Received start_game from', socket.id);

    io.emit('start_game', qIndex);



  });
  socket.on('next_question', () => {
    console.log('Received next_question', socket.id);

    io.emit('next_question');



  });

  socket.on('reset_question', async ({ questionId }, callback) => {
    console.log('Received reset', socket.id, questionId);

    const usersWithAnswer = await pool.query(`
    SELECT name, answers, score
    FROM users
    WHERE answers @> $1
  `, [JSON.stringify([{ questionId }])]);

    const questionRes = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);


    const correctText = questionRes.rows[0].answers.find(a => a.isCorrect)?.text;

    for (const user of usersWithAnswer.rows) {
      const name = user.name;
      const answers = user.answers || [];

      const answerToRemove = answers.find(a => parseInt(a.questionId) === parseInt(questionId));
      const isCorrect = answerToRemove?.text === correctText;

      const updatedAnswers = answers.filter(
        a => parseInt(a.questionId) !== parseInt(questionId)
      );

      await pool.query(`
      UPDATE users
      SET answers = $1
      WHERE name = $2
    `, [JSON.stringify(updatedAnswers), name]);

      if (isCorrect) {
        await pool.query(`
        UPDATE users
        SET score = GREATEST(score - 1, 0)
        WHERE name = $1
      `, [name]);
      }
    }

    io.emit('reset_question');
    if (callback) callback({ success: true });
  });


  socket.on('stop_game', () => {
    console.log('Received reset', socket.id);

    io.emit('stop_game');



  });

  socket.on('round_time', () => {
    console.log('Received challenge', socket.id);

    io.emit('round_time');



  });

  socket.on('between_round_time', () => {
    console.log('Received between challenge', socket.id);

    io.emit('between_round_time');



  });

  socket.on('save_answer', async ({ userId, answer }) => {
    console.log('received save answer');

    if (Object.keys(answer).length > 0) {
      const userResult = await pool.query('SELECT answers, score, midi FROM users WHERE name = $1', [userId]);
      let previousAnswers = [];
      let previousScore;
      let updatedScore;
      let midi;

      if (userResult.rows.length) {
        if (userResult.rows[0].answers !== null) {
          previousAnswers = userResult.rows[0].answers;

        }
        previousScore = userResult.rows[0].score
        updatedScore = userResult.rows[0].score

        midi = userResult.rows[0].midi
      }



      const filteredAnswers = previousAnswers.filter(
        (a) => parseInt(a.questionId) !== parseInt(answer.questionId)
      );

      filteredAnswers.push(answer);

      const stringifiedAnswers = JSON.stringify(filteredAnswers);
      await pool.query('UPDATE users SET answers = $1 WHERE name = $2', [stringifiedAnswers, userId]);


      const question = await pool.query('select * from questions where id = $1', [answer.questionId])
      if (question.rowCount > 0) {
        const correctAnswer = question.rows[0].answers.find(a => a.isCorrect).text
        if (correctAnswer === answer.text) {
          const updatedScoreRow = await pool.query('update users set score = score + 1 where name = $1 returning *', [userId])
          updatedScore = updatedScoreRow.rows[0].score
        }
      }

      if (updatedScore > previousScore) {
        midi++
      }
      else {
        midi = midi + 2
      }

      const desiredPortIndex = await getDesiredMidiPortIndex();
      const portManagedSuccessfully = await ensureMidiPort(desiredPortIndex);

      if (portManagedSuccessfully) {
        const velocity = 100;
        const duration = 500;

        midiOutput.sendMessage([0x90, midi, velocity]);
        console.log(`Sending MIDI Note ON: ${midi} for user ${userId} on port ${currentMidiPortIndex}`);

        setTimeout(() => {

          if (isMidiPortCurrentlyOpen && currentMidiPortIndex === desiredPortIndex) {
            midiOutput.sendMessage([0x80, midi, velocity]);
            console.log(`Sending MIDI Note OFF: ${midi} on port ${currentMidiPortIndex}`);
          } else {
            console.log(`MIDI port changed or closed (${currentMidiPortIndex} vs desired ${desiredPortIndex}), skipping Note OFF for ${newMidiNoteToStore}.`);
          }
        }, duration);
      } else {
        console.warn(`MIDI output not available or port could not be opened/managed. Cannot send note ${midi}.`);
      }

      io.emit('receive-answer', { userId, answer, updatedScore });
    }
  });

  socket.on('save_empty_answer', async ({ userId, questionId }) => {
    console.log('received save empty answer');

    if (!userId || !questionId) return;

    try {
      const emptyAnswer = { questionId, text: 'no answer' };

      const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [userId]);
      let previousAnswers = [];
      let score;

      if (userResult.rows.length > 0 && userResult.rows[0].answers) {
        previousAnswers = userResult.rows[0].answers;
        score = userResult.rows[0].score;
      }

      const filteredAnswers = previousAnswers.filter(
        (a) => parseInt(a.questionId) !== parseInt(questionId)
      );

      filteredAnswers.push(emptyAnswer);

      const stringifiedAnswers = JSON.stringify(filteredAnswers);
      await pool.query('UPDATE users SET answers = $1 WHERE name = $2', [stringifiedAnswers, userId]);

      io.emit('receive-answer', { userId, answer: emptyAnswer, updatedScore: score });
    } catch (err) {
      console.error('Error saving empty answer:', err);
    }
  });

  socket.on('test_midi', async (midi) => {
    const desiredPortIndex = await getDesiredMidiPortIndex();
    const portManagedSuccessfully = await ensureMidiPort(desiredPortIndex);

    if (portManagedSuccessfully) {
      const velocity = 100;
      const duration = 1000;

      midiOutput.sendMessage([0x90, midi, velocity]);
      console.log(`Sending MIDI Note ON: ${midi} on port ${currentMidiPortIndex}`);

      setTimeout(() => {

        if (isMidiPortCurrentlyOpen && currentMidiPortIndex === desiredPortIndex) {
          midiOutput.sendMessage([0x80, midi, velocity]);
          console.log(`Sending MIDI Note OFF: ${midi} on port ${currentMidiPortIndex}`);
        } else {
          console.log(`MIDI port changed or closed (${currentMidiPortIndex} vs desired ${desiredPortIndex}), skipping Note OFF for ${newMidiNoteToStore}.`);
        }
      }, duration);
    } else {
      console.warn(`MIDI output not available or port could not be opened/managed. Cannot send note ${midi}.`);
    }
  })



  socket.on('return_question', async ({ questionId, questionIdB }, callback) => {
    console.log('Received return', questionId, questionIdB);

    const questionIds = [parseInt(questionId), parseInt(questionIdB)];

    const questionsRes = await pool.query(
      'SELECT * FROM questions WHERE id = ANY($1)',
      [questionIds]
    );

    const correctAnswersMap = {};
    for (const question of questionsRes.rows) {
      const correctAnswer = question.answers.find(a => a.isCorrect);
      if (correctAnswer) {
        correctAnswersMap[question.id] = correctAnswer.text;
      }
    }

    const usersRes = await pool.query(`
    SELECT name, answers, score
    FROM users
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(answers) AS elem
      WHERE (elem->>'questionId')::int = $1 OR (elem->>'questionId')::int = $2
    )
  `, [questionId, questionIdB]);

    for (const user of usersRes.rows) {
      const name = user.name;
      const answers = user.answers || [];
      let score = user.score || 0;

      let correctCount = 0;

      const filteredAnswers = answers.filter(answer => {
        const qId = parseInt(answer.questionId);
        const isTarget = questionIds.includes(qId);

        if (isTarget && answer.text === correctAnswersMap[qId]) {
          correctCount += 1;
        }

        return !isTarget;
      });

      await pool.query(
        `UPDATE users SET answers = $1 WHERE name = $2`,
        [JSON.stringify(filteredAnswers), name]
      );

      if (correctCount > 0) {
        const newScore = Math.max(score - correctCount, 0);
        await pool.query(
          `UPDATE users SET score = $1 WHERE name = $2`,
          [newScore, name]
        );
      }
    }

    io.emit('return_question');
    if (callback) callback({ success: true });
  });


  socket.on("disconnect", () => {

    console.log("User Disconnected", socket.id);


    for (let user_id in users) {
      if (users[user_id] === socket.id) {
        delete users[user_id];
        console.log(`User ${user_id} removed from the active users map`);
        break;
      }
    }

    io.emit('online-users', Object.keys(users));

  });
});






server.listen(3001, () => {
  console.log("socket RUNNING port 3001");
});