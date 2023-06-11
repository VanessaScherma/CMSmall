import { Page, User } from './PCModels';
const SERVER_URL = 'http://localhost:3001';

const getPages = async () => {
  const response = await fetch(SERVER_URL + '/api/pages');
  if(response.ok) {
    const pagesJson = await response.json();
    return pagesJson.map(p => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
  }
  else
    throw new Error('Internal server error');
}

const getAuthors = async () => {
  const response = await fetch(SERVER_URL + `/api/users`);
  if(response.ok) {
    const authorsJson = await response.json();
    return authorsJson.map(u => new User(u.id, u.name));
  }
  else
    throw new Error('Internal server error');
}



const logIn = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    if(response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };
  
  const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };
  
  const logOut = async() => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok)
      return null;
  }

const API = { getPages, getAuthors, logIn, logOut, getUserInfo};
export default API;