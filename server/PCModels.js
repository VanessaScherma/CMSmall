'use strict';

const dayjs = require('dayjs');

function Page(id, title, authorId, creationDate, publicationDate) {
  this.id = id;
  this.title = title;
  this.authorId = authorId;
  this.creationDate = dayjs(creationDate);
  this.publicationDate = dayjs(publicationDate);
}

function Content(id, type, content, pageId, order) {
  this.id = id;
  this.type = type;
  this.content = content;
  this.pageId = pageId;
  this.order = order;
}

function User(id, name) {
  this.id = id;
  this.name = name;
}

module.exports = { Page, Content, User };