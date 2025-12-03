export class User {
  constructor(id, name, email, role, studentId = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.studentId = studentId;
  }
}