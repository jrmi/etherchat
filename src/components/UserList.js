import React from 'react';
import styles from './UserList.module.css';

const UserList = ({ users, ...rest }) => {
  return (
    <ul {...rest} className={styles.list}>
      {users.map((user) => (
        <li>
          <span></span>
          <span>{user.name}</span>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
