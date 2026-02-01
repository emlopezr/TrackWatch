import { useState } from 'react';
import { Link } from 'react-router-dom';
import trackWatchlogo from '../../assets/svg/logo.svg';
import './InstallPage.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language = 'bash' }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__language">{language}</span>
        <button 
          className={`code-block__copy ${copied ? 'code-block__copy--copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="code-block__content">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const InstallPage = () => {
  return (
    <div className="install-page">
      <header className="install-header">
        <Link to="/" className='install-logo__link'>
          <div className="install-logo">
            <img src={trackWatchlogo} alt="TrackWatch Logo" className="install-logo__image" />
            <h1 className="install-logo__title">
              <span className="install-logo__title--green">Track</span>
              <span className="install-logo__title--white">Watch</span>
            </h1>
          </div>
        </Link>
      </header>

      <main className="install-main">
        <div className="install-content">
          <h1 className="install-title">Deploy TrackWatch with Docker</h1>
          <p className="install-subtitle">
            Get your personal Spotify release tracker up and running in minutes.
          </p>

          <section className="install-section">
            <h2 className="install-section__title">Prerequisites</h2>
            <ul className="install-prerequisites">
              <li>
                <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener noreferrer">
                  Docker
                </a> and{' '}
                <a href="https://docs.docker.com/compose/install/" target="_blank" rel="noopener noreferrer">
                  Docker Compose
                </a>
              </li>
              <li>
                A{' '}
                <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Spotify Developer
                </a>{' '}
                account
              </li>
            </ul>
          </section>

          <section className="install-section">
            <h2 className="install-section__title">
              <span className="install-step-number">1</span>
              Clone the Repository
            </h2>
            <CodeBlock 
              code={`git clone https://github.com/emlopezr/trackwatch.git
cd trackwatch`}
            />
          </section>

          <section className="install-section">
            <h2 className="install-section__title">
              <span className="install-step-number">2</span>
              Configure Environment
            </h2>
            <CodeBlock 
              code={`cp .env.docker.example .env`}
            />
            <p className="install-section__description">
              Edit the <code>.env</code> file with your configuration:
            </p>
            <CodeBlock 
              language="env"
              code={`# Required: Generate a secure secret key
SECRET_KEY=your-random-secret-key

# Required: Database credentials
DATABASE_PASSWORD=your-secure-password

# Required: Spotify API credentials
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret`}
            />
          </section>

          <section className="install-section">
            <h2 className="install-section__title">
              <span className="install-step-number">3</span>
              Start TrackWatch
            </h2>
            <CodeBlock 
              code={`docker-compose up -d --build`}
            />
            <p className="install-section__description">
              That's it! Access TrackWatch at{' '}
              <a href="http://127.0.0.1" target="_blank" rel="noopener noreferrer">
                http://127.0.0.1
              </a>
            </p>

            <div className="install-callout">
              <div className="install-callout__icon">💡</div>
              <div className="install-callout__content">
                <strong>Port Configuration:</strong> If port 80 is already in use on your machine, 
                change <code>PORT=8080</code> in your <code>.env</code> file and access the app at{' '}
                <code>http://127.0.0.1:8080</code>
              </div>
            </div>
          </section>

          <section className="install-section">
            <h2 className="install-section__title">Spotify Developer Setup</h2>
            <ol className="install-numbered-list">
              <li>
                Go to the{' '}
                <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Spotify Developer Dashboard
                </a>
              </li>
              <li>Click <strong>Create App</strong></li>
              <li>
                Fill in the app details:
                <ul className="install-nested-list">
                  <li><strong>App name:</strong> TrackWatch (or any name)</li>
                  <li><strong>App description:</strong> Your description</li>
                  <li><strong>Redirect URI:</strong> <code>http://127.0.0.1/callback</code></li>
                  <li><strong>Which API/SDKs are you planning to use?</strong> Web API</li>
                </ul>
              </li>
              <li>Click <strong>Settings</strong> and note your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
              <li>Add these to your <code>.env</code> file</li>
            </ol>

            <div className="install-callout install-callout--warning">
              <div className="install-callout__icon">⚠️</div>
              <div className="install-callout__content">
                <strong>Important:</strong> Spotify does not allow <code>localhost</code> as a redirect URI. 
                You must use <code>127.0.0.1</code> for local development, or <code>https://</code> for custom domains.
              </div>
            </div>
          </section>

          <section className="install-section">
            <h2 className="install-section__title">Stop TrackWatch</h2>
            <CodeBlock 
              code={`docker-compose down`}
            />
            <p className="install-section__description">
              To also remove the database volume:
            </p>
            <CodeBlock 
              code={`docker-compose down -v`}
            />
          </section>

          <section className="install-section install-section--centered">
            <h2 className="install-section__title">Need More Help?</h2>
            <p className="install-section__description">
              Check out the full documentation on GitHub for advanced configuration, 
              troubleshooting, and custom domain setup.
            </p>
            <a 
              href="https://github.com/emlopezr/trackwatch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="install-github-button"
            >
              View on GitHub
            </a>
          </section>
        </div>
      </main>

      <footer className="install-footer">
        <p className="install-footer__text">
          Made with ♥ by <a className='install-footer__link' href="https://github.com/emlopezr">@emlopezr</a>
        </p>
        <div className="install-footer__legals_container">
          <p className="install-footer__links">
            <a className="install-footer__link" href="/eula" target="_blank" rel="noopener noreferrer">Terms of Use</a> · {" "}
            <a className="install-footer__link" href="/privacy" target="_blank" rel="noopener noreferrer">Data Handling</a> · {" "}
            <a className="install-footer__link" href="https://github.com/emlopezr/trackwatch" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p className="install-footer__disclaimer">
            <span className="install-footer__disclaimer-text">TrackWatch is not affiliated with Spotify</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default InstallPage;
