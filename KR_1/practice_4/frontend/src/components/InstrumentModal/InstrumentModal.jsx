import React, { useEffect, useState } from "react";
import "./InstrumentModal.scss";

export default function InstrumentModal({ open, mode, initialInstrument, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [rating, setRating] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        if (!open) return;

        setName(initialInstrument?.name ?? "");
        setCategory(initialInstrument?.category ?? "");
        setDescription(initialInstrument?.description ?? "");
        setPrice(initialInstrument?.price != null ? String(initialInstrument.price) : "");
        setStock(initialInstrument?.stock != null ? String(initialInstrument.stock) : "");
        setRating(initialInstrument?.rating != null ? String(initialInstrument.rating) : "");
        setImage(initialInstrument?.image ?? "");
    }, [open, initialInstrument]);

    if (!open) return null;

    const title = mode === "edit" ? "Редактирование инструмента" : "Добавление инструмента";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);
        const parsedRating = rating ? Number(rating) : 0;

        if (!trimmedName) {
            alert("Введите название инструмента");
            return;
        }

        if (!trimmedCategory) {
            alert("Введите категорию");
            return;
        }

        if (!trimmedDescription) {
            alert("Введите описание");
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            alert("Введите корректную цену");
            return;
        }

        if (!Number.isFinite(parsedStock) || parsedStock < 0) {
            alert("Введите корректное количество на складе");
            return;
        }

        if (rating && (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5)) {
            alert("Введите корректный рейтинг (0–5)");
            return;
        }

        onSubmit({
            id: initialInstrument?.id,
            name: trimmedName,
            category: trimmedCategory,
            description: trimmedDescription,
            price: parsedPrice,
            stock: parsedStock,
            rating: parsedRating,
            image: image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(trimmedName)}`
        });
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
            <div className="modal" role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Закрыть">×</button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Название *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например, Fender Stratocaster"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Категория *</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например, Гитары"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Описание *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Описание инструмента..."
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Цена (₽) *</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="85000"
                                min="0"
                                step="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>На складе (шт.) *</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="5"
                                min="0"
                                step="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Рейтинг (0–5)</label>
                            <input
                                type="number"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                placeholder="4.5"
                                min="0"
                                max="5"
                                step="0.1"
                            />
                        </div>

                        <div className="form-group">
                            <label>URL изображения</label>
                            <input
                                type="url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}