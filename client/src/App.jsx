import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { useEffect, useState } from 'react';
import { Container, Toast } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Components
import NavHeader from './components/NavbarComponents';
import { FrontLayout, BackLayout, AddLayout, EditLayout, NotFoundLayout } from './components/PageLayout';
import { LoginForm } from './components/AuthComponents';
import { SinglePage } from './components/SinglePageComponents';
import Footer from './components/Footer';

import MessageContext from './messageCtx';
import API from './API';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);  // State to keep track if the user is currently logged-in.
  const [user, setUser] = useState(null); // State to contain the user's info

  const [pages, setPages] = useState([]); // State to contain the list of pages
  const [authors, setAuthors] = useState([]); // State to contain the list of authors
  const [authorMap, setAuthorMap] = useState({}); // State to map authors' names with their ids

  const [messageQueue, setMessageQueue] = useState([]);
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
  }, [user]);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await API.getUserInfo();  // User info, if already logged in
        setUser(user);
        setLoggedIn(true);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      }
    };
    init();
  }, []);

   // If some errors occur, the error message will be shown in a toast.
   const handleErrors = (err) => {
    let msg = '';
    if (err.error) {
      msg = err.error;
    } else if (typeof err === "string") {
      msg = err;
    } else {
      msg = "Unknown Error";
    }

    setMessageQueue(prevQueue => [...prevQueue, msg]);
  };

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setUser(user);
    }catch(err) {
      setUser(null);
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <MessageContext.Provider value={{ handleErrors }}>
        <NavHeader loggedIn={loggedIn} user={user} handleLogout={handleLogout} dirty={dirty} setDirty={setDirty}/> 
        <Container fluid style={{ marginBottom: '4rem' }}>
          <Routes>
            <Route path='/' element={ <FrontLayout pages={pages} authorMap={authorMap} /> } />
            <Route path='/pages/:id' element={ <SinglePage /> } />
            <Route path='/pages' element={ loggedIn? <BackLayout pages={pages} setPages={setPages} authorMap={authorMap} user={user} dirty={dirty} setDirty={setDirty} /> : <Navigate replace to='/' /> } />
            <Route path='/add' element={ loggedIn? <AddLayout user={user} authors={authors} dirty={dirty} setDirty={setDirty}/> : <Navigate replace to='/' /> } />
            <Route path='/pages/:id/edit' element={ loggedIn? <EditLayout pages={pages} authors={authors} user={user} dirty={dirty} setDirty={setDirty}/> : <Navigate replace to='/' />} />
            <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />} />
            <Route path='*' element={<NotFoundLayout />} />
          </Routes>
          
          <div>
            {messageQueue.length !== 0 && (
              <Toast onClose={() => setMessageQueue([])} delay={4000} autohide bg="danger">
                <Toast.Body>{messageQueue}</Toast.Body>
              </Toast>
            )}
          </div>
        </Container>
        <Footer />
      </MessageContext.Provider>
    </BrowserRouter>
  )
}

export default App;
