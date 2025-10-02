import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'estudiante'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  
  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (estaAutenticado) {
      navigate('/', { replace: true });
    }
  }, [estaAutenticado, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    // Puedes agregar más validaciones aquí si es necesario
    return minLength;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Validaciones personalizadas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.registro(
        formData.nombre,
        formData.email,
        formData.password,
        formData.rol
      );
      
      if (response.data.success && response.data.token && response.data.usuario) {
        login(response.data.token, response.data.usuario);
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error al registrar usuario. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado, mostrar spinner mientras redirige
  if (estaAutenticado) {
    return <LoadingSpinner texto="Redirigiendo..." />;
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow border-0 fade-in">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus display-4 text-primary mb-3"></i>
                <h2>Crear Cuenta</h2>
                <p className="text-muted">Regístrate en el sistema</p>
              </div>

              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-person me-2"></i>
                    Nombre Completo
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    minLength={2}
                    placeholder="Tu nombre completo"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa tu nombre completo.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-envelope me-2"></i>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="usuario@ejemplo.com"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un email válido.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-person-badge me-2"></i>
                    Rol
                  </Form.Label>
                  <Form.Select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Selecciona "Administrador" solo si tienes permisos para gestionar las líneas.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-lock me-2"></i>
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    La contraseña debe tener al menos 6 caracteres.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="bi bi-lock-fill me-2"></i>
                    Confirmar Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Repite tu contraseña"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor confirma tu contraseña.
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Registrarse
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <small className="text-muted">
                  Al registrarte, aceptas nuestros{' '}
                  <a href="#" className="text-decoration-none">Términos de servicio</a>
                  {' '}y{' '}
                  <a href="#" className="text-decoration-none">Política de privacidad</a>.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Registro;