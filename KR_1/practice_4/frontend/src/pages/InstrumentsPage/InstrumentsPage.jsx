import React, { useState, useEffect } from "react";
import "./InstrumentsPage.scss";
import InstrumentsList from "../../components/InstrumentsList/InstrumentsList";
import InstrumentModal from "../../components/InstrumentModal/InstrumentModal";
import { api } from "../../api";

export default function InstrumentsPage() {
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingInstrument, setEditingInstrument] = useState(null);

    useEffect(() => {
        loadInstruments();
    }, []);

    const loadInstruments = async () => {
        try {
            setLoading(true);
            const data = await api.getInstruments();
            setInstruments(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки инструментов");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingInstrument(null);
        setModalOpen(true);
    };

    const openEdit = (instrument) => {
        setModalMode("edit");
        setEditingInstrument(instrument);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingInstrument(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить инструмент?");
        if (!ok) return;

        try {
            await api.deleteInstrument(id);
            setInstruments((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления инструмента");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newInstrument = await api.createInstrument(payload);
                setInstruments((prev) => [...prev, newInstrument]);
            } else {
                const updatedInstrument = await api.updateInstrument(payload.id, payload);
                setInstruments((prev) =>
                    prev.map((i) => (i.id === payload.id ? updatedInstrument : i))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения инструмента");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Music Shop</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Каталог музыкальных инструментов</h1>
                        <button className="btn btn--primary" onClick={openCreate}>
                            + Добавить инструмент
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Загрузка...</div>
                    ) : (
                        <InstrumentsList
                            instruments={instruments}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Music Shop
                </div>
            </footer>

            <InstrumentModal
                open={modalOpen}
                mode={modalMode}
                initialInstrument={editingInstrument}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}