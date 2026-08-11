import React from 'react';
import { LogIn, CheckCircle2 } from 'lucide-react';
import './CustomAlertModal.css';

export default function CustomAlertModal({ isOpen, type = 'warning', title, message, primaryBtnText, onPrimaryAction, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="alert-modal-overlay" onClick={onCancel}>
            <div className="alert-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className={`alert-icon-wrapper ₹{type}`}>
                    {type === 'warning' ? <LogIn size={28} /> : <CheckCircle2 size={28} />}
                </div>

                <h3 className="alert-modal-title">{title}</h3>
                <p className="alert-modal-message">{message}</p>

                <div className="alert-actions">
                    {onCancel && (
                        <button className="alert-btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button className="alert-btn-primary" onClick={onPrimaryAction}>
                        {primaryBtnText}
                    </button>
                </div>
            </div>
        </div>
    );
}