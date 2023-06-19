import { Navbar, Container, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';
import { useState, useEffect } from 'react';
import API from '../API';

function NavHeader(props) {
  const [websiteName, setWebsiteName] = useState('');
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchWebsiteName = async() => {
      const websiteName = await API.getWebsiteName();
      setWebsiteName(websiteName);
      props.setDirty(false);
    }
    fetchWebsiteName();
  }, [props.dirty]);

  const handleEditName = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveChanges = () => {
    API.editWebsiteName(newWebsiteName)
      .then(() => {
        // Operazioni dopo il salvataggio dei cambiamenti
        handleCloseModal();
        props.setDirty(true);
      })
      .catch(error => {
        console.error('Errore durante il salvataggio delle modifiche:', error);
        // Gestisci l'errore nel front-end
      });
  };

  return (
    <Navbar bg="dark" variant="dark">
      <Container fluid>
        <Link to='/' className='navbar-brand'>{websiteName}</Link>
        {props.admin === 1 &&
        <Button variant="btn btn-secondary" onClick={handleEditName}>
          Edit name of the website
        </Button>
        }
        {props.loggedIn ?
          <Link to='/pages' className='btn btn-outline-light'>Back-Office</Link> : <></>}
        {props.loggedIn ? 
          <LogoutButton logout={props.handleLogout} /> :
          <Link to='/login'className='btn btn-outline-light'>Login</Link>
        }
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Website Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              value={newWebsiteName}
              onChange={e => setNewWebsiteName(e.target.value)}
              placeholder="Enter new website name"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Navbar>
  );
}
export default NavHeader;