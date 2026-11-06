export default function QuantityStepper({ value, onChange, min = 1, max = 20, label = 'Cantidad' }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Restar una unidad"
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Sumar una unidad"
      >
        +
      </button>
    </div>
  );
}
