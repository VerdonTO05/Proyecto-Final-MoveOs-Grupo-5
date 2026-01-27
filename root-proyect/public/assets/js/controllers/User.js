export default class User {
  constructor({ id, full_name, email, username, role}) {
    this.id = id;
    this.full_name = full_name;
    this.email = email;
    this.username = username;
    this.role = role;
  }
}