import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5 className="d-flex align-items-center mb-3">
              <i className="bi bi-mortarboard-fill me-2"></i>
              Líneas de Profundización
            </h5>
            <p className="mb-3">
              Sistema de gestión para líneas de profundización en Ingeniería de Sistemas. 
              Facilita la especialización de estudiantes en áreas tecnológicas de vanguardia.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-github"></i>
              </a>
            </div>
          </Col>
          <Col md={3}>
            <h6>Enlaces Rápidos</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light text-decoration-none">Inicio</Link></li>
              <li><Link to="/lineas" className="text-light text-decoration-none">Líneas</Link></li>
              <li><a href="#" className="text-light text-decoration-none">Contacto</a></li>
              <li><a href="#" className="text-light text-decoration-none">Soporte</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Contacto</h6>
            <ul className="list-unstyled">
              <li>
                <i className="bi bi-geo-alt me-2"></i>
                Facultad de Ingeniería
              </li>
              <li>
                <i className="bi bi-envelope me-2"></i>
                info@universidad.edu
              </li>
              <li>
                <i className="bi bi-telephone me-2"></i>
                +57 1 234 5678
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col md={6}>
            <p className="mb-0">
              &copy; {currentYear} Universidad - Facultad de Ingeniería. Todos los derechos reservados.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <small>
              Desarrollado con React, TypeScript, Node.js y MongoDB
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;