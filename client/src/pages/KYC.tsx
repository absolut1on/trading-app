import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchProfile, submitKyc } from "../services/tradingApi";
import "../styles/trading.css";

export default function KYC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile().then((p) => {
      if (p.kyc_completed) setAlreadyDone(true);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) { setError("All fields are required"); return; }
    setSubmitting(true);
    setError("");
    try {
      await submitKyc(fullName, phone, address);
      navigate("/portfolio");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  if (alreadyDone) {
    return (
      <Layout>
        <div className="card" style={{ maxWidth: 500 }}>
          <p className="kyc-done">KYC verification is already completed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-title">KYC Verification</div>
      <div className="card">
        <form className="kyc-form" onSubmit={handleSubmit}>
          <div className="kyc-form__group">
            <label className="kyc-form__label">Full Name</label>
            <input className="kyc-form__input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="kyc-form__group">
            <label className="kyc-form__label">Phone Number</label>
            <input className="kyc-form__input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-123-4567" />
          </div>
          <div className="kyc-form__group">
            <label className="kyc-form__label">Address</label>
            <input className="kyc-form__input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, State" />
          </div>
          {error && <div className="trade-form__msg trade-form__msg--error">{error}</div>}
          <button className="kyc-form__btn" type="submit" disabled={submitting} style={{ marginTop: "0.75rem" }}>
            {submitting ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
