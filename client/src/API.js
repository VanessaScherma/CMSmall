import { Page, User, Content } from './PCModels';
const SERVER_URL = 'http://localhost:3001';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

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

const getContents = async (pageId) => {
  const response = await fetch(SERVER_URL + `/api/pages/${pageId}/contents`);
  if(response.ok) {
    const contentsJson = await response.json();
    return contentsJson.map(c => new Content(c.id, c.type, c.body, c.pageId, c.order));
  }
  else
    throw new Error('Internal server error');
}

const addPage = async (page) => {
  const response = await fetch(SERVER_URL + "/api/pages", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(page) 
  });
  if (response.ok) {
    const pageJson = await response.json();
    return pageJson.id;
  }
  else
    throw new Error('Internal server error');
}

const addContent = async (content) => {
  const response = await fetch(SERVER_URL + "/api/contents", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(content) 
  });
  console.log(response);
  if (response.ok) {
    return null;
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
      console.log("Session ok" + user);
      return user;
    } else {
      console.log("Session NOT ok" + user);
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

const API = { getPages, getAuthors, getContents, addPage, addContent, logIn, logOut, getUserInfo};
export default API;