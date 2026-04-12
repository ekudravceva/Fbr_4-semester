import React from "react";
import InstrumentItem from "../InstrumentItem/InstrumentItem";
import "./InstrumentsList.scss";

export default function InstrumentsList({ instruments, onEdit, onDelete }) {
    if (!instruments.length) {
        return <div className="empty-state">Инструментов пока нет</div>;
    }

    return (
        <div className="instruments-grid">
            {instruments.map((instrument) => (
                <InstrumentItem
                    key={instrument.id}
                    instrument={instrument}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}