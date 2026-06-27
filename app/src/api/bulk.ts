import { bulkUploadStudents } from './data';

export async function importBulkStudents(classId: string, rows: { rollNumber: string; fullName: string; parentName: string; parentEmail: string }[]) {
  return bulkUploadStudents(classId, rows);
}
