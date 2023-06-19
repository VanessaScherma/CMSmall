import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import './App.css';

// react-bootstrap section
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert } from 'react-bootstrap';

import { useEffect, useState } from 'react';

// Components
import NavHeader from './components/NavbarComponents';
import { FrontLayout, BackLayout, AddLayout, EditLayout, NotFoundLayout } from './components/PageLayout';
import { LoginForm } from './components/AuthComponents';
import { SinglePage } from './components/SinglePageComponents';

import API from './API';
function App() {
  // state
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(0);
  const [message, setMessage] = useState('');
  const [pages, setPages] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorMap, setAuthorMap] = useState({});

  const [dirty, setDirty] = useState(false);

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

  useEffect(() => {
    const init = async () => {
      try {
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true);
        const admin = await API.checkAdmin(user.id);
        setAdmin(admin);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setUser(user);
      const admin = await API.checkAdmin(user.id);
      setAdmin(admin);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
      setUser(null);
      console.log(err);
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
    setAdmin(0);
    // clean up everything
    setMessage('');
  };

  return (
    <BrowserRouter>
      <Container fluid>
        <NavHeader loggedIn={loggedIn} admin={admin} handleLogout={handleLogout} dirty={dirty} setDirty={setDirty}/> 
        <Routes>
          <Route path='/' element={ <FrontLayout pages={pages} authorMap={authorMap} /> } />
          <Route path='pages/:id' element={ <SinglePage /> } />
          <Route path='pages' element={ loggedIn? <BackLayout pages={pages} setPages={setPages} authorMap={authorMap} user={user} admin={admin} dirty={dirty} setDirty={setDirty} /> : <NotFoundLayout/> } />
          <Route path='add' element={ loggedIn? <AddLayout user={user} authors={authors} admin={admin} dirty={dirty} setDirty={setDirty}/> : <NotFoundLayout/> } />
          <Route path='/pages/:id/edit' element={ loggedIn? <EditLayout pages={pages} authors={authors} user={user} admin={admin} dirty={dirty} setDirty={setDirty}/> : <NotFoundLayout/> } />
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />} />
        </Routes>
        {message && <Row>
          <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
        </Row> }
      </Container>
    </BrowserRouter>
  )
}

export default App;
