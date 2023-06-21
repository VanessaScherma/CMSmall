import { useState } from 'react';
import { Form, ButtonGroup, Button, Dropdown, DropdownButton, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';

function PageForm(props) {
  // State variables
  const [formElements, setFormElements] = useState(props.contents ? props.contents : []);
  const [title, setTitle] = useState(props.page ? props.page.title : '');
  const [authorId, setAuthorId] = useState((props.admin && props.page) ? props.page.authorId : props.authorId);
  const creationDate = props.page ? dayjs(props.page.creationDate).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY');
  const [publicationDate, setPublicationDate] = useState((props.page && props.page.publicationDate) ? dayjs(props.page.publicationDate).format('YYYY-MM-DD') : '');

  const [headerCount, setHeaderCount] = useState(() => {
    if (props.contents) {
      return props.contents.reduce((count, content) => {
        if (content.type === 'header') {
          return count + 1;
        }
        return count;
      }, 0);
    }
    return 0;
  });

  const [paragraphImageCount, setParagraphImageCount] = useState(() => {
    if (props.contents) {
      return props.contents.reduce((count, content) => {
        if (content.type === 'paragraph' || content.type === 'image') {
          return count + 1;
        }
        return count;
      }, 0);
    }
    return 0;
  });

  const navigate = useNavigate();

  // Add a new header element
  const handleAddHeader = () => {
    const newHeader = {
      id: Date.now().toString(),
      type: 'header',
    };

    setFormElements((prevElements) => [...prevElements, newHeader]);
    setHeaderCount(headerCount + 1);
  };

  // Add a new paragraph element
  const handleAddParagraph = () => {
    const newParagraph = {
      id: Date.now().toString(),
      type: 'paragraph',
    };

    setFormElements((prevElements) => [...prevElements, newParagraph]);
    setParagraphImageCount(paragraphImageCount + 1);
  };

  // Add a new image element
  const handleAddImage = (event) => {
    const imageType = event.target.innerText;
    const newImage = {
      id: Date.now().toString(),
      type: 'image',
      body: `${imageType.toLowerCase().replace(/\s/g, '-')}.jpg`, // Add the image name to the body of the formElement
      image: `${imageType.toLowerCase().replace(/\s/g, '-')}.jpg`,
    };
    setFormElements((prevElements) => [...prevElements, newImage]);
    setParagraphImageCount(paragraphImageCount + 1);
  };

  // Handle input change for form elements
  const handleInputChange = (index, e) => {
    const updatedFormElements = [...formElements];
    updatedFormElements[index].body = e.target.value;
    setFormElements(updatedFormElements);
  };

  // Remove a form element
  const handleRemoveForm = (id, type) => {
    setFormElements((prevElements) =>
      prevElements.filter((element) => element.id !== id)
    );

    if (type === 'header') {
      setHeaderCount(headerCount - 1);
    } else if (type === 'paragraph' || type === 'image') {
      setParagraphImageCount(paragraphImageCount - 1);
    }
  };

  // Move a form element up in the list
  const handleMoveUp = (id) => {
    const index = formElements.findIndex((element) => element.id === id);
    if (index > 0) {
      const updatedElements = [...formElements];
      [updatedElements[index - 1], updatedElements[index]] = [
        updatedElements[index],
        updatedElements[index - 1],
      ];
      setFormElements(updatedElements);
    }
  };

  // Move a form element down in the list
  const handleMoveDown = (id) => {
    const index = formElements.findIndex((element) => element.id === id);
    if (index < formElements.length - 1) {
      const updatedElements = [...formElements];
      [updatedElements[index], updatedElements[index + 1]] = [
        updatedElements[index + 1],
        updatedElements[index],
      ];
      setFormElements(updatedElements);
    }
  };

 // Handle form submission
const handleSubmit = (event) => {
  event.preventDefault();

  // Create the page object
  const page = {
    title: title.trim(), // Extract and trim the title
    creationDate: dayjs().format('YYYY-MM-DD'), // Set the current creation date
    publicationDate: publicationDate !== '' ? dayjs(publicationDate).format('YYYY-MM-DD') : null, // Format the publication date or set it to null if empty
  };

  if (props.admin) {
    // Assign authorId based on admin or non-admin case
    page.authorId = authorId;
  } else {
    page.authorId = props.authorId;
  }

  if (props.page) {
    // Update existing page
    page.id = props.page.id;
    API.updatePage(page)
      .then(() => {
        // Update page contents after page update
        updatePageContents(props.page.id);
        props.setDirty(true);
        navigate('/pages');
      })
      .catch((e) => {
        console.error(e);
      });
  } else {
    // Add a new page
    API.addPage(page)
      .then((pageId) => {
        // Create an array of content objects based on formElements
        const contents = formElements.map((element, index) => {
          return {
            type: element.type,
            body: element.body,
            pageId: pageId,
            pageOrder: index + 1,
          };
        });

        // Create an array of promises for adding content
        const contentPromises = contents.map((content) => {
          return API.addContent(content);
        });

        return Promise.all(contentPromises);
      })
      .then(() => {
        props.setDirty(true);
        navigate('/pages');
      })
      .catch((e) => {
        console.error(e);
      });
  }
};

// Update page contents
const updatePageContents = (pageId) => {
  // Get the existing content IDs
  const existingContentIds = props.contents.map((content) => content.id);

  // Create an array of promises for updating or adding content
  const updateContentsPromises = formElements.map((element, index) => {
    const content = {
      id: element.id,
      type: element.type,
      body: element.body,
      pageId: pageId,
      pageOrder: index + 1,
    };

    if (element.id && existingContentIds.includes(element.id)) {
      // Update existing content
      return API.updateContent(content);
    } else {
      if (!existingContentIds.includes(element.id)) {
        // Add new content
        return API.addContent(content);
      } else {
        // Resolve promise if content already exists
        return Promise.resolve();
      }
    }
  });

  return Promise.all(updateContentsPromises);
};

  return (
    <>
      <Form onSubmit={handleSubmit} className='top-space'>
        {/* Title and Author */}
        <Row>
          <Col sm={8}>
            <Form.Group controlId='title'>
              <Form.Label>Title</Form.Label>
              <Form.Control type='text' required={true} value={title} onChange={event => setTitle(event.target.value)} onFocus={() => console.log(title)} />
            </Form.Group>
          </Col>
          <Col>
          {props.admin === 1 ? (
            <Form.Group controlId='author'>
              <Form.Label>Author</Form.Label>
              <Form.Control as='select' defaultValue={props.page ? props.page.authorId : props.authorId} onChange={(e) => setAuthorId(e.target.value)}>
                {props.authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          ) : (
            <Form.Group controlId='author'>
              <Form.Label>Author</Form.Label>
              <Form.Control value={props.userName} disabled />
            </Form.Group>
          )}
          </Col>
        </Row>
        {/* Creation and Publication Date */}
        <Row>
          <Col>
            <Form.Group controlId='creationDate' className='top-space'>
              <Form.Label>Creation date</Form.Label>
              <Form.Control value={creationDate} disabled />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='publicationDate' className='top-space'>
              <Form.Label>Publication date</Form.Label>
              <Form.Control type='date' value={publicationDate} onChange={event => setPublicationDate(event.target.value)} />
              {dayjs().isAfter(publicationDate) && (
                <Form.Text className='text-danger'>Publication date must be after the creation date.</Form.Text>
              ) }
            </Form.Group>
          </Col>
        </Row>
        {/* Add Elements */}
        <div className='text-center top-space'>
          <ButtonGroup aria-label='addOptions'>
            <Button variant='secondary' onClick={handleAddHeader}>Add header</Button>
            <Button variant='secondary' onClick={handleAddParagraph}>Add paragraph</Button>
            <DropdownButton as={ButtonGroup} title='Add image' variant='secondary' id='bg-nested-dropdown'>
              <Dropdown.Item eventKey='1' onClick={handleAddImage}>Beach</Dropdown.Item>
              <Dropdown.Item eventKey='2' onClick={handleAddImage}>Mountain</Dropdown.Item>
              <Dropdown.Item eventKey='3' onClick={handleAddImage}>Japan</Dropdown.Item>
              <Dropdown.Item eventKey='4' onClick={handleAddImage}>Northern Lights</Dropdown.Item>
            </DropdownButton>
          </ButtonGroup>
        </div>
        {/* Render Form Elements */}
        {formElements.map((element, index) => {
          return (
            <Form.Group controlId={element.id} key={element.id}>
              {/* Header */}
              {element.type === 'header' && (<Form.Label className='top-space'>Header</Form.Label>)}
              {/* Paragraph */}
              {element.type === 'paragraph' && (<Form.Label className='top-space'>Paragraph</Form.Label>)}
              {/* Image */}
              {element.type === 'image' && (
                <>
                  <img src={`/images/${element.body}`} alt={element.body} value={element.body} style={{ width: '600px', height: 'auto', marginRight: '10px' }} className='top-space' />
                  <input type='hidden' value={element.image || ''} />
                </>
              )}
              {/* Body */}
              <Form.Control
                as={element.type === 'paragraph' ? 'textarea' : 'input'}
                rows={element.type === 'paragraph' ? '3' : null}
                required={true}
                value={element.body || ''}
                onChange={event => handleInputChange(index, event)}
              />
              {/* Remove, Move Up, Move Down buttons */}
              <div className='top-space'>
                <ButtonGroup>
                  {index !== 0 && (
                    <Button variant='secondary' onClick={() => handleMoveUp(element.id)}>Move Up</Button>
                  )}
                  {index !== formElements.length - 1 && (
                    <Button variant='secondary' onClick={() => handleMoveDown(element.id)}>Move Down</Button>
                  )}
                  <Button variant='secondary' onClick={() => handleRemoveForm(element.id, element.type)}>Remove</Button>
                </ButtonGroup>
              </div>
            </Form.Group>
          );
        })}
        {/* Save and Cancel buttons */}
        <div className='top-space text-center'>
          <Button variant='primary' type='submit'>Save</Button>{' '}
          <Link to='/pages'>
            <Button variant='secondary'>Cancel</Button>
          </Link>
        </div>
      </Form>
    </>
  );
}

export default PageForm;