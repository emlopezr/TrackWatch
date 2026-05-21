import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import Spinner from '../../components/Spinner/Spinner';
import './LegalDocumentPage.css';

interface LegalDocumentPageProps {
  endpoint: 'eula' | 'privacy';
  title: string;
}

const LegalDocumentPage = ({ endpoint, title }: LegalDocumentPageProps) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await apiFetch(`/${endpoint}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.status}`);
        }
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [endpoint]);

  if (loading) return <Spinner />;
  if (error) return <div className="legal-page"><p className="error">{error}</p></div>;

  return (
    <div className="legal-page">
      <h1 className="legal-title">{title}</h1>
      <pre className="legal-content">{content}</pre>
    </div>
  );
};

export default LegalDocumentPage;
