import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Carousel, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { lineasAPI } from '../services/api';
import { LineaProfundizacion, Estadisticas } from '../types';
import LineaCard from '../components/LineaCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const [lineasDestacadas, setLineasDestacadas] = useState<LineaProfundizacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        
        // Cargar líneas destacadas y estadísticas en paralelo
        const [lineasResponse, statsResponse] = await Promise.all([
          lineasAPI.obtenerTodas({ estado: 'activa', limite: 3 }),
          lineasAPI.obtenerEstadisticas()
        ]);

        if (lineasResponse.data.success) {
          setLineasDestacadas(lineasResponse.data.data || []);
        }

        if (statsResponse.data.success) {
          setEstadisticas(statsResponse.data.data || null);
        }

      } catch (error: any) {
        console.error('Error cargando datos iniciales:', error);
        setError('Error al cargar los datos. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  const carouselItems = [
    {
      title: "Líneas de Profundización",
      description: "Especialízate en las áreas más demandadas de la Ingeniería de Sistemas",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      buttonText: "Explorar Líneas",
      buttonLink: "/lineas"
    },
    {
      title: "Inteligencia Artificial",
      description: "Domina el futuro con machine learning y deep learning",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      buttonText: "Ver Líneas de IA",
      buttonLink: "/lineas?area=IA"
    },
    {
      title: "Ciberseguridad",
      description: "Protege los sistemas del mañana",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      buttonText: "Ver Líneas de Ciberseguridad",
      buttonLink: "/lineas?area=Ciberseguridad"
    }
  ];

  const areasConocimiento = [
    { nombre: 'Software', icono: 'bi-code-slash', color: 'primary' },
    { nombre: 'Hardware', icono: 'bi-cpu', color: 'danger' },
    { nombre: 'Redes', icono: 'bi-wifi', color: 'info' },
    { nombre: 'IA', icono: 'bi-robot', color: 'warning' },
    { nombre: 'Ciberseguridad', icono: 'bi-shield-lock', color: 'success' },
    { nombre: 'Datos', icono: 'bi-database', color: 'secondary' }
  ];

  if (loading) {
    return <LoadingSpinner texto="Cargando contenido..." />;
  }

  if (error) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </Container>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Section con Carousel */}
      <Carousel fade controls indicators className="carousel-custom">
        {carouselItems.map((item, index) => (
          <Carousel.Item key={index}>
            <div
              className="carousel-item d-flex align-items-center justify-content-center text-white"
              style={{
                height: '500px',
                background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="text-center">
                <h1 className="display-4 fw-bold mb-4">{item.title}</h1>
                <p className="lead mb-4 fs-5">{item.description}</p>
                <Button 
                  as={Link} 
                  to={item.buttonLink} 
                  variant="primary" 
                  size="lg"
                  className="px-4 py-2"
                >
                  {item.buttonText}
                </Button>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Container className="my-5">
        {/* Sección de Introducción */}
        <Row className="mb-5">
          <Col>
            <div className="text-center">
              <h2 className="mb-4">Bienvenido al Sistema de Líneas de Profundización</h2>
              <p className="lead fs-5 text-muted max-w-800 mx-auto">
                Descubre las diferentes áreas de especialización en Ingeniería de Sistemas 
                y elige la que mejor se adapte a tus intereses profesionales. 
                Desarrolla competencias específicas que te prepararán para los retos del mercado laboral.
              </p>
            </div>
          </Col>
        </Row>

        {/* Estadísticas */}
        {estadisticas && (
          <Row className="mb-5">
            <Col>
              <div className="text-center mb-4">
                <h3>Nuestras Líneas en Números</h3>
              </div>
              <Row className="g-4">
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="display-6 fw-bold text-primary mb-2">
                        {estadisticas.totalLineas}
                      </div>
                      <Card.Text className="text-muted">Total de Líneas</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="display-6 fw-bold text-success mb-2">
                        {estadisticas.lineasActivas}
                      </div>
                      <Card.Text className="text-muted">Líneas Activas</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="display-6 fw-bold text-warning mb-2">
                        {Math.round(estadisticas.creditosPromedio)}
                      </div>
                      <Card.Text className="text-muted">Créditos Promedio</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} sm={6}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <div className="display-6 fw-bold text-info mb-2">
                        {Object.keys(estadisticas.lineasPorArea).length}
                      </div>
                      <Card.Text className="text-muted">Áreas de Conocimiento</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}

        {/* Áreas de Conocimiento */}
        <Row className="mb-5">
          <Col>
            <h3 className="text-center mb-4">Áreas de Conocimiento</h3>
            <Row className="g-3">
              {areasConocimiento.map((area) => (
                <Col key={area.nombre} lg={2} md={4} sm={6}>
                  <Card className="text-center border-0 card-hover h-100">
                    <Card.Body className="d-flex flex-column justify-content-center">
                      <i className={`${area.icono} display-6 text-${area.color} mb-3`}></i>
                      <Card.Title className="h6">{area.nombre}</Card.Title>
                      {estadisticas && (
                        <Badge bg="light" text="dark" className="mt-2">
                          {estadisticas.lineasPorArea[area.nombre] || 0} líneas
                        </Badge>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Líneas Destacadas */}
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">Líneas Destacadas</h3>
              <Button as={Link} to="/lineas" variant="outline-primary">
                Ver Todas las Líneas
              </Button>
            </div>
            {lineasDestacadas.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                <p className="text-muted">No hay líneas de profundización disponibles.</p>
              </div>
            ) : (
              <Row>
                {lineasDestacadas.map((linea) => (
                  <Col key={linea._id} lg={4} className="mb-4">
                    <LineaCard linea={linea} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Información Adicional */}
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <i className="bi bi-bullseye display-4 text-primary mb-3"></i>
                <Card.Title>🎯 Objetivo</Card.Title>
                <Card.Text className="text-muted">
                  Brindar a los estudiantes la oportunidad de especializarse en áreas 
                  específicas de la Ingeniería de Sistemas, fortaleciendo sus competencias 
                  técnicas y profesionales para enfrentar los desafíos del mercado laboral.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <i className="bi bi-award display-4 text-success mb-3"></i>
                <Card.Title>📚 Beneficios</Card.Title>
                <Card.Text className="text-muted text-start">
                  • Especialización en áreas de alta demanda<br/>
                  • Mejora de oportunidades laborales<br/>
                  • Desarrollo de competencias específicas<br/>
                  • Networking con profesionales del área<br/>
                  • Preparación para estudios de posgrado
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;