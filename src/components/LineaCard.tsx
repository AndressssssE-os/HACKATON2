import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { LineaProfundizacion } from '../types';

interface LineaCardProps {
  linea: LineaProfundizacion;
  onEdit?: (linea: LineaProfundizacion) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const LineaCard: React.FC<LineaCardProps> = ({ 
  linea, 
  onEdit, 
  onDelete, 
  showActions = false 
}) => {
  const getAreaBadgeClass = (area: string) => {
    const areaClasses: { [key: string]: string } = {
      'Software': 'badge-software',
      'Hardware': 'badge-hardware',
      'Redes': 'badge-redes',
      'IA': 'badge-ia',
      'Ciberseguridad': 'badge-ciberseguridad',
      'Datos': 'badge-datos'
    };
    return areaClasses[area] || 'bg-secondary';
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-100 shadow-sm card-hover">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0">
        <h5 className="mb-0 text-primary">{linea.nombre}</h5>
        <div>
          <Badge 
            bg={linea.estado === 'activa' ? 'success' : 'secondary'}
            className="me-2"
          >
            {linea.estado === 'activa' ? 'Activa' : 'Inactiva'}
          </Badge>
          <Badge className={getAreaBadgeClass(linea.areaConocimiento)}>
            {linea.areaConocimiento}
          </Badge>
        </div>
      </Card.Header>
      
      <Card.Body className="d-flex flex-column">
        <p className="text-muted flex-grow-1">{linea.descripcion}</p>
        
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-person-badge me-2 text-primary"></i>
            <strong>Coordinador:</strong>
            <span className="ms-2">{linea.coordinador}</span>
          </div>
          
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-envelope me-2 text-primary"></i>
            <strong>Email:</strong>
            <a 
              href={`mailto:${linea.emailCoordinador}`}
              className="ms-2 text-decoration-none"
            >
              {linea.emailCoordinador}
            </a>
          </div>
          
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-award me-2 text-primary"></i>
            <strong>Créditos requeridos:</strong>
            <Badge bg="outline-primary" className="ms-2">
              {linea.creditosRequeridos}
            </Badge>
          </div>
        </div>
        
        <div className="mb-3">
          <strong>
            <i className="bi bi-book me-2 text-primary"></i>
            Materias ({linea.materias.length}):
          </strong>
          <div className="mt-2">
            {linea.materias.slice(0, 3).map((materia, index) => (
              <Badge 
                key={index} 
                bg="outline-secondary" 
                className="me-1 mb-1 text-dark border"
                style={{ fontSize: '0.75rem' }}
              >
                {materia}
              </Badge>
            ))}
            {linea.materias.length > 3 && (
              <Badge bg="light" text="dark" className="border">
                +{linea.materias.length - 3} más
              </Badge>
            )}
          </div>
        </div>

        {linea.fechaCreacion && (
          <div className="mt-auto pt-2 border-top">
            <small className="text-muted">
              <i className="bi bi-calendar me-1"></i>
              Creada: {formatFecha(linea.fechaCreacion)}
            </small>
          </div>
        )}
        
        {showActions && (onEdit || onDelete) && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => onEdit(linea)}
                  className="flex-fill"
                >
                  <i className="bi bi-pencil me-1"></i>
                  Editar
                </Button>
              )}
              {onDelete && linea._id && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => onDelete(linea._id!)}
                  className="flex-fill"
                >
                  <i className="bi bi-trash me-1"></i>
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LineaCard;