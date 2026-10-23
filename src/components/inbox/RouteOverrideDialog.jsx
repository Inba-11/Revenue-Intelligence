import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { ROUTES } from '../../context/AppContext.jsx';

export default function RouteOverrideDialog({ open, current, onClose, onSave }) {
  const [route, setRoute] = useState(current);
  const [reason, setReason] = useState('');
  return (
    <Modal
      open={open}
      title="Change route"
      onClose={onClose}
      footer={(
        <>
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn primary" type="button" onClick={() => onSave(route, reason.trim())}>Save route</button>
        </>
      )}
    >
      <p className="muted">Choose the manager’s route. Your decision is stored separately from the source suggestion and survives later imports.</p>
      <label className="field-label" htmlFor="route-select">Route</label>
      <select id="route-select" className="select" value={route} onChange={(event) => setRoute(event.target.value)}>
        {ROUTES.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <label className="field-label" htmlFor="route-reason">Why are you changing it? <span className="muted">(optional)</span></label>
      <textarea
        id="route-reason"
        className="input textarea"
        rows="3"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Add a short note for the next reviewer"
      />
    </Modal>
  );
}
