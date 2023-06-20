import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light fixed-bottom">
      <Container className="text-center py-1">
        <p>&copy; 2023 - All rights reserved.</p>
      </Container>
    </footer>
  );
}

export default Footer;

