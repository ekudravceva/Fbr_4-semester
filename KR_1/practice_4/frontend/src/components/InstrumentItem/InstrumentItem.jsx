import React from "react";
import "./InstrumentItem.scss";

export default function InstrumentItem({ instrument, onEdit, onDelete }) {
    const isLowStock = instrument.stock < 5;

    return (
        <div className="instrument-card">
            <div className="instrument-image">
                <img src={instrument.image} alt={instrument.name} />
                {instrument.rating > 0 && (
                    <div className="instrument-rating">★ {instrument.rating}</div>
                )}
            </div>
            <div className="instrument-content">
                <div className="instrument-header">
                    <h3 className="instrument-name">{instrument.name}</h3>
                    <span className="instrument-category">{instrument.category}</span>
                </div>
                <p className="instrument-description">{instrument.description}</p>
                <div className="instrument-details">
                    <span className="instrument-price">{instrument.price.toLocaleString()} ₽</span>
                    <span className={`instrument-stock ${isLowStock ? 'low-stock' : ''}`}>
                        {instrument.stock} шт.
                    </span>
                </div>
                <div className="instrument-actions">
                    <button className="btn btn-edit" onClick={() => onEdit(instrument)}>
                        Редактировать
                    </button>
                    <button className="btn btn-delete" onClick={() => onDelete(instrument.id)}>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}