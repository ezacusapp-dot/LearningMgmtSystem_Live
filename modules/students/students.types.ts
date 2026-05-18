// export interface Student {
//   id: string;
//   firstName: string;
//   middleName?: string;
//   lastName: string;

//   studentMobile?: string;
//   studentEmail?: string;

//   parentMobile: string;

//   grade: string;
//   batch?: string;

//   status: boolean;
//   schoolYear: string;

//   address?: string;

//   createdAt: Date;
// }

// export interface CreateStudentDTO {
//   firstName: string;
//   middleName?: string;
//   lastName: string;

//   studentMobile?: string;
//   studentEmail?: string;

//   parentMobile: string;

//   grade: string;
//   batch?: string;

//   schoolYear: string;
//   address?: string;
// }

// export interface UpdateStudentDTO {
//   firstName?: string;
//   middleName?: string;
//   lastName?: string;

//   studentMobile?: string;
//   studentEmail?: string;

//   parentMobile?: string;

//   grade?: string;
//   batch?: string;

//   status?: boolean;
//   schoolYear?: string;

//   address?: string;
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

  standard?:    string;
  batch?:       string;
  status?:      string;
  schoolYear?:  string;
  address?:     string;
}
