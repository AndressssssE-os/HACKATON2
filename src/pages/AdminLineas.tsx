import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Modal,
  Form,
  Badge
} from 'react-bootstrap';
import { lineasAPI } from '../services/api';
import { LineaProfundizacion } from '../types';
import LineaCard from '../components/LineaCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const AdminLineas: React.FC = () => {
  const [lineas, setLineas] = useState<LineaProfundizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [lineaActual, setLineaActual] = useState<LineaProfundizacion | null>(null);

  const { esAdmin } = useAuth();

  const areasConocimiento = [
    'Software', 'Hardware', 'Redes', 'IA', 'Ciberseguridad', 'Datos'
  ];

  const estadoOpciones = [
    { value: 'activa', label: 'Activa' },
    { value: 'inactiva', label: 'Inactiva' }
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    coordinador: '',
    emailCoordinador: '',
    areaConocimiento: '',
    creditosRequeridos: 0,
    materias: [''],
    estado: 'activa'
  });

  useEffect(() => {
    if (esAdmin) {
      cargarLineas();
    }
  }, [esAdmin]);

  const cargarLineas = async () => {
    setLoading(true);
    try {
      const response = await lineasAPI.obtenerTodas({});
      if (response.data.success) {
        setLineas(response.data.data || []);
      }
    } catch (error: any) {
      setError(error.message || 'Error al cargar las líneas');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      coordinador: '',
      emailCoordinador: '',
      areaConocimiento: '',
      creditosRequeridos: 0,
      materias: [''],
      estado: 'activa'
    });
    setLineaActual(null);
    setEditando(false);
  };

  const abrirModalCrear = () => {
    limpiarFormulario();
    setShowModal(true);
  };

  const abrirModalEditar = (linea: LineaProfundizacion) => {
    setFormData({
      nombre: linea.nombre,
      descripcion: linea.descripcion,
      coordinador: linea.coordinador,
      emailCoordinador: linea.emailCoordinador,
      areaConocimiento: linea.areaConocimiento,
      creditosRequeridos: linea.creditosRequeridos,
      materias: [...linea.materias],
      estado: linea.estado
    });
    setLineaActual(linea);
    setEditando(true);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setTimeout(limpiarFormulario, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditosRequeridos' ? parseInt(value) || 0 : value
    }));
  };

  const handleMateriaChange = (index: number, value: string) => {
    const nuevasMaterias = [...formData.materias];
    nuevasMaterias[index] = value;
    setFormData(prev => ({
      ...prev,
      materias: nuevasMaterias
    }));
  };

  const agregarMateria = () => {
    setFormData(prev => ({
      ...prev,
      materias: [...prev.materias, '']
    }));
  };

  const eliminarMateria = (index: number) => {
    if (formData.materias.length > 1) {
      const nuevasMaterias = formData.materias.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        materias: nuevasMaterias
      }));
    }
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida');
      return false;
    }
    if (!formData.coordinador.trim()) {
      setError('El coordinador es requerido');
      return false;
    }
    if (!formData.emailCoordinador.trim() || !formData.emailCoordinador.includes('@')) {
      setError('El email del coordinador debe ser válido');
      return false;
    }
    if (!formData.areaConocimiento) {
      setError('El área de conocimiento es requerida');
      return false;
    }
    if (formData.creditosRequeridos <= 0) {
      setError('Los créditos requeridos deben ser mayores a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarFormulario()) return;

    // Filtrar materias vacías
    const materiasFiltradas = formData.materias.filter(materia => materia.trim() !== '');

    const datosLinea = {
      ...formData,
      materias: materiasFiltradas
    };

    try {
      if (editando && lineaActual?._id) {
        await lineasAPI.actualizar(lineaActual._id, datosLinea);
        setSuccess('Línea actualizada exitosamente');
      } else {
        await lineasAPI.crear(datosLinea);
        setSuccess('Línea creada exitosamente');
      }

      cerrarModal();
      cargarLineas();
    } catch (error: any) {
      setError(error.message || `Error al ${editando ? 'actualizar' : 'crear'} la línea`);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta línea de profundización?')) {
      return;
    }

    try {
      await lineasAPI.eliminar(id);
      setSuccess('Línea eliminada exitosamente');
      cargarLineas();
    } catch (error: any) {
      setError(error.message || 'Error al eliminar la línea');
    }
  };

  // Si no es admin, no mostrar nada
  if (!esAdmin) {
    return (
      <Container className="my-5">
        <Alert variant="warning" className="text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No tienes permisos para acceder a esta página.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4 fade-in">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Administrar Líneas</h1>
              <p className="lead text-muted mb-0">
                Gestiona las líneas de profundización del sistema
              </p>
            </div>
            <Button variant="primary" onClick={abrirModalCrear}>
              <i className="bi bi-plus-circle me-2"></i>
              Nueva Línea
            </Button>
          </div>
        </Col>
      </Row>

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

      {loading ? (
        <LoadingSpinner texto="Cargando líneas..." />
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <Badge bg="primary" className="fs-6">
                {lineas.length} línea(s) en el sistema
              </Badge>
            </Col>
          </Row>

          {lineas.length === 0 ? (
            <Row>
              <Col>
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h4>No hay líneas de profundización</h4>
                  <p className="text-muted mb-4">
                    Comienza creando la primera línea de profundización.
                  </p>
                  <Button variant="primary" onClick={abrirModalCrear}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primera Línea
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <Row>
              {lineas.map((linea) => (
                <Col key={linea._id} lg={4} md={6} className="mb-4">
                  <LineaCard
                    linea={linea}
                    onEdit={abrirModalEditar}
                    onDelete={handleEliminar}
                    showActions={true}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* Modal para crear/editar línea */}
      <Modal show={showModal} onHide={cerrarModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`bi ${editando ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
            {editando ? 'Editar Línea' : 'Nueva Línea'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Nombre de la línea"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Área de Conocimiento *</Form.Label>
                  <Form.Select
                    name="areaConocimiento"
                    value={formData.areaConocimiento}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un área</option>
                    {areasConocimiento.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                placeholder="Describe la línea de profundización..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinador *</Form.Label>
                  <Form.Control
                    type="text"
                    name="coordinador"
                    value={formData.coordinador}
                    onChange={handleInputChange}
                    required
                    placeholder="Nombre del coordinador"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email del Coordinador *</Form.Label>
                  <Form.Control
                    type="email"
                    name="emailCoordinador"
                    value={formData.emailCoordinador}
                    onChange={handleInputChange}
                    required
                    placeholder="coordinador@universidad.edu"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Créditos Requeridos *</Form.Label>
                  <Form.Control
                    type="number"
                    name="creditosRequeridos"
                    value={formData.creditosRequeridos}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    {estadoOpciones.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Materias</Form.Label>
                <Button
                  variant="outline-primary"
                  size="sm"
                  type="button"
                  onClick={agregarMateria}
                >
                  <i className="bi bi-plus me-1"></i>
                  Agregar Materia
                </Button>
              </div>
              {formData.materias.map((materia, index) => (
                <div key={index} className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    value={materia}
                    onChange={(e) => handleMateriaChange(index, e.target.value)}
                    placeholder={`Materia ${index + 1}`}
                  />
                  {formData.materias.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      type="button"
                      onClick={() => eliminarMateria(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>
              ))}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              <i className={`bi ${editando ? 'bi-check' : 'bi-plus'} me-1`}></i>
              {editando ? 'Actualizar' : 'Crear'} Línea
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminLineas;