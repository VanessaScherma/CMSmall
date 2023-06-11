'use strict';

import dayjs from 'dayjs';

function Page(id, title, authorId, creationDate, publicationDate) {
  this.id = id;
  this.title = title;
  this.authorId = authorId;
  this.creationDate = dayjs(creationDate);
  this.publicationDate = dayjs(publicationDate);
}


/* Method to enable the proper serialization to string of the dayjs object. 
  Needed for the useLocation hook of react router when passing the answer to the edit form (AnswerComponent and AnswerForm). 
  this.serialize = () => {
    return {id: this.id, title: this.title, authorId: this.authorId, creationDate: this.creationDate.format('YYYY-MM-DD'), publicationDate: this.creationDate.format('YYYY-MM-DD')};
}
*/

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

export { Page, Content, User };