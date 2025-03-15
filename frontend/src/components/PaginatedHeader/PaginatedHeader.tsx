import prevIcon from '../../assets/svg/left.svg';
import nextIcon from '../../assets/svg/right.svg';
import firstIcon from '../../assets/svg/first.svg';
import lastIcon from '../../assets/svg/last.svg';
import './PaginatedHeader.css';

interface PaginatedHeaderProps {
  title: string;
  currentPage: number;
  totalPages: number;
  recordsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onRecordsPerPageChange: (records: number) => void;
}

export const PaginatedHeader = ({
  title,
  currentPage,
  totalPages,
  recordsPerPage,
  totalRecords,
  onPageChange,
  onRecordsPerPageChange
}: PaginatedHeaderProps) => {
  return (
    <div className="paginated-header">
      <h2 className="paginated-header__title">{title}</h2>

      <div className="paginated-header__bottom">
        {totalPages > 1 && (
          <div className="pagination-inline">
            <button 
              onClick={() => onPageChange(1)} 
              disabled={currentPage === 1}
              className="pagination-inline__btn"
            >
              <img src={firstIcon} alt="First" className="pagination-inline__icon icon-white" />
            </button>
            <button 
              onClick={() => onPageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-inline__btn"
            >
              <img src={prevIcon} alt="Prev" className="pagination-inline__icon icon-white" />
            </button>
            
            <span className="pagination-inline__text">{currentPage} / {totalPages}</span>
            
            <button 
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-inline__btn"
            >
              <img src={nextIcon} alt="Next" className="pagination-inline__icon icon-white" />
            </button>
            <button 
              onClick={() => onPageChange(totalPages)} 
              disabled={currentPage === totalPages}
              className="pagination-inline__btn"
            >
              <img src={lastIcon} alt="Last" className="pagination-inline__icon icon-white" />
            </button>
          </div>
        )}

        <div className="records-per-page">
          <label htmlFor="recordsPerPage">Mostrar</label>
          <select
            id="recordsPerPage"
            value={recordsPerPage}
            onChange={(e) => onRecordsPerPageChange(parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={totalRecords}>Todos</option>
          </select>
        </div>
      </div>
    </div>
  );
};