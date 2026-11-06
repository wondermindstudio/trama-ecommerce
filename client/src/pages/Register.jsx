import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { brand } from '../brand.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `Crear cuenta · ${brand.name}`;
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setErrors({});
    setSubmitting(true);
    try {
      await register(form);
      navigate(location.state?.from ?? '/cuenta', { replace: true });
    } catch (err) {
      // El backend devuelve errores por campo (Zod): los mostramos junto a cada input.
      if (err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      } else {
        setError(err.message);
      }
      setSubmitting(false);
    }
  }

  const field = (id, label, props) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        required
        value={form[id]}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={errors[id] ? `${id}-error` : props.hint ? `${id}-hint` : undefined}
        {...props.input}
      />
      {props.hint && !errors[id] && (
        <p id={`${id}-hint`} className="field__hint">
          {props.hint}
        </p>
      )}
      {errors[id] && (
        <p id={`${id}-error`} className="field__error">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="auth container">
      <h1 className="page-title">Crear cuenta</h1>
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {field('name', 'Nombre', { input: { autoComplete: 'name' } })}
        {field('email', 'Email', { input: { type: 'email', autoComplete: 'email' } })}
        {field('password', 'Contraseña', {
          input: { type: 'password', autoComplete: 'new-password', minLength: 8 },
          hint: 'Al menos 8 caracteres, con letras y números.',
        })}
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button--primary button--block" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="auth__alt">
        ¿Ya tenés cuenta?{' '}
        <Link to="/ingresar" state={location.state}>
          Ingresar
        </Link>
      </p>
    </div>
  );
}
