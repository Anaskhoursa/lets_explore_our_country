const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../comConfig.json');
const timeconfigPath = path.join(__dirname, '../comTime.json');

const { SerialPort, SerialPortStream } = require('serialport');


exports.getComPorts = async (req, res) => {
    try {
        const ports = await SerialPort.list();
        const availablePorts = ports.map(p => p.path);
        res.json({ message: availablePorts });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list COM ports' });
    }
}


exports.setComPorts = async (req, res) => {
    const { data } = req.body;

    // if (!selectedPort) {
    //     return res.status(400).json({ error: 'selectedPort is required' });
    // }

    // const configData = {
    //     port: selectedPort,
    //     updatedAt: new Date().toISOString()
    // };

    fs.writeFile(configPath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save config' });
        }

        res.json({ message: 'COM port saved successfully' });
    });
}

exports.setComTime = async (req, res) => {
    const { time } = req.body;

    // if (!selectedPort) {
    //     return res.status(400).json({ error: 'selectedPort is required' });
    // }

    const configData = {
        time: time
    };

    fs.writeFile(timeconfigPath, JSON.stringify(configData, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save config' });
        }

        res.json({ message: 'time saved successfully' });
    });
}