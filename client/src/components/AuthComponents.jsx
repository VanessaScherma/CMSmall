import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    props.login(credentials)
    .then()
    .catch((err) => { 
      setErrorMessage(err); setShow(true); 
    });
  };

  return (
    <div className='mx-auto my-4' style={{ maxWidth: '400px' }}>
      <h1 className="pb-3">Login</h1>
      <Form onSubmit={handleSubmit}>
        <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errorMessage}
          </Alert>
        {/* Username field */}
        <Form.Group controlId='username'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            value={username}
            onChange={ev => setUsername(ev.target.value)}
            required={true}
          />
        </Form.Group>

        {/* Password field */}
        <Form.Group controlId='password' className='mt-4'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            value={password}
            onChange={ev => setPassword(ev.target.value)}
            required={true}
            minLength={6}
          />
        </Form.Group>

        {/* Submit button */}
        <Button type='submit' className='mt-4 d-block mx-auto'>Login</Button>
      </Form>
    </div>
  );
}

function LogoutButton(props) {
  return (
    <Button variant='outline-light' onClick={props.logout}>
      Logout
    </Button>
  );
}

export { LoginForm, LogoutButton };