import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Alert, 
  InputGroup,
  Pagination,
  Badge
} from 'react-bootstrap';
import { lineasAPI } from '../services/api';
import { LineaProfundizacion, FiltrosLineas } from '../types';
import LineaCard from '../components/LineaCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Lineas: React.FC = () => {
  const [lineas, setLineas] = useState<LineaProfundizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState<FiltrosLineas>({
    area: '',
    estado: 'activa',
    pagina: 1,
    limite: 9,
    ordenar: 'nombre'
  });
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 9,
    totalPaginas: 0,
    tieneSiguiente: false,
    tieneAnterior: false
  });
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const areasConocimiento = [
    'Software', 'Hardware', 'Redes', 'IA', 'Ciberseguridad', 'Datos'
  ];

  useEffect(() => {
    cargarLineas();
  }, [filtros]);

  const cargarLineas = async () => {
    setLoading(true);
    try {
      const response = await lineasAPI.obtenerTodas(filtros);
      
      if (response.data.success) {
        setLineas(response.data.data || []);
        setPaginacion(response.data.paginacion || {
          total: 0,
          pagina: 1,
          limite: 9,
          totalPaginas: 0,
          tieneSiguiente: false,
          tieneAnterior: false
        });
      } else {
        setError('Error al cargar las líneas de profundización');
      }
    } catch (error: any) {
      console.error('Error cargando líneas:', error);
      setError(error.message || 'Error al cargar las líneas de profundización');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key: keyof FiltrosLineas, value: string | number) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'pagina' && { pagina: 1 }) // Resetear a página 1 cuando cambian otros filtros
    }));
  };

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerminoBusqueda(e.target.value);
  };

  const handleBuscar = async () => {
    if (terminoBusqueda.trim().length < 2) {
      setError('El término de búsqueda debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await lineasAPI.buscar(terminoBusqueda);
      if (response.data.success) {
        setLineas(response.data.data || []);
        setPaginacion({
          total: response.data.count || 0,
          pagina: 1,
          limite: 9,
          totalPaginas: 1,
          tieneSiguiente: false,
          tieneAnterior: false
        });
      }
    } catch (error: any) {
      setError(error.message || 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      area: '',
      estado: 'activa',
      pagina: 1,
      limite: 9,
      ordenar: 'nombre'
    });
    setTerminoBusqueda('');
    setError('');
  };

  const limpiarBusqueda = () => {
    setTerminoBusqueda('');
    cargarLineas();
  };

  const cambiarPagina = (nuevaPagina: number) => {
    handleFiltroChange('pagina', nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginacion = () => {
    if (paginacion.totalPaginas <= 1) return null;

    const items = [];
    const paginaActual = paginacion.pagina;
    const totalPaginas = paginacion.totalPaginas;

    // Botón anterior
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={!paginacion.tieneAnterior}
      />
    );

    // Números de página
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      if (
        pagina === 1 ||
        pagina === totalPaginas ||
        (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
      ) {
        items.push(
          <Pagination.Item
            key={pagina}
            active={pagina === paginaActual}
            onClick={() => cambiarPagina(pagina)}
          >
            {pagina}
          </Pagination.Item>
        );
      } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${pagina}`} />);
      }
    }

    // Botón siguiente
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={!paginacion.tieneSiguiente}
      />
    );

    return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
  };

  return (
    <Container className="my-4 fade-in">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>Líneas de Profundización</h1>
              <p className="lead text-muted mb-0">
                Explora todas las líneas de profundización disponibles
              </p>
            </div>
            <Badge bg="primary" className="fs-6">
              {paginacion.total} total
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Búsqueda y Filtros */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Buscar líneas por nombre, descripción, coordinador..."
              value={terminoBusqueda}
              onChange={handleBusquedaChange}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            />
            <Button 
              variant="outline-primary" 
              onClick={handleBuscar}
              disabled={terminoBusqueda.trim().length < 2}
            >
              <i className="bi bi-search"></i>
            </Button>
            {terminoBusqueda && (
              <Button 
                variant="outline-secondary" 
                onClick={limpiarBusqueda}
              >
                <i className="bi bi-x"></i>
              </Button>
            )}
          </InputGroup>
        </Col>
        
        <Col lg={6}>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Área</Form.Label>
                <Form.Select
                  value={filtros.area}
                  onChange={(e) => handleFiltroChange('area', e.target.value)}
                >
                  <option value="">Todas las áreas</option>
                  {areasConocimiento.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <option value="activa">Activas</option>
                  <option value="inactiva">Inactivas</option>
                  <option value="">Todos</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Ordenar por</Form.Label>
                <Form.Select
                  value={filtros.ordenar}
                  onChange={(e) => handleFiltroChange('ordenar', e.target.value)}
                >
                  <option value="nombre">Nombre (A-Z)</option>
                  <option value="fecha">Más recientes</option>
                  <option value="creditos">Menor créditos</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Botones de acción */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={limpiarFiltros}
              size="sm"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Limpiar Filtros
            </Button>
            {(filtros.area || filtros.estado !== 'activa' || filtros.ordenar !== 'nombre') && (
              <Badge bg="light" text="dark" className="ms-2 align-self-center">
                Filtros activos
              </Badge>
            )}
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* Lista de Líneas */}
      {loading ? (
        <LoadingSpinner texto="Cargando líneas de profundización..." />
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <p className="text-muted">
                Mostrando <strong>{lineas.length}</strong> de <strong>{paginacion.total}</strong> línea(s)
                {filtros.pagina && paginacion.totalPaginas > 1 && ` - Página ${filtros.pagina} de ${paginacion.totalPaginas}`}
              </p>
            </Col>
          </Row>

          {lineas.length === 0 ? (
            <Row>
              <Col>
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h4>No se encontraron líneas de profundización</h4>
                  <p className="text-muted">
                    {terminoBusqueda 
                      ? `No hay resultados para "${terminoBusqueda}". Intenta con otros términos.`
                      : 'Intenta ajustar los filtros de búsqueda o crea una nueva línea.'
                    }
                  </p>
                  {!terminoBusqueda && (
                    <Button variant="outline-primary" onClick={limpiarFiltros}>
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          ) : (
            <>
              <Row>
                {lineas.map((linea) => (
                  <Col key={linea._id} lg={4} md={6} className="mb-4">
                    <LineaCard linea={linea} />
                  </Col>
                ))}
              </Row>

              {/* Paginación */}
              {renderPaginacion()}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default Lineas;