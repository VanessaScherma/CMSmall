import { Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

function PageTable(props) {

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
          {
            props.pages.map((p) => <PageRow page={p} key={p.id} authorMap={props.authorMap} userName={props.userName}/>)
          }
        </tbody>
      </Table>
  );
}

function PageRow(props) {

  const currentDate = dayjs();

  const authorName = props.authorMap[props.page.authorId];
  const creationDate = props.page.creationDate.format('YYYY-MM-DD');
  
  let publicationDate;
  if (!dayjs(props.page.publicationDate).isValid()) {
    publicationDate = 'Draft';
  } else if (dayjs(props.page.publicationDate) > currentDate) {
    publicationDate = `Scheduled on ${props.page.publicationDate.format('YYYY-MM-DD')}`;
  } else {
    publicationDate = props.page.publicationDate.format('YYYY-MM-DD');
  }

  return (
    <tr>
      <td><Link to={`/pages/${props.page.id}`} 
        state={{id: props.page.id, title: props.page.title, author: authorName, creationDate: creationDate, publicationDate: publicationDate}}>
          {props.page.title}</Link>
      </td>
      <td>{authorName}</td>
      <td>{publicationDate}</td>
      <td>{authorName == props.userName ? <Button>Edit</Button> : <></>}</td>
      <td>{authorName == props.userName ? <Button>Delete</Button> : <></>}</td>
    </tr>
  );
}

export default PageTable;