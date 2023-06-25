import { Page, Content, User } from './PCUModels';
const SERVER_URL = 'http://localhost:3001';

// Retrieves the website name from the server
const getWebsiteName = async () => {
  const response = await fetch(SERVER_URL + '/api/website')
  if (response.ok) {
    const websiteNameJson = await response.json();
    const websiteName = websiteNameJson[0]?.name;
    return websiteName;
  } else {
    throw new Error('Internal server error');
  }
}

// Updates the website name on the server
const editWebsiteName = async (name, userId) => {
  const response = await fetch(SERVER_URL + '/api/website', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, userId })
  });
  if (!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  } else {
    return null;
  }
}

// Retrieves pages from the server
const getPages = async () => {
  const response = await fetch(SERVER_URL + '/api/pages');
  if (response.ok) {
    const pagesJson = await response.json();
    return pagesJson.map(p => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
  } else {
    throw new Error('Internal server error');
  }
}

// Retrieves authors from the server
const getAuthors = async () => {
  const response = await fetch(SERVER_URL + '/api/users');
  if (response.ok) {
    const authorsJson = await response.json();
    return authorsJson.map(u => new User(u.id, u.name));
  } else {
    throw new Error('Internal server error');
  }
}

// Retrieves contents of a page from the server
const getContents = async (pageId) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + pageId + '/contents');
  if (response.ok) {
    const contentsJson = await response.json();
    return contentsJson.map(c => new Content(c.id, c.type, c.body, c.pageId, c.pageOrder));
  } else {
    throw new Error('Internal server error');
  }
}

// Retrieves a single page from the server
const getPage = async (pageId) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + pageId, {
    credentials: 'include',
  });
  if (response.ok) {
    const pageJson = await response.json();
    return pageJson;
  } else {
    throw new Error('Internal server error');
  }
}

// Adds a new page on the server
const addPage = async (page) => {
  const response = await fetch(SERVER_URL + '/api/pages', {
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
  } else {
    throw new Error('Internal server error');
  }
}

// Adds a new content on the server
const addContent = async (content) => {
  const response = await fetch(SERVER_URL + '/api/contents', {
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
  } else {
    throw new Error('Internal server error');
  }
}

// Updates a page on the server
const updatePage = async (page) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + page.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(page)
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  } else {
    return null;
  }
}

// Updates a content on the server
const updateContent = async (content) => {
  const response = await fetch(SERVER_URL + '/api/contents/' + content.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(content)
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  } else {
    return null;
  }
}

// Deletes a page from the server
const deletePage = async (pageId) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + pageId, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok) {
    return null;
  } else {
    throw new Error('Internal server error');
  }
}

// Deletes contents of a page from the server
const deleteContents = async (pageId) => {
  const response = await fetch(SERVER_URL + '/api/pages/' + pageId + '/contents', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok) {
    return null;
  } else {
    throw new Error('Internal server error');
  }
}

// Logs in a user
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

// Retrieves user information
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user; // an object with the error coming from the server
  }
};

// Logs out the current user
const logOut = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok) {
    return null;
  }
}

// Checks if a user is an admin
const checkAdmin = async (userId) => {
  const response = await fetch(SERVER_URL + '/api/users/' + userId + '/admin', {
    credentials: 'include',
  });
  if (response.ok) {
    const adminJson = await response.json();
    return adminJson;
  } else {
    throw new Error('Internal server error');
  }
}

const API = { getWebsiteName, editWebsiteName, getPages, getAuthors, getContents, getPage, addPage,
  addContent, updatePage, updateContent, deletePage, deleteContents, logIn, logOut, getUserInfo, checkAdmin };
export default API;
