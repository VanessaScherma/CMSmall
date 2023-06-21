import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { useEffect, useState } from 'react';
import { Container, Row, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Components
import NavHeader from './components/NavbarComponents';
import { FrontLayout, BackLayout, AddLayout, EditLayout, NotFoundLayout } from './components/PageLayout';
import { LoginForm } from './components/AuthComponents';
import { SinglePage } from './components/SinglePageComponents';
import Footer from './components/Footer';

import API from './API';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);  // State to keep track if the user is currently logged-in.
  const [user, setUser] = useState(null); // State to contain the user's info
  const [admin, setAdmin] = useState(0);  // State that contains 1 if the user is an admin, 0 otherwise

  const [pages, setPages] = useState([]); // State to contain the list of pages
  const [authors, setAuthors] = useState([]); // State to contain the list of authors
  const [authorMap, setAuthorMap] = useState({}); // State to map authors' names with their ids

  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  //To fetch the necessary data (pages and authors) from the database
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
        const user = await API.getUserInfo();  // User info, if already logged in
        setUser(user);
        setLoggedIn(true);
        const admin = await API.checkAdmin(user.id);  // Check if the user is an admin
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
      <NavHeader loggedIn={loggedIn} admin={admin} handleLogout={handleLogout} dirty={dirty} setDirty={setDirty}/> 
      <Container fluid style={{ marginBottom: '4rem' }}>
        <Routes>
          <Route path='/' element={ <FrontLayout pages={pages} authorMap={authorMap} /> } />
          <Route path='pages/:id' element={ <SinglePage /> } />
          <Route path='pages' element={ loggedIn? <BackLayout pages={pages} setPages={setPages} authorMap={authorMap} user={user} admin={admin} dirty={dirty} setDirty={setDirty} /> : <NotFoundLayout/> } />
          <Route path='add' element={ loggedIn? <AddLayout user={user} authors={authors} admin={admin} dirty={dirty} setDirty={setDirty}/> : <NotFoundLayout/> } />
          <Route path='/pages/:id/edit' element={ loggedIn? <EditLayout pages={pages} authors={authors} user={user} admin={admin} dirty={dirty} setDirty={setDirty}/> : <NotFoundLayout/> } />
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />} />
          <Route path='*' element={<NotFoundLayout />} />
        </Routes>
        {message && <Row className='mt-4'>
          <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
        </Row> }
      </Container>
      <Footer />
    </BrowserRouter>
  )
}

export default App;
