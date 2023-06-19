import { Page, User, Content } from './PCModels';
const SERVER_URL = 'http://localhost:3001';

const getWebsiteName = async () => {
  const response = await fetch(SERVER_URL + `/api/website`, {
  });
  if(response.ok) {
    const websiteNameJson = await response.json();
    const websiteName = websiteNameJson[0]?.name;
    console.log("API: " + websiteName);
    return websiteName;
  }
  else
    throw new Error('Internal server error');
}

const editWebsiteName = async (name) => {
  const response = await fetch(SERVER_URL + '/api/website', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name })
  });
  console.log(name);
  if(!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
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
    return contentsJson.map(c => new Content(c.id, c.type, c.body, c.pageId, c.pageOrder));
  }
  else
    throw new Error('Internal server error');
}

const getPage = async (pageId) => {
  const response = await fetch(SERVER_URL + `/api/pages/${pageId}`, {
    credentials: 'include',
  });
  if(response.ok) {
    const pageJson = await response.json();
    return pageJson;
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

const updatePage = async (page) => {
  const response = await fetch(SERVER_URL + "/api/pages/" + page.id, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify(page)
  });

  if(!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const updateContent = async (content) => {
  const response = await fetch(SERVER_URL + "/api/contents/" + content.id, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify(content)
  });

  if(!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const deletePage = async (pageId) => {
  const response = await fetch(SERVER_URL + "/api/pages/" + pageId, {
      method: 'DELETE',
      credentials: 'include'
  });
  if(response.ok) {
    return null;
  } else
    throw new Error('Internal server error');
}

const deleteContents = async (pageId) => {
  const response = await fetch(SERVER_URL + "/api/pages/" + pageId + "/contents", {
      method: 'DELETE',
      credentials: 'include'
  });
  if(response.ok) {
    return null;
  } else
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

  const checkAdmin = async (userId) => {
    const response = await fetch(SERVER_URL + `/api/users/${userId}`, {
      credentials: 'include',
    });
    if(response.ok) {
      const adminJson = await response.json();
      return adminJson;
    }
    else
      throw new Error('Internal server error');
  }

const API = { getWebsiteName, editWebsiteName, getPages, getAuthors, getContents, getPage, addPage, addContent, updatePage, updateContent, deletePage, deleteContents, logIn, logOut, getUserInfo, checkAdmin};
export default API;