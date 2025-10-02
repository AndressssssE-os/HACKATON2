import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

interface LoadingSpinnerProps {
  texto?: string;
  tamaño?: 'sm' | 'lg';
  centrado?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  texto = 'Cargando...', 
  tamaño,
  centrado = true 
}) => {
  const spinner = (
    <div className="d-flex align-items-center">
      <Spinner 
        animation="border" 
        role="status" 
        size={tamaño}
        className={texto ? 'me-2' : ''}
      >
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
      {texto && <span>{texto}</span>}
    </div>
  );

  if (centrado) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col xs="auto">
            {spinner}
          </Col>
        </Row>
      </Container>
    );
  }

  return spinner;
};

export default LoadingSpinner;