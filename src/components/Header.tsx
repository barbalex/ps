export const Header = () => (
  <div className="header">
    <h1>Header</h1>
    <nav>
      <ul>
        <li>
          <a href={`/users`}>users</a>
        </li>
        <li>
          <a href={`/accounts`}>accounts</a>
        </li>
        <li>
          <a href={`/projects`}>projects</a>
        </li>
        <li>
          <a href={`/field-types`}>field types</a>
        </li>
      </ul>
    </nav>
  </div>
)
