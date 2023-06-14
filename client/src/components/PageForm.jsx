import { Form, ButtonGroup, Button, Dropdown, DropdownButton, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from "dayjs";
import API from '../API';

function PageForm(props) {
    const [formElements, setFormElements] = useState([]);
    const [title, setTitle] = useState(props.page ? props.page.title : '');
    const [publicationDate, setPublicationDate] = useState((props.page && props.page.publicationDate) ? props.page.publicationDate.format('YYYY-MM-DD') : '');
    const [headerCount, setHeaderCount] = useState(0);
    const [paragraphImageCount, setParagraphImageCount] = useState(0);

    let currentDate = dayjs().format('DD/MM/YYYY');

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
        setParagraphImageCount(paragraphImageCount + 1)
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
        setParagraphImageCount(paragraphImageCount + 1)
    };

    const handleInputChange = (index, e) => {
        const updatedFormElements = [...formElements];
        updatedFormElements[index].body = e.target.value;
        setFormElements(updatedFormElements);
    };

    const handleRemoveForm = (id, type) => {
        setFormElements((prevElements) =>
          prevElements.filter((element) => element.id !== id)
        );
      
        // Aggiorna le variabili di stato in base al tipo di elemento rimosso
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

    const handleSubmit = (event) => {
        event.preventDefault();
      
        currentDate = dayjs().format('YYYY-MM-DD');
        publicationDate !== '' ? dayjs(publicationDate).format('YYYY-MM-DD') : null;
      
        const page = {
          title: title.trim(),
          creationDate: currentDate,
          ...(publicationDate && { publicationDate }), // Aggiungi la proprietà solo se publicationDate è presente
        };
      
        if (props.page) {
          page.id = props.page.id;
          // Aggiungere logica per editPage
        } else {
          API.addPage(page)
            .then((pageId) => {
      
              const contents = formElements.map((element, index) => {
                return {
                  type: element.type,
                  body: element.body,
                  pageId: pageId,
                  pageOrder: index + 1,
                };
              });
      
              // Creazione dei contenuti
              const contentPromises = contents.map((content) => {
                console.log(content);
                return API.addContent(content);
              });
      
              // Attendi il completamento di tutte le promesse dei contenuti
              return Promise.all(contentPromises);
            })
            .then(() => {
              console.log("Pagina e contenuti correttamente creati");
            })
            .catch((error) => {
              console.error("Errore durante la creazione della nuova pagina:", error);
              // Gestisci l'errore nel front-end
            });
        }
      };
      

    return (
        <>
            <h1 className="top-space">Write a page...</h1>
            <p>Remember to add at least an header and at least one of the other two types of contents.</p>
            <Form onSubmit={handleSubmit} className="top-space">
                <Row>
                    <Col sm={8}>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" required={true} onChange={event => setTitle(event.target.value)}/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="author">
                            <Form.Label>Author</Form.Label>
                            <Form.Control value={props.userName} disabled/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                <Form.Group controlId="creationDate" className="top-space">
                    <Form.Label>Creation date</Form.Label>
                    <Form.Control value={currentDate} disabled/>
                </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="publicationDate" className="top-space">
                            <Form.Label>Publication date</Form.Label>
                            <Form.Control type="date" onChange={event => setPublicationDate(event.target.value)}/>
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
                                <img src={`images/${element.image}`} alt={element.image} value={element.image} style={{ width: '600px', height: 'auto', marginRight: '10px' }} className="top-space" />
                                <input type="hidden" value={element.image || ''} />
                            </>
                        )}

                        {element.type === 'header' ? (
                        <Form.Control type="text" required={true} value={element.body || ''} onChange={(e) => handleInputChange(index, e)}/>
                        ) : element.type === 'paragraph' ? (
                        <Form.Control as="textarea" required={true} rows={3} value={element.body || ''} onChange={(e) => handleInputChange(index, e)}/>
                        ): null}

                        <Button variant="danger" className="button-form" onClick={() => handleRemoveForm(element.id, element.type)}>Remove</Button>
                        {index > 0 && (<Button variant="secondary" className="button-form" onClick={() => handleMoveUp(element.id)}>Up</Button>)}
                        {index < formElements.length - 1 && (<Button variant="secondary" className="button-form" onClick={() => handleMoveDown(element.id)}>Down</Button>)}
                    </Form.Group>
                    );
                })}
                <Button className="mb-3 final-button-form" variant="primary" type="submit" disabled={ headerCount < 1 || paragraphImageCount < 1} >Save page</Button>
                <Link className="btn btn-danger mb-3 final-button-form" to='/pages'> Cancel </Link>
            </Form>
        </>
    )
}

export default PageForm;