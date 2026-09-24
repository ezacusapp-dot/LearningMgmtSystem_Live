

// export interface Student {
//   id:            string;
//   firstName:     string;
//   middleName?:   string;
//   lastName:      string;

//   username:      string;
//   password:      string;          // hashed in production — kept plain for now

//   studentEmail?: string;
//   studentMobile?: string;         // optional legacy field

//   parentMobile:  string;
//   parentEmail?:  string;

//   standard:      string;
//   batch?:        string;

//   status:        string;          // "Active" | "Inactive"
//   schoolYear:    string;
//   address?:      string;

//   createdAt:     Date;
// }

// export interface CreateStudentDTO {
//   firstName:    string;
//   middleName?:  string;
//   lastName:     string;

//   username:     string;
//   password:     string;

//   studentEmail?:  string;
//   studentMobile?: string;

//   parentMobile:  string;
//   parentEmail?:  string;

//   standard:     string;
//   batch?:       string;
//   schoolYear:   string;
//   address?:     string;
// }

// export interface UpdateStudentDTO {
//   firstName?:   string;
//   middleName?:  string;
//   lastName?:    string;

//   username?:    string;
//   password?:    string;

//   studentEmail?:  string;
//   studentMobile?: string;

//   parentMobile?:  string;
//   parentEmail?:   string;

//   standard?:    string;
//   batch?:       string;
//   status?:      string;
//   schoolYear?:  string;
//   address?:     string;
// }
export interface Student {
  id:            string;
  firstName:     string;
  middleName?:   string;
  lastName:      string;

  username:      string;
  password:      string;          // hashed in production — kept plain for now

  studentEmail?: string;
  studentMobile?: string;         // optional legacy field

  parentMobile:  string;
  parentEmail?:  string;

  // 👈 NEW — the school this student belongs to
  schoolId?:     string;

  standard:      string;
  batch?:        string;

  status:        string;          // "Active" | "Inactive"
  schoolYear:    string;
  address?:      string;

  createdAt:     Date;
}

export interface CreateStudentDTO {
  firstName:    string;
  middleName?:  string;
  lastName:     string;

  username:     string;
  password:     string;

  studentEmail?:  string;
  studentMobile?: string;

  parentMobile:  string;
  parentEmail?:  string;

  // 👈 NEW — required when creating a student
  schoolId:     string;

  standard:     string;
  batch?:       string;
  schoolYear:   string;
  address?:     string;
}

export interface UpdateStudentDTO {
  firstName?:   string;
  middleName?:  string;
  lastName?:    string;

  username?:    string;
  password?:    string;

  studentEmail?:  string;
  studentMobile?: string;

  parentMobile?:  string;
  parentEmail?:   string;

  // 👈 NEW — optional, only sent if the admin is moving the student to another school
  schoolId?:    string;

  standard?:    string;
  batch?:       string;
  status?:      string;
  schoolYear?:  string;
  address?:     string;
}