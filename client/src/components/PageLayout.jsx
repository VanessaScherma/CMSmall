import { useState, useEffect, useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import MessageContext from '../messageCtx';
import PageTable from './PageTable';
import PageForm from './PageForm';
import dayjs from 'dayjs';
import API from '../API';

// Component for displaying published pages
function FrontLayout(props) {
    // Get published pages, sort in chronological order, and add author name
    const publishedPages = filterPublishedPages(props.pages);

    return (
        <>
            {/* Display section title */}
            <h1 className='mt-2'>Published Pages</h1>
            {/* Render a table to display the published pages */}
            <PageTable
                pages={publishedPages}
                authorMap={props.authorMap}
                showEditDeleteButtons={false}
            />
        </>
    );
}

// Filter and sort published pages based on publication date
const filterPublishedPages = (pages) => {
    const currentDate = dayjs();

    // Filter published pages based on publication date
    const filteredPages = pages.filter((page) =>
        dayjs(page.publicationDate) <= currentDate
    );

    // Sort filtered pages in chronological order
    filteredPages.sort((a, b) =>
        dayjs(a.publicationDate).diff(dayjs(b.publicationDate))
    );

    return filteredPages;
};

// Component for displaying all pages in the back-office
function BackLayout(props) {
    const {handleErrors} = useContext(MessageContext);

    useEffect(() => {
        // Fetch pages if the dirty flag is true
        if (props.dirty) {
            API.getPages()
                .then(pages => {
                    props.setPages(pages);
                    props.setDirty(false);
                })
                .catch(e => {
                    handleErrors(e);
                    props.setDirty(false);
                });
        }
    }, [props.dirty]);

    return (
        <>
            <Row className='d-flex align-items-center'>
                {/* Display section title */}
                <Col sm={2}><h1 className='mt-2'>All Pages</h1></Col>
                {/* Link to add a new page */}
                <Col sm={10}><Link to='/add' className='btn btn-success'>+ New page</Link></Col>
            </Row>
            {/* Render a table to display all pages */}
            <PageTable
                pages={props.pages}
                authorMap={props.authorMap}
                userName={props.user.name}
                admin={props.admin}
                dirty={props.dirty}
                setDirty={props.setDirty}
                showEditDeleteButtons={true}
            />
        </>
    );
}

// Component for adding a new page
function AddLayout(props) {
    return (
        <>
            {/* Display section title */}
            <h1 className='top-space'>Write a page...</h1>
            <p>Remember to add at least a header and at least one of the other two types of content.</p>
            {/* Render a form for creating a new page */}
            <PageForm
                userName={props.user.name}
                authors={props.authors}
                admin={props.admin}
                authorId={props.user.id}
                setDirty={props.setDirty}
            />
        </>
    );
}

// Component for editing an existing page
function EditLayout(props) {
    const { id } = useParams();
    const [page, setPage] = useState(null);
    const [contents, setContents] = useState([]);

    const {handleErrors} = useContext(MessageContext);

    useEffect(() => {
        // Fetch page and contents based on the ID parameter
        API.getPage(id)
            .then(page => {
                setPage(page);
            })
            .catch(e => {
                handleErrors(e);
            });

        API.getContents(id)
            .then(contents => {
                // Sort contents based on page order
                contents.sort((a, b) => a.pageOrder - b.pageOrder);
                setContents(contents);
            })
            .catch(e => {
                handleErrors(e);
            });
    }, [id]);

    return (
        <>
            {/* Render page form if both page and contents are available */}
            {page && contents.length > 0 && (
                <>
                    {/* Display section title */}
                    <h1 className='top-space'>Edit page...</h1>
                    <p>Remember to keep at least a header and at least one of the other two types of content.</p>
                    {/* Render a form for editing the page */}
                    <PageForm
                        page={page}
                        contents={contents}
                        authors={props.authors}
                        userName={props.user.name}
                        authorId={props.user.id}
                        admin={props.admin}
                        setDirty={props.setDirty}
                    />
                </>
            )}
        </>
    );
}

// Component for handling the 'not found' route
function NotFoundLayout() {
    return (
        <>
            {/* Display error message */}
            <h2 className='text-center mt-4'>This is not the route you are looking for!</h2>
            <div className='text-center'>
                {/* Link to go back home */}
                <Link to='/' className='btn btn-primary'>Go Home!</Link>
            </div>
        </>
    );
}

export { FrontLayout, BackLayout, AddLayout, EditLayout, NotFoundLayout };