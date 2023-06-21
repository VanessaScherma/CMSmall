import { useState } from 'react';
import { Button, Table, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';

function PageTable(props) {
  // Render a table with page data
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
        {/* Map through the pages and render a PageRow component for each page */}
        {props.pages.map((page) => (
          <PageRow
            page={page}
            key={page.id}
            authorMap={props.authorMap}
            userName={props.userName}
            admin={props.admin}
            dirty={props.dirty}
            setDirty={props.setDirty}
            showEditDeleteButtons={props.showEditDeleteButtons}
          />
        ))}
      </tbody>
    </Table>
  );
}

function PageRow(props) {
  const [showModal, setShowModal] = useState(false); // State to control delete confirmation modal

  const handleCloseModal = () => setShowModal(false); // Close modal
  const handleShowModal = () => setShowModal(true); // Show modal

  const currentDate = dayjs();
  const { page, authorMap, userName, admin, setDirty, showEditDeleteButtons } = props;
  const authorName = authorMap[page.authorId];
  const creationDate = page.creationDate.format('YYYY-MM-DD');

  let publicationDate;
  if (!dayjs(page.publicationDate).isValid()) {
    publicationDate = 'Draft';
  } else if (dayjs(page.publicationDate) > currentDate) {
    publicationDate = `Scheduled on ${page.publicationDate.format('YYYY-MM-DD')}`;
  } else {
    publicationDate = page.publicationDate.format('YYYY-MM-DD');
  }

  const deletePage = () => {
    // Delete the page and its contents
    API.deletePage(page.id)
      .then(() => {
        return API.deleteContents(page.id);
      })
      .then(() => {
        setDirty(true); // Trigger a refresh after page deletion
      })
      .catch((error) => {
        console.error('Error deleting the page:', error);
      })
      .finally(() => {
        handleCloseModal(); // Close the modal after deletion
      });
  };

  const showButton =
    (admin && showEditDeleteButtons) || (authorName === userName && showEditDeleteButtons);

  return (
    <>
      <tr>
        {/* Display the page title and link to the page */}
        <td>
          <Link
            to={{
              pathname: `/pages/${page.id}`,
              state: {
                id: page.id,
                title: page.title,
                author: authorName,
                creationDate,
                publicationDate,
              },
            }}
          >
            {page.title}
          </Link>
        </td>
        <td>{authorName}</td>
        <td>{publicationDate}</td>
        <td>
          {/* Show edit and delete buttons if conditions are met */}
          {showButton && (
            <>
              <Link to={`/pages/${page.id}/edit`} className='btn btn-primary'>
                Edit
              </Link>
              <Button onClick={handleShowModal} variant='danger' className='button-table'>
                Delete
              </Button>
            </>
          )}
        </td>
      </tr>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the page "{page.title}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant='danger' onClick={deletePage}>
            Delete Page
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PageTable;