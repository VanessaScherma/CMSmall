import { Navbar, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';

function NavHeader(props) {
  return (
    <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Link to='/' className='navbar-brand'>CMSmall</Link>
          {props.loggedIn ?
            <Link to='/pages' className='btn btn-outline-light'>Back-Office</Link> : <></>}
          {props.loggedIn ? 
            <LogoutButton logout={props.handleLogout} /> :
            <Link to='/login'className='btn btn-outline-light'>Login</Link>
          }
        </Container>
    </Navbar>
  );
}
export default NavHeader;