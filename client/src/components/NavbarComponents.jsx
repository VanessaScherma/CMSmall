import { useState, useEffect } from 'react';
import { Navbar, Container, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';
import API from '../API';

function NavHeader(props) {
  const [websiteName, setWebsiteName] = useState(''); // State to store the current website name
  const [newWebsiteName, setNewWebsiteName] = useState(''); // State to capture the new website name entered in the modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch the website name when props.dirty changes
    const fetchWebsiteName = async () => {
      const websiteName = await API.getWebsiteName();
      setWebsiteName(websiteName);
      props.setDirty(false); // Reset dirty state after fetching website name
    };
    fetchWebsiteName();
  }, [props.dirty]);

  const handleEditName = () => {
    setShowModal(true); // Display the modal for editing the website name
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  const handleSaveChanges = () => {
    API.editWebsiteName(newWebsiteName)
      .then(() => {
        // Actions to perform after successfully saving changes
        handleCloseModal(); // Close the modal
        props.setDirty(true); // Set dirty state to indicate changes have been made
      })
      .catch(error => {
        console.error('Error while saving changes:', error);
      });
  };

  return (
    <Navbar bg='dark' variant='dark'>
      <Container fluid>
        {/* Website name */}
        <Link to='/' className='navbar-brand'>{websiteName}</Link>
        
        {/* Front-Office link */}
        <Link to='/' className='btn btn-outline-light'>Front-Office</Link>
        
        {/* Edit website name button (for admins) */}
        {props.admin === 1 && (
          <Button variant='btn btn-secondary' onClick={handleEditName}>
            Edit name of the website
          </Button>
        )}
        
        {/* Back-Office link (if logged in) */}
        {props.loggedIn ? (
          <Link to='/pages' className='btn btn-outline-light'>Back-Office</Link>
        ) : (
          <></>
        )}

        {/* Login/Logout buttons */}
        {props.loggedIn ? (
          <LogoutButton logout={props.handleLogout} />
        ) : (
          <Link to='/login' className='btn btn-outline-light'>Login</Link>
        )}

        {/* Modal for editing the website name */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Website Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type='text'
              value={newWebsiteName}
              onChange={e => setNewWebsiteName(e.target.value)}
              placeholder='Enter new website name'
            />
          </Modal.Body>
          <Modal.Footer>
            {/* Close button */}
            <Button variant='secondary' onClick={handleCloseModal}>
              Close
            </Button>
            
            {/* Save Changes button */}
            <Button variant='primary' onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Navbar>
  );
}

export default NavHeader;