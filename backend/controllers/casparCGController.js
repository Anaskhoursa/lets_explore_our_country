const net = require('net');
const fs = require('fs');
const path = require('path');

let client;
let connected = false;

const configPath = path.join(__dirname, '../casparConfig.json');




const connectToCaspar = () => {
    return new Promise((resolve, reject) => {
        if (connected && client) {
            return resolve(client);
        }

        client = new net.Socket();

        client.connect(5250, '127.0.0.1', () => {
            connected = true;
            console.log('Connected to CasparCG');
            resolve(client);
        });

        client.on('error', (err) => {
            console.error('CasparCG connection error:', err);
            connected = false;
            reject(err);
        });

        client.on('close', () => {
            console.log('CasparCG connection closed');
            connected = false;
        });
    });
};

const loadConfig = () => {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

// GET /api/caspar/config
const getCasparConfig = (req, res) => {
    try {
        const config = loadConfig();
        res.status(200).json({ success: true, message: config });
    } catch (err) {
        console.error('Failed to load config:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

// PUT /api/caspar/config
const updateCasparConfig = (req, res) => {
    try {
        const { type, field, value } = req.body;

        if (!type || !field || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: type, field, and value'
            });
        }

        console.log(type, field, value)

        const config = loadConfig();

        if (!config[type]) {
            return res.status(400).json({
                success: false,
                error: `Template type "${type}" does not exist in config`
            });
        }

        if (!['channel', 'layer', 'channel2', 'layer2', 'path', 'loop'].includes(field)) {
            return res.status(400).json({
                success: false,
                error: `Field "${field}" is not editable`
            });
        }

        config[type][field] = value;

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        res.status(200).json({ success: true, message: config });
    } catch (err) {
        console.error('Failed to update config:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const sendCommand = (command) => {
    return new Promise((resolve, reject) => {
        if (!client || !connected) return reject('CasparCG not connected');

        client.once('data', (data) => {
            console.log('Response from CasparCG:', data.toString());
            resolve(data.toString());
        });

        client.write(`${command}\r\n`);
    });
};
function escapeCasparJSON(str) {
    return str.replace(/\\(?!")/g, '\\\\').replace(/"/g, '\\"');
}

function sanitizeText(text) {
    return text.replace(/"/g, '\'');
}

const playName = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { name } = req.body;
        const channel = config.name.channel;
        const layer = config.name.layer;
        const channel2 = config.name.channel2;
        const layer2 = config.name.layer2;
        const templateName = config.name.path;

        const dataObj = {
            name: sanitizeText(name)
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        const command2 = `CG ${channel2}-${layer2} ADD 1 "${templateName}" 1 "${casparData}"`;

        await sendCommand(command);
        await sendCommand(command2);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const StopName = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const channel = config.name.channel;
        const layer = config.name.layer;
        const channel2 = config.name.channel2;
        const layer2 = config.name.layer2;
        const templateName = config.name.path;




        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`STOP ${channel}-${layer}`);

        // const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        // const command2 = `CG ${channel2}-${layer2} ADD 1 "${templateName}" 1 "${casparData}"`;

        // await sendCommand(command);
        // await sendCommand(command2);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const playStats = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { question, options, number } = req.body;
        const channel = config.question.channel;
        const layer = config.question.layer;
        const channel2 = config.score.channel;
        const layer2 = config.score.layer;
        const templateName = config.question.path;

        const dataObj = {
            question: sanitizeText(question),
            options: options.map(opt => ({
                text: sanitizeText(opt.text),
                isCorrect: opt.isCorrect
            })),
            number: number
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const playStats2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { question, options, number } = req.body;
        const channel = config.question.channel2;
        const layer = config.question.layer2;
        const channel2 = config.score.channel2;
        const layer2 = config.score.layer2;
        const templateName = config.question.path;

        const dataObj = {
            question: sanitizeText(question),
            options: options.map(opt => ({
                text: sanitizeText(opt.text),
                isCorrect: opt.isCorrect
            })),
            number: number
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const stopStats = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;
        const channel = config.question.channel;
        const layer = config.question.layer;
        const channel2 = config.question.channel2;
        const layer2 = config.question.layer2;
        // const templateName = config.question.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`STOP ${channel}-${layer}`);
        await sendCommand(`STOP ${channel2}-${layer2}`);




        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const stopStats2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;

        const channel2 = config.question.channel2;
        const layer2 = config.question.layer2;
        // const templateName = config.question.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`STOP ${channel2}-${layer2}`);




        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const playScore = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { data } = req.body;
        const channel = config.score.channel;
        const layer = config.score.layer;
        const templateName = config.score.path;
        const channel2 = config.question.channel;
        const layer2 = config.question.layer;

        const dataObj = {
            data
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const playScore2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { data } = req.body;
        const channel = config.score.channel2;
        const layer = config.score.layer2;
        const templateName = config.score.path;
        const channel2 = config.question.channel2;
        const layer2 = config.question.layer2;

        const dataObj = {
            data
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const stopScore = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;
        const channel = config.score.channel;
        const layer = config.score.layer;

        // const templateName = config.question.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`STOP ${channel}-${layer}`);




        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const stopScore2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;

        const channel2 = config.score.channel2;
        const layer2 = config.score.layer2;
        // const templateName = config.question.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`STOP ${channel2}-${layer2}`);




        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const playBackground = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;
        const channel = config.background.channel;
        const layer = config.background.layer;
        const templateName = config.background.path;
        const loop = config.background.loop

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `PLAY ${channel}-${layer} ${templateName} ${loop ? 'LOOP' : ''}`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const playBackground2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;
        const channel = config.background.channel2;
        const layer = config.background.layer2;

        const templateName = config.background.path;
        const loop = config.background.loop

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `PLAY ${channel}-${layer} ${templateName} ${loop ? 'LOOP' : ''}`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const stopBackground = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;
        const channel = config.background.channel;
        const layer = config.background.layer;

        // const templateName = config.question.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`STOP ${channel}-${layer}`);



        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const stopBackground2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        // const { question, options } = req.body;

        const channel2 = config.background.channel2;
        const layer2 = config.background.layer2;
        // const templateName = config.question.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);



        await sendCommand(`STOP ${channel2}-${layer2}`);



        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const playCorrectOption = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { question, options, number } = req.body;
        const channel = config.question.channel;
        const layer = config.question.layer;
        const channel2 = config.score.channel;
        const layer2 = config.score.layer;
        const templateName = 'quizcorrect';

        const dataObj = {
            question: sanitizeText(question),
            options: options.map(opt => ({
                text: sanitizeText(opt.text),
                isCorrect: opt.isCorrect
            })),
            number: number
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const playCorrectOption2 = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const { question, options, number } = req.body;
        const channel = config.question.channel2;
        const layer = config.question.layer2;
        const channel2 = config.score.channel2;
        const layer2 = config.score.layer2;
        const templateName = 'quizcorrect';

        const dataObj = {
            question: sanitizeText(question),
            options: options.map(opt => ({
                text: sanitizeText(opt.text),
                isCorrect: opt.isCorrect
            })),
            number: number
        };
        let casparData = JSON.stringify(dataObj);
        casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`CG ${channel}-${layer} STOP`);

        const command = `CG ${channel}-${layer} ADD 1 "${templateName}" 1 "${casparData}"`;
        await sendCommand(command);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};

const playLogo = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const channel = config.logo.channel;
        const layer = config.logo.layer;
        const channel2 = config.logo.channel2;
        const layer2 = config.logo.layer2;
        const templateName = config.logo.path;

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`STOP ${channel}-${layer}`);

        const command = `PLAY ${channel}-${layer} "${templateName}" 1`;
        const command2 = `PLAY ${channel2}-${layer2} "${templateName}" 1`;

        await sendCommand(command);
        await sendCommand(command2);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};
const stopLogo = async (req, res) => {
    try {
        await connectToCaspar();
        const config = loadConfig();


        const channel = config.logo.channel;
        const layer = config.logo.layer;
        const channel2 = config.logo.channel2;
        const layer2 = config.logo.layer2;
        const templateName = 'logo';

        // const dataObj = {
        //     question: sanitizeText(question),
        //     options: options.map(opt => ({
        //         text: sanitizeText(opt.text),
        //         isCorrect: opt.isCorrect
        //     }))
        // };
        // let casparData = JSON.stringify(dataObj);
        // casparData = escapeCasparJSON(casparData);


        await sendCommand(`STOP ${channel2}-${layer2}`);

        await sendCommand(`STOP ${channel}-${layer}`);

        // const command = `PLAY ${channel}-${layer} "${templateName}" 1`;
        // const command2 = `PLAY ${channel2}-${layer2} "${templateName}" 1`;

        // await sendCommand(command);
        // await sendCommand(command2);

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('playStats error:', err);
        res.status(500).json({ success: false, error: err.toString() });
    }
};



module.exports = { connectToCaspar, playName, StopName, playLogo, stopLogo,playStats, getCasparConfig, updateCasparConfig, playScore, playBackground, playCorrectOption, playCorrectOption2, stopBackground, stopScore, stopStats, playStats2, playScore2, playBackground2, stopBackground2, stopScore2, stopStats2 };
