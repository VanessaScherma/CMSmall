import { useState, useContext } from 'react';
import { Form, ButtonGroup, Button, Dropdown, DropdownButton, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import MessageContext from '../messageCtx';
import API from '../API';

function PageForm(props) {
  const [formElements, setFormElements] = useState(props.contents ? props.contents : []);
  const [title, setTitle] = useState(props.page ? props.page.title : '');
  const [authorId, setAuthorId] = useState((props.admin && props.page) ? props.page.authorId : props.authorId);
  const creationDate = props.page ? dayjs(props.page.creationDate).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY');
  const creationDateDayjs = props.page ? dayjs(props.page.creationDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
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
  const {handleErrors} = useContext(MessageContext);

  const handleAddHeader = () => {
    const newHeader = {
      id: Date.now().toString(),
      type: 'header',
    };

    setFormElements((prevElements) => [...prevElements, newHeader]);
    setHeaderCount(headerCount + 1);
  };

  const handleAddParagraph = () => {
    const newParagraph = {
      id: Date.now().toString(),
      type: 'paragraph',
    };

    setFormElements((prevElements) => [...prevElements, newParagraph]);
    setParagraphImageCount(paragraphImageCount + 1);
  };

  const handleAddImage = (event) => {
    const imageType = event.target.innerText;
    const newImage = {
      id: Date.now().toString(),
      type: 'image',
      body: `${imageType.toLowerCase().replace(/\s/g, '-')}.jpg`, // Aggiungi il nome dell'immagine al corpo del formElement
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
      const contents = formElements.map((element, index) => {
        return {
          id: (props.contents[index] && props.contents[index].id) || '',
          type: element.type,
          body: element.body,
          pageId: props.page.id,
          pageOrder: index + 1,
        };
      });
      
      API.updatePageWithContents(page.id, page, contents)
        .then(() => {
          props.setDirty(true);
          navigate('/pages');
        })
        .catch((e) => {
          handleErrors(e);
        });
    } else {
      // Add a new page
      page.creationDate = dayjs().format('YYYY-MM-DD'); // Set the current creation date
      const contents = formElements.map((element, index) => {
        return {
          type: element.type,
          body: element.body,
          pageOrder: index + 1,
        };
      });
      API.addPageWithContents(page, contents)
        .then(() => {
          props.setDirty(true);
          navigate('/pages');
        })
        .catch((e) => {
          handleErrors(e);
        });
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="top-space">
        <Row>
          <Col sm={8}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)} />
            </Form.Group>
          </Col>
          <Col>
          {props.admin === 1 ? (
            <Form.Group controlId="author">
              <Form.Label>Author</Form.Label>
              <Form.Control as="select" defaultValue={props.page ? props.page.authorId : props.authorId} onChange={(e) => setAuthorId(e.target.value)}>
                {props.authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          ) : (
            <Form.Group controlId="author">
              <Form.Label>Author</Form.Label>
              <Form.Control value={props.userName} disabled />
            </Form.Group>
          )}
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="creationDate" className="top-space">
              <Form.Label>Creation date</Form.Label>
              <Form.Control value={creationDate} disabled />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="publicationDate" className="top-space">
              <Form.Label>Publication date</Form.Label>
                <Form.Control type='date' value={publicationDate} onChange={event => setPublicationDate(event.target.value)} />
                {dayjs(creationDateDayjs).isAfter(publicationDate) && (
                  <Form.Text className='text-danger'>Publication date must be after the creation date.</Form.Text>
                ) }
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center top-space">
          <ButtonGroup aria-label="addOptions">
            <Button variant="secondary" onClick={handleAddHeader}>Add header</Button>
            <Button variant="secondary" onClick={handleAddParagraph}>Add paragraph</Button>
            <DropdownButton as={ButtonGroup} title="Add image" variant="secondary" id="bg-nested-dropdown">
              <Dropdown.Item eventKey="1" onClick={handleAddImage}>Beach</Dropdown.Item>
              <Dropdown.Item eventKey="2" onClick={handleAddImage}>Mountain</Dropdown.Item>
              <Dropdown.Item eventKey="3" onClick={handleAddImage}>Japan</Dropdown.Item>
              <Dropdown.Item eventKey="4" onClick={handleAddImage}>Northern Lights</Dropdown.Item>
            </DropdownButton>
          </ButtonGroup>
        </div>

        {formElements.map((element, index) => {
          return (
            <Form.Group controlId={element.id} key={element.id}>
              {element.type === 'header' && (<Form.Label className="top-space">Header</Form.Label>)}
              {element.type === 'paragraph' && (<Form.Label className="top-space">Paragraph</Form.Label>)}
              {element.type === 'image' && (
                <>
                  <img src={`/images/${element.body}`} alt={element.body} value={element.body} style={{ width: '600px', height: 'auto', marginRight: '10px' }} className="top-space" />
                  <input type="hidden" value={element.image || ''} />
                </>
              )}

              {element.type === 'header' ? (
                <Form.Control type="text" required={true} value={element.body || ''} onChange={(e) => handleInputChange(index, e)} />
              ) : element.type === 'paragraph' ? (
                <Form.Control as="textarea" required={true} rows={3} value={element.body || ''} onChange={(e) => handleInputChange(index, e)} />
              ) : null}

              <Button variant="danger" className="button-form" onClick={() => handleRemoveForm(element.id, element.type)}>Remove</Button>
              {index > 0 && (<Button variant="secondary" className="button-form" onClick={() => handleMoveUp(element.id)}>Up</Button>)}
              {index < formElements.length - 1 && (<Button variant="secondary" className="button-form" onClick={() => handleMoveDown(element.id)}>Down</Button>)}
            </Form.Group>
          );
        })}
        <Button className="mb-3 final-button-form" variant="primary" type="submit" disabled={headerCount < 1 || paragraphImageCount < 1 || dayjs(creationDateDayjs).isAfter(publicationDate)} >Save page</Button>
        <Link className="btn btn-danger mb-3 final-button-form" to='/pages'> Cancel </Link>
      </Form>
    </>
  );
}

export default PageForm;