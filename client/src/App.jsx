import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// react-bootstrap section
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert } from 'react-bootstrap';

import { useEffect, useState } from 'react';

// Components
import NavHeader from './components/NavbarComponents';
import { FrontLayout } from './components/PageLayout';
import { LoginForm } from './components/AuthComponents';

import API from './API';

function App() {
  // state
  const [loggedIn, setLoggedIn] = useState(false);
  const [pages, setPages] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorMap, setAuthorMap] = useState({});

  useEffect(()=> {
    const fetchData = async () => {
      const pagesData = await API.getPages();
      const authorsData = await API.getAuthors();

      const authorMapData = authorsData.reduce((map, author) => {
        map[author.id] = author.name;
        return map;
      }, {});

      setPages(pagesData);
      setAuthors(authorsData);
      setAuthorMap(authorMapData);
    };

    fetchData();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setMessage('');
  };

  return (
    <BrowserRouter>
      <Container fluid>
        <NavHeader loggedIn={loggedIn} handleLogout={handleLogout}/> 
        <Routes>
          <Route path='/' element={ <FrontLayout pages={pages} authorMap={authorMap} /> } />
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

export default App;
