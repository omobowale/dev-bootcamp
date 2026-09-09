import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { verifyCertificate } from "../api/certificateVerification";
import { LoadingState } from "../components/LoadingState";
import { Icon } from "../components/Icon";
import { formatDate } from "../utils/formatDate";
import "./TermsPage.css";

export function VerifyCertificatePage() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(verificationId ?? "");

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["certificates", "verify", verificationId],
    queryFn: () => verifyCertificate(verificationId as string),
    enabled: Boolean(verificationId),
    retry: false,
  });

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) navigate(`/verify/${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <>
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">
            <Icon name="shield" size={15} /> CERTIFICATE VERIFICATION
          </span>
          <h1>
            Verify a <em>certificate.</em>
          </h1>
          <p>Enter a verification ID to confirm a Bukiva Learn certificate is genuine.</p>
        </div>
      </section>

      <div className="container terms-page">
        <form className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 12 }} onSubmit={handleSearch}>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="e.g. CERT-2026-00001"
            style={{ flex: 1 }}
            aria-label="Verification ID"
          />
          <button type="submit" className="btn btn-primary">
            Verify
          </button>
        </form>

        {!verificationId && <p className="text-muted">Enter a verification ID above to check a certificate.</p>}

        {verificationId && (isLoading || isFetching) && <LoadingState label="Checking…" />}

        {verificationId && !isLoading && isError && (
          <div className="notice-panel">
            <Icon name="close" size={24} />
            <h3>Not found.</h3>
            <p>
              No certificate matches <strong>{verificationId}</strong>. Double-check the ID and try again.
            </p>
          </div>
        )}

        {data && (
          <div className="card" style={{ padding: 28 }}>
            <span className="eyebrow" style={{ color: "var(--color-primary)" }}>
              <Icon name="check" size={15} /> VALID CERTIFICATE
            </span>
            <h2 style={{ margin: "10px 0 20px" }}>{data.courseTitle}</h2>
            <div className="summary-list">
              <div className="summary-row">
                <span>Awarded to</span>
                <strong>{data.studentName}</strong>
              </div>
              <div className="summary-row">
                <span>Completion date</span>
                <strong>{formatDate(data.completionDate)}</strong>
              </div>
              <div className="summary-row">
                <span>Verification ID</span>
                <strong>{data.verificationId}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
