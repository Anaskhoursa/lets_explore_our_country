import React, { useState, useEffect } from 'react';
import './manageCaspar.css';
import { getCasparConfig, updateCasparConfig } from '../api/context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sections = ['question', 'score', 'background', 'name', 'logo', 'roundTimer', 'vs'];

export default function ManageCasparSettings() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: ['caspar-config'],
        queryFn: getCasparConfig,
        onSuccess: (data) => {
            console.log(data)
            setForm(data);
        },
    });

    useEffect(() => {
        setForm(data)
    }, [data])

    const mutation = useMutation({
        mutationFn: async ({ type }) => {
            const updates = ['channel', 'layer', 'channel2', 'layer2', 'path', 'loop'].map((field) =>
                updateCasparConfig({
                    type,
                    field,
                    value: form[type][field],
                })
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caspar-config'] });
        },
    });

    const handleInputChange = (type, field, value) => {
        setForm((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    };

    const handleSave = async (type) => {
        setSaving((prev) => ({ ...prev, [type]: true }));
        try {
            await mutation.mutateAsync({ type });
        } catch (err) {
            console.error(`Failed to update ${type} config:`, err);
        } finally {
            setSaving((prev) => ({ ...prev, [type]: false }));
        }
    };

    if (isLoading || !form)
        return <p>Chargement du fichier de configuration...</p>;

    return (
        <div className="caspar-settings-container">

            {sections.map((section) => (
                <div key={section} className="caspar-section">
                    <h2>{section.charAt(0).toUpperCase() + section.slice(1)}</h2>

                    <div className="input-group">
                        <label>Channel:</label>
                        <input
                            type="text"
                            value={form[section]?.channel || ''}
                            onChange={(e) => handleInputChange(section, 'channel', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Layer:</label>
                        <input
                            type="text"
                            value={form[section]?.layer || ''}
                            onChange={(e) => handleInputChange(section, 'layer', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Channel 2:</label>
                        <input
                            type="text"
                            value={form[section]?.channel2 || ''}
                            onChange={(e) => handleInputChange(section, 'channel2', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Layer 2:</label>
                        <input
                            type="text"
                            value={form[section]?.layer2 || ''}
                            onChange={(e) => handleInputChange(section, 'layer2', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Path:</label>
                        <input
                            type="text"
                            value={form[section]?.path || ''}
                            onChange={(e) => handleInputChange(section, 'path', e.target.value)}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file) {
                                    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                                    handleInputChange(section, 'path', nameWithoutExt);
                                }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                        />

                    </div>
                    <div style={{marginBottom: '2.5rem', display : section === 'background' ? '' : 'none'}}>
                        <input type="checkbox" style={{display : section === 'background' ? '' : 'none'}} checked={form[section]?.loop} onChange={(e) => handleInputChange(section, 'loop', e.target.checked)}
                    />
                    <label style={{color: 'black', fontWeight: 'bold', marginBottom: '4rem'}}>Loop?</label>
                    </div>
                    

                    <button onClick={() => handleSave(section)} disabled={saving[section]} className='caspar-button'>
                        {saving[section] ? 'Enregistrement...' : 'Sauvegarder'}
                    </button>
                </div>
            ))}
        </div>
    );
}
