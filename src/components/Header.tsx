import React from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { usuario, estaAutenticado, logout, esAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="bi bi-mortarboard-fill me-2"></i>
          <span className="fw-bold">Líneas de Profundización</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={isActiveRoute('/') ? 'active fw-semibold' : ''}
            >
              Inicio
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/lineas" 
              className={isActiveRoute('/lineas') ? 'active fw-semibold' : ''}
            >
              Líneas
            </Nav.Link>
            {esAdmin && (
              <Nav.Link 
                as={Link} 
                to="/admin" 
                className={isActiveRoute('/admin') ? 'active fw-semibold' : ''}
              >
                Administrar
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {estaAutenticado ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="outline-light" 
                  id="dropdown-user"
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {usuario?.nombre}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/perfil">
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/registro')}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;