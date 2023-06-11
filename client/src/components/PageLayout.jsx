import PageTable from './PageTable';
import API from '../API';
import dayjs from 'dayjs';

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

export { FrontLayout };