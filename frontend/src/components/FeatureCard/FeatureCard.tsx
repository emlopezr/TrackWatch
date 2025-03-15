import './FeatureCard.css'

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  tag?: string;
}

const FeatureCard = ({ icon, title, description, tag }: FeatureCardProps) => {
  return (
    <div className="feature-card">
      <div className="feature-card__header">
        <div className="feature-card__icon">
          <img src={icon} alt={`${title} icon`} className="feature-card__icon-svg" />
        </div>
        <h3 className="feature-card__title">
          {title} {tag && <span className="feature-card__tag">{tag}</span>}
        </h3>
      </div>
      <p className="feature-card__description">{description}</p>
    </div>
  );
};

export default FeatureCard;
