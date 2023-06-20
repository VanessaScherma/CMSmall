import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import API from '../API';

function SinglePage() {
    const [contents, setContents] = useState([]);

    const location = useLocation();
    const id = location.state?.id;
    const title = location.state?.title;
    const author = location.state?.author;
    const creationDate = location.state?.creationDate;
    const publicationDate = location.state?.publicationDate;

    useEffect(() => {
        const getContents = async () => {
            const pageContents = await API.getContents(id);
            const sortedContents = pageContents.sort((a, b) => a.pageOrder - b.pageOrder);
            setContents(sortedContents);
        };
        getContents();
    }, []);

    function formatPublicationStatus(publicationDate) {
        if (publicationDate === "Draft") {
          return "Draft";
        } else if (publicationDate.includes("Scheduled")) {
          return publicationDate;
        } else {
          return `Published on ${publicationDate}`;
        }
    }
      
 
    return (
        <Container>
            <Row><h1 className="text-center mt-4">{title}</h1></Row>
            <Row>
                <Col><p className="text-start">Written by {author} on {creationDate}</p></Col>
                <Col><p className="text-end">{formatPublicationStatus(publicationDate)}</p></Col>
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

function Header(props) {
    return (
        <h2>{props.body}</h2>
    );
}

function Paragraph(props) {
    return (
        <p>{props.body}</p>
    );
}


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