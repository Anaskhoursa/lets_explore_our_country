const pool = require("../pg")
const midi = require('midi');
const fs = require('fs').promises;
const path = require('path');
const CONFIG_FILE_PATH = path.join(__dirname, '..', 'midiConfig.json'); 





exports.GetUsers = async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM users order by score desc')
        res.status(200).json({ message: users.rows })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.addUser = async (req, res) => {
    const { name, role, midi, members, com } = req.body
    try {
        const isExisted = await pool.query('select * from users where name = $1', [name])
        if (isExisted.rows[0]) {
            return res.status(400).json({ message: 'name already exists, choose a different one' })
        }

        await pool.query('INSERT INTO users (name, role, score, midi, members, com) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, role, 0, midi, members, com])
        res.status(200).json({ message: 'added' })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message })

    }
}

exports.addQuestion = async (req, res) => {
    const { question, order, category } = req.body
    const answers = JSON.stringify(req.body.answers);

    try {
        await pool.query('insert into questions (question, answers, ordre, category) VALUES ($1, $2, $3, $4)', [question, answers, order, category])
        res.status(200).json({ message: 'added' })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }
}
exports.removeAllQuestions = async (req, res) => {


    try {
        await pool.query('delete from questions')
        res.status(200).json({ message: 'added' })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }
}

exports.updateQuestion = async (req, res) => {
    const { id, question, order } = req.body;
    const answers = JSON.stringify(req.body.answers);
    const prev = await pool.query('select ordre from questions where id = $1', [id])
    const prevOrder = prev.rows[0].ordre

    try {
        await pool.query(
            'UPDATE questions SET ordre = $1 WHERE ordre = $2',
            [prevOrder, order]
        );
        await pool.query(
            'UPDATE questions SET question = $1, answers = $2, ordre = $3 WHERE id = $4',
            [question, answers, order, id]
        );
        res.status(200).json({ message: 'updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { name, role, id, midi, members, com } = req.body
    try {
        const isExisted = await pool.query('select * from users where name = $1 and id != $2', [name, id])
        if (isExisted.rows[0]) {
            return res.status(400).json({ message: 'name already exists, choose a different one' })
        }

        await pool.query('update users set name = $1, role = $2, midi = $4, members = $5, com = $6 where id = $3', [name, role, id, midi, members, com])
        res.status(200).json({ message: 'updated' })
    }

    catch (error) {
        res.status(500).json({ message: error.message })

    }
}


exports.getQuestions = async (req, res) => {
    try {
        const questions = await pool.query('SELECT * FROM questions order by ordre ASC')
        res.status(200).json({ message: questions.rows })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.adjustScore = async (req, res) => {
    const { id, newScore } = req.body
    try {
        await pool.query('update users set score = $1 where id = $2', [newScore, id])
        res.status(200).json({ message: 'updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.incrementScore = async (req, res) => {
    const { id } = req.body
    try {
        await pool.query('update users set score = score + 1 where id = $1', [id])
        res.status(200).json({ message: 'updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}
exports.decrementScore = async (req, res) => {
    const { id } = req.body
    try {
        await pool.query('update users set score = score - 1 where id = $1', [id])
        res.status(200).json({ message: 'updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.removeUser = async (req, res) => {
    const { id } = req.body
    try {
        await pool.query('delete from users where id = $1', [id])
        res.status(200).json({ message: 'updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.removeQuestion = async (req, res) => {
    const { id } = req.body
    try {
        await pool.query('delete from questions where id = $1', [id])
        res.status(200).json({ message: 'updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

exports.getMidiPorts = async (req, res) => {
    try {
        const output = new midi.Output();
        const portCount = output.getPortCount();
        const ports = [];
        const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
        const config = JSON.parse(data);

        for (let i = 0; i < portCount; i++) {
            const portName = output.getPortName(i);
            ports.push({ id: i, name: portName });
        }


        output.closePort();

        return res.status(200).json({ message: {ports, selectedPort: config.outputPortIndex} });

    } catch (error) {
        console.error('Error getting MIDI ports:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve MIDI ports.', error: error.message });
    }
};

exports.setMidiOutputPort = async (req, res) => {
    const { portIndex } = req.body
    const configData = { outputPortIndex: portIndex };
    try {
        const jsonString = JSON.stringify(configData, null, 2);
        await fs.writeFile(CONFIG_FILE_PATH, jsonString, 'utf8');
        console.log(`MIDI output port index saved: ${portIndex} to ${CONFIG_FILE_PATH}`);
        return res.status(200).json({ message: 'saved' });
    } catch (error) {
        console.error('Error saving MIDI output port configuration:', error.message);
        return res.status(500).json({ message: 'Failed to retrieve MIDI ports.', error: error.message });
    }
};


exports.resetAll = async (req, res) => {
    try {
        await pool.query('update users set answers =null, score = 0')
        res.status(200).json({ message: 'updated' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}