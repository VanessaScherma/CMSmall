'use strict';

const dayjs = require('dayjs');

function Page(id, title, authorId, creationDate, publicationDate) {
  this.id = id;
  this.title = title;
  this.authorId = authorId;
  this.creationDate = dayjs(creationDate);
  this.publicationDate = dayjs(publicationDate);
}

function Content(id, type, body, pageId, pageOrder) {
  this.id = id;
  this.type = type;
  this.body = body;
  this.pageId = pageId;
  this.pageOrder = pageOrder;
}

function User(id, name) {
  this.id = id;
  this.name = name;
}

module.exports = { Page, Content, User };