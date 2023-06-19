import PageTable from './PageTable';
import PageForm from './PageForm';
import API from '../API';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';

function FrontLayout(props) {
    //get published pages, sort in chronological order and add author name
    const publishedPages = filterPublishedPages(props.pages);

    return(
        <>
            <h1>Published Pages</h1>
            <PageTable pages={publishedPages} authorMap={props.authorMap} showEditDeleteButtons={false} />
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
    const dirty = props.dirty;
    const setDirty = props.setDirty;

    useEffect(() => {
        if (dirty) {
            API.getPages()
            .then(pages => {
                props.setPages(pages);
                setDirty(false);
            })
            .catch(e => { 
                setDirty(false); 
            } ); 
        }
    }, [dirty]);
    

    return(
        <>
            <Row>
                <Col sm={2}><h1>All Pages</h1></Col>
                <Col sm={10}><Link to='/add' className='btn btn-outline-success'>+ New page</Link></Col>
            </Row>
            <PageTable pages={props.pages} authorMap={props.authorMap} userName={props.user.name} admin={props.admin} dirty={dirty} setDirty={setDirty}
            showEditDeleteButtons={true}/>
        </>
    )
}

function AddLayout(props) {
    return(
        <>
            <h1 className="top-space">Write a page...</h1>
            <p>Remember to add at least an header and at least one of the other two types of contents.</p>
            <PageForm userName={props.user.name} authors={props.authors} admin={props.admin} authorId={props.user.id} setDirty={props.setDirty}
            />
        </>
    )
}

function EditLayout(props) {

    const { id } = useParams();
    const [page, setPage] = useState(null);
    const [contents, setContents] = useState([]);

    useEffect(() => {
        API.getPage(id)
        .then(page => {
            setPage(page);
        })
        .catch(e => {
            console.log(e);
        });
        API.getContents(id)
        .then(contents => {
            contents.sort((a, b) => a.pageOrder - b.pageOrder);
            setContents(contents);
        })
        .catch(e => {
            console.log(e);
        })
    }, [id]);

    return (
        <>
          {page && contents.length > 0 && (
            <>
              <h1 className="top-space">Edit page...</h1>
              <p>Remember to keep at least a header and at least one of the other two types of contents.</p>
              <PageForm page={page} contents={contents} authors={props.authors} userName={props.user.name} authorId={props.user.id} admin={props.admin} setDirty={props.setDirty} />
            </>
          )}
        </>
      );
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

export { FrontLayout, BackLayout, AddLayout, EditLayout, NotFoundLayout };