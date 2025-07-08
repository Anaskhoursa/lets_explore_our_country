import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMidiPorts, setMidiPort } from "../api/context";
import { useSocket } from "../socketWrapper";

const ManageMidi = () => {
    const [selectedIndex, setSelectedIndex] = useState("");
    const [didSetInitially, setDidSetInitially] = useState(false);


    const [note, setNote] = useState("");
    const socket = useSocket()

    const { data: ports, isLoading, error } = useQuery({
        queryKey: ["midiPorts"],
        queryFn: getMidiPorts,
    });

    const mutation = useMutation({
        mutationFn: setMidiPort,
        onSuccess: () => {
            alert(`MIDI port #${selectedIndex} has been set.`);
        },
        onError: () => {
            alert("Failed to set MIDI port.");
        },
    });

    const handleSetPort = () => {
        if (selectedIndex !== "") {
            mutation.mutate({ portIndex: Number(selectedIndex) });
        }
    };

    React.useEffect(() => {
        if (ports?.selectedPort !== undefined && !didSetInitially) {
            setSelectedIndex(String(ports.selectedPort));
            setDidSetInitially(true);
        }
    }, [ports, didSetInitially]);



    if (isLoading) return <div style={styles.loading}>Loading MIDI ports...</div>;
    if (error) return <div style={styles.error}>Error loading MIDI ports</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Manage MIDI Port</h2>
            <div style={styles.card}>
                <label style={styles.label}>Select MIDI Port:</label>
                <select
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(e.target.value)}
                    style={styles.select}
                >
                    <option value="">-- Select a port --</option>
                    {ports.ports?.map((port, index) => (
                        <option key={index} value={index}>
                            {port.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleSetPort}
                    disabled={selectedIndex === "" || mutation.isLoading}
                    style={{
                        ...styles.button,
                        opacity: selectedIndex === "" || mutation.isLoading ? 0.6 : 1,
                    }}
                >
                    {mutation.isLoading ? "Setting..." : "Set MIDI Port"}
                </button>
                <input style={{ backgroundColor: 'white', color: 'black', borderRadius: '5px', height: '1.5rem' }} type="number" onChange={(e) => setNote(e.target.value)} />
                <button style={styles.button} onClick={() => socket ? socket.emit('test_midi', note) : null}>Test Midi</button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
    },
    card: {
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "300px",
    },
    title: {
        textAlign: "center",
        marginBottom: "20px",
        fontSize: "24px",
        color: "#fffff",
    },
    label: {
        fontWeight: "bold",
        color: "#334155",
    },
    select: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        outline: "none",
    },
    button: {
        backgroundColor: "#3b82f6",
        color: "#fff",
        padding: "10px",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    loading: {
        textAlign: "center",
        marginTop: "100px",
        fontSize: "18px",
        color: "#475569",
    },
    error: {
        textAlign: "center",
        marginTop: "100px",
        fontSize: "18px",
        color: "#ef4444",
    },
};

export default ManageMidi;
