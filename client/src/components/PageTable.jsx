import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
            props.pages.map((p) => <PageRow page={p} key={p.id} authorMap={props.authorMap}/>)
          }
        </tbody>
      </Table>
  );
}

function PageRow(props) {

  return (
    <tr>
      <td><Link to={`/pages/${props.page.id}`}>{props.page.title}</Link></td>
      <td>{props.authorMap[props.page.authorId]}</td>
      <td>{props.page.publicationDate.format('YYYY-MM-DD')}</td>
    </tr>
  );
}

export default PageTable;