import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tab,
  Tabs
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

const Perfil: React.FC = () => {
  const { usuario, actualizarUsuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Datos del perfil
  const [perfilData, setPerfilData] = useState({
    nombre: '',
    email: ''
  });

  // Datos para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (usuario) {
      setPerfilData({
        nombre: usuario.nombre,
        email: usuario.email
      });
    }
  }, [usuario]);

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerfilData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const actualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // En una implementación real, aquí llamarías a la API para actualizar el perfil
      // const response = await authAPI.actualizarPerfil(perfilData);
      
      // Por ahora, simulamos la actualización
      setTimeout(() => {
        if (usuario) {
          const usuarioActualizado = {
            ...usuario,
            nombre: perfilData.nombre,
            email: perfilData.email
          };
          actualizarUsuario(usuarioActualizado);
          setSuccess('Perfil actualizado exitosamente');
        }
        setLoading(false);
      }, 1000);

    } catch (error: any) {
      setError(error.message || 'Error al actualizar el perfil');
      setLoading(false);
    }
  };

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.nuevaPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (passwordData.nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await authAPI.cambiarPassword(passwordData.passwordActual, passwordData.nuevaPassword);
      setSuccess('Contraseña actualizada exitosamente');
      setPasswordData({
        passwordActual: '',
        nuevaPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!usuario) {
    return <LoadingSpinner texto="Cargando perfil..." />;
  }

  return (
    <ProtectedRoute>
      <Container className="my-4 fade-in">
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-4">
              <i className="bi bi-person-circle display-1 text-primary mb-3"></i>
              <h1>Mi Perfil</h1>
              <p className="lead text-muted">
                Gestiona tu información personal y configuración de cuenta
              </p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                <i className="bi bi-check-circle-fill me-2"></i>
                {success}
              </Alert>
            )}

            <Tabs defaultActiveKey="perfil" className="mb-4">
              {/* Pestaña de Información del Perfil */}
              <Tab eventKey="perfil" title={
                <span>
                  <i className="bi bi-person me-1"></i>
                  Información Personal
                </span>
              }>
                <Card>
                  <Card.Body>
                    <Form onSubmit={actualizarPerfil}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nombre Completo</Form.Label>
                            <Form.Control
                              type="text"
                              name="nombre"
                              value={perfilData.nombre}
                              onChange={handlePerfilChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={perfilData.email}
                              onChange={handlePerfilChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label>Rol</Form.Label>
                        <Form.Control
                          type="text"
                          value={usuario.rol === 'admin' ? 'Administrador' : 'Estudiante'}
                          disabled
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          {usuario.rol === 'admin' 
                            ? 'Tienes permisos para gestionar líneas de profundización'
                            : 'Puedes explorar y ver las líneas de profundización disponibles'
                          }
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Guardar Cambios
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                {/* Información adicional */}
                <Row className="mt-4">
                  <Col md={6}>
                    <Card className="bg-light">
                      <Card.Body>
                        <h6 className="card-title">
                          <i className="bi bi-info-circle me-2"></i>
                          Información de la Cuenta
                        </h6>
                        <div className="small">
                          <div className="mb-1">
                            <strong>ID de usuario:</strong> {usuario.id}
                          </div>
                          {usuario.createdAt && (
                            <div className="mb-1">
                              <strong>Cuenta creada:</strong> {formatFecha(usuario.createdAt)}
                            </div>
                          )}
                          {usuario.ultimoLogin && (
                            <div>
                              <strong>Último acceso:</strong> {formatFecha(usuario.ultimoLogin)}
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* Pestaña de Seguridad */}
              <Tab eventKey="seguridad" title={
                <span>
                  <i className="bi bi-shield-lock me-1"></i>
                  Seguridad
                </span>
              }>
                <Card>
                  <Card.Body>
                    <h5 className="card-title mb-4">Cambiar Contraseña</h5>
                    <Form onSubmit={cambiarPassword}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contraseña Actual</Form.Label>
                        <Form.Control
                          type="password"
                          name="passwordActual"
                          value={passwordData.passwordActual}
                          onChange={handlePasswordChange}
                          required
                          placeholder="Ingresa tu contraseña actual"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          name="nuevaPassword"
                          value={passwordData.nuevaPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                          placeholder="Repite la nueva contraseña"
                        />
                      </Form.Group>

                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Cambiando contraseña...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-key me-2"></i>
                            Cambiar Contraseña
                          </>
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </ProtectedRoute>
  );
};

export default Perfil;