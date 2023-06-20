import { Button, Table, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';

function PageTable(props) {

  return (
      <Table striped>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publication date</th>
          </tr>
        </thead>
        <tbody>
          {
            props.pages.map((p) => <PageRow page={p} key={p.id} authorMap={props.authorMap} userName={props.userName}
            admin={props.admin} dirty={props.dirty} setDirty={props.setDirty} showEditDeleteButtons={props.showEditDeleteButtons}/>)
          }
        </tbody>
      </Table>
  );
}

function PageRow(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const dirty = props.dirty;
  const setDirty = props.setDirty;

  const currentDate = dayjs();

  const authorName = props.authorMap[props.page.authorId];
  const creationDate = props.page.creationDate.format('YYYY-MM-DD');
  
  let publicationDate;
  if (!dayjs(props.page.publicationDate).isValid()) {
    publicationDate = 'Draft';
  } else if (dayjs(props.page.publicationDate) > currentDate) {
    publicationDate = `Scheduled on ${props.page.publicationDate.format('YYYY-MM-DD')}`;
  } else {
    publicationDate = props.page.publicationDate.format('YYYY-MM-DD');
  }

  const deletePage = () => {
    API.deletePage(props.page.id)
      .then(() => {
        setDirty(true); // Esegui altre operazioni o aggiornamenti nel front-end dopo la cancellazione della pagina
        return API.deleteContents(props.page.id); // Ritorna una nuova promessa per la chiamata deleteContents()
      })
      .then(() => {
        // Operazioni o aggiornamenti successivi dopo la cancellazione dei contenuti
      })
      .catch(error => {
        console.error("Errore durante la cancellazione della pagina:", error);
      });
    handleClose();
  }

  const showButton = (props.admin && props.showEditDeleteButtons) || (authorName === props.userName && props.showEditDeleteButtons);

  return (
    <>
      <tr>
        <td><Link to={`/pages/${props.page.id}`} 
          state={{id: props.page.id, title: props.page.title, author: authorName, creationDate: creationDate, publicationDate: publicationDate}}>
            {props.page.title}</Link>
        </td>
        <td>{authorName}</td>
        <td>{publicationDate}</td>
        <td>{showButton && (
          <>
            <Link to={`/pages/${props.page.id}/edit`} className='btn btn-primary'>
            Edit</Link>
            <Button onClick={handleShow} variant="danger" className="button-table">Delete</Button>
          </>
        )}
        </td>
      </tr>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure to delete the page "{props.page.title}"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={() => {
            deletePage(props.page.id)
          }}>
            Delete page
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PageTable;