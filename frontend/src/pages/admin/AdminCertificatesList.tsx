import { useAdminCertificates } from "../../hooks/admin/useAdminCourses";
import { LoadingState } from "../../components/LoadingState";
import { formatDate } from "../../utils/formatDate";

export function AdminCertificatesList({ courseId }: { courseId: number }) {
  const { data: certificates, isLoading } = useAdminCertificates(courseId);

  if (isLoading) return <LoadingState label="Loading certificates…" />;

  if (!certificates || certificates.length === 0) {
    return <p className="text-muted">No certificates issued yet — students see a "Download certificate" option once they meet this course's completion criteria.</p>;
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Verification ID</th>
            <th>Completed</th>
            <th>Issued</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.verificationId}>
              <td>
                {cert.studentName} <span className="text-muted">({cert.studentCode})</span>
              </td>
              <td>{cert.verificationId}</td>
              <td>{formatDate(cert.completionDate)}</td>
              <td>{formatDate(cert.issuedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
