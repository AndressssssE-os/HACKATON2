import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Container className="my-5 text-center fade-in">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
          </div>
          <h1 className="display-4 fw-bold text-muted">404</h1>
          <h2 className="mb-4">Página No Encontrada</h2>
          <p className="lead text-muted mb-4">
            La página que estás buscando no existe o ha sido movida a otra ubicación.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button as={Link} to="/" variant="primary">
              <i className="bi bi-house me-2"></i>
              Ir al Inicio
            </Button>
            <Button as={Link} to="/lineas" variant="outline-primary">
              <i className="bi bi-search me-2"></i>
              Explorar Líneas
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;