import React, { useEffect, useState } from 'react';
import './comSelector.css';
import { getCom, setCom, setTime } from '../api/context';

const ComPortSelector = () => {
    const [ports, setPorts] = useState([]);
    const [message, setMessage] = useState('');
    const [delay, setDelay] = useState(0);


    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const res = await getCom();
                const data = res.map((port) => ({ port, midi: '' }));
                setPorts(data);
            } catch (err) {
                setMessage('Failed to fetch ports');
            }
        };

        fetchPorts();
    }, []);

    const handleMidiChange = (index, midiValue) => {
        setPorts((prevPorts) =>
            prevPorts.map((p, i) =>
                i === index ? { ...p, midi: midiValue } : p
            )
        );
    };

    const handleDelayChange = (e) => {
        setDelay(e.target.value)
    };

    const handleSave = async () => {
        try {
            const response = await setCom({ data: ports });
            setMessage(response.message || 'COM port saved successfully');
        } catch (err) {
            setMessage('Error saving COM config');
        }
    };

    const handleSaveDelay = async () => {
        try {
            const response = await setTime({ time: delay });
            setMessage(response.message);
        } catch (err) {
            setMessage('Error saving COM config');
        }
    };

    if (ports.length === 0) return <h2>Loading...</h2>;

    return (
        <div className="com-container">
            <h2>Assign MIDI to COM Ports</h2>
            {ports.map((p, i) => (
                <div className="port-item" key={i}>
                    <label>{p.port}</label>
                    <input
                        type="number"
                        placeholder="MIDI value"
                        value={p.midi}
                        onChange={(e) => handleMidiChange(i, e.target.value)}
                    />
                </div>
            ))}
            <button className="save-btn" onClick={handleSave}>Save</button>
            {message && <p className="com-message">{message}</p>}
            <input type='number' placeholder='delay' onChange={handleDelayChange} />
            <button className="save-btn" onClick={handleSaveDelay}>Save Delay</button>

        </div>
    );
};

export default ComPortSelector;
