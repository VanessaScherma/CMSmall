import PageTable from './PageTable';
import PageForm from './PageForm';
import API from '../API';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';

function FrontLayout(props) {
    //get published pages, sort in chronological order and add author name
    const publishedPages = filterPublishedPages(props.pages);

    return(
        <>
            <h1>Published Pages</h1>
            <PageTable pages={publishedPages} authorMap={props.authorMap} />
        </>
    )
}

function filterPublishedPages(pages) {

    const currentDate = dayjs();
  
    const filteredPages = pages.filter((page) =>
      dayjs(page.publicationDate) <= currentDate);
    
    filteredPages.sort((a, b) =>
    dayjs(a.publicationDate).diff(dayjs(b.publicationDate)));
  
    return filteredPages;  
}

function BackLayout(props) {
    return(
        <>
            <Row>
                <Col sm={2}><h1>All Pages</h1></Col>
                <Col sm={10}><Link to='/add' className='btn btn-outline-success'>+ New page</Link></Col>
            </Row>
            <PageTable pages={props.pages} authorMap={props.authorMap} userName={props.user.name} />
        </>
    )
}

function AddLayout(props) {
    const userName = props.user.name;

    const getAuthorIdByName = (userName) => {
        const entry = Object.entries(props.authorMap).find(([id, authorName]) => authorName === userName);
        return entry ? entry[0] : null; // Restituisce l'id se trovato, altrimenti null
    };

    const authorId = getAuthorIdByName(userName);

    return(
        <>
            <PageForm userName={props.user.name} authorId={props.user.id}/>
        </>
    )
}

function NotFoundLayout() {
    return(
        <>
            <h2>This is not the route you are looking for!</h2>
            <Link to="/">
            <Button variant="primary">Go Home!</Button>
            </Link>
        </>
    );
}

export { FrontLayout, BackLayout, AddLayout, NotFoundLayout };