import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import API from '../API';

function SinglePage() {
  // State variable to hold the contents of the page
  const [contents, setContents] = useState([]);

  // Extracting data from location state
  const location = useLocation();
  const id = location.state?.id;
  const title = location.state?.title;
  const author = location.state?.author;
  const creationDate = location.state?.creationDate;
  const publicationDate = location.state?.publicationDate;

  useEffect(() => {
    // Fetch contents of the page when the component mounts
    const getContents = async () => {
      const pageContents = await API.getContents(id);
      const sortedContents = pageContents.sort((a, b) => a.pageOrder - b.pageOrder);
      setContents(sortedContents);
    };
    getContents();
  }, []);

  // Function to format the publication status based on the publication date
  function formatPublicationStatus(publicationDate) {
    if (publicationDate === 'Draft') {
      return 'Draft';
    } else if (publicationDate.includes('Scheduled')) {
      return publicationDate;
    } else {
      return `Published on ${publicationDate}`;
    }
  }

  return (
    <Container>
      <Row><h1 className='text-center mt-4'>{title}</h1></Row>
      <Row>
        <Col><p className='text-start'>Written by {author} on {creationDate}</p></Col>
        <Col><p className='text-end'>{formatPublicationStatus(publicationDate)}</p></Col>
      </Row>
      <div>
        {contents.map((content) => {
          switch (content.type) {
            case 'header':
              return <Header key={content.id} body={content.body} />;
            case 'paragraph':
              return <Paragraph key={content.id} body={content.body} />;
            case 'image':
              return <Image key={content.id} body={content.body} />;
            default:
              return null;
          }
        })}
      </div>
    </Container>
  )
}

// Renders a header component
function Header(props) {
  return (
    <h2>{props.body}</h2>
  );
}

// Renders a paragraph component
function Paragraph(props) {
  return (
    <p>{props.body}</p>
  );
}

// Renders an image component
function Image(props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
      <img
        src={`/images/${props.body}`}
        alt={props.body}
        style={{ width: '600px', height: 'auto' }}
      />
    </div>
  );
}

export { SinglePage, Header, Paragraph, Image };