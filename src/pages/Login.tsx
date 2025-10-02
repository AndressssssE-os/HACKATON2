import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  
  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (estaAutenticado) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [estaAutenticado, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.data.success && response.data.token && response.data.usuario) {
        login(response.data.token, response.data.usuario);
        
        // Redirigir a la página que intentaban acceder o al home
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
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
                <i className="bi bi-person-circle display-4 text-primary mb-3"></i>
                <h2>Iniciar Sesión</h2>
                <p className="text-muted">Accede a tu cuenta para continuar</p>
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

                <Form.Group className="mb-4">
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
                    placeholder="Ingresa tu contraseña"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    La contraseña debe tener al menos 6 caracteres.
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
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  ¿No tienes cuenta?{' '}
                  <Link to="/registro" className="text-decoration-none fw-semibold">
                    Regístrate aquí
                  </Link>
                </p>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <small className="text-muted">
                  Al iniciar sesión, aceptas nuestros{' '}
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

export default Login;