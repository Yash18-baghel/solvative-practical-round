
import axios from 'axios';
import './App.css'
import { useCallback, useEffect, useRef, useState } from 'react';
import { sample_data } from './lib';


function App() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState([])
  const [searchedPlace, setSearchedPlace] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(5)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
          {
            params: { countryIds: 'IN', namePrefix: searchedPlace || 'del', limit: pageLimit, offset: currentPage },
            headers: {
              'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
              'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY
            }
          });
        setLocationData(response.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [pageLimit, currentPage]);

  const pageNumbers = []
  for (let i = 1; i <= Math.ceil(locationData?.metadata?.totalCount / pageLimit); i++) {
    pageNumbers.push(i);
  }

  const renderPageNumbers = pageNumbers?.map(number => (
    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
      <a href="#" onClick={() => setCurrentPage(number)} className="page-link">
        {number}
      </a>
    </li>
  ));


  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const searchPlaces = useCallback(
    debounce(async (value) => {
      setLoading(true)

      try {
        setLoading(true)
        const response = await axios.get(
          'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
          {
            params: { countryIds: 'IN', namePrefix: value, limit: pageLimit, offset: 1 },
            headers: {
              'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
              'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY
            }
          });

        setLocationData(response.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }

    }, 1000),
    [pageLimit]
  );

  const handleInputChange = (event) => {
    setSearchedPlace(event.target.value);
    searchPlaces(event.target.value);
  };

  return (
    <div>
      <div className='input-group'>
        <input
          type="text"
          className="form-control"
          placeholder="Search places..."
          ref={inputRef}
          disabled={loading}
          value={searchedPlace}
          maxLength={20}
          onChange={handleInputChange}
        />
        <span className="input-code-block">Ctrl+/</span>
      </div>

      <div>
        {
          loading && (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          )
        }
      </div>

      <div className='table-container'>
        <table className="table">
          <tr>
            <th>#</th>
            <th>Place Name</th>
            <th>Country</th>
          </tr>
          {

            !locationData?.data?.length ? (
              <div className='not-found'>No result found</div>
            ) :
              locationData?.data?.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.name}</td>
                  <td>
                    <img
                      src={`https://flagsapi.com/${data.countryCode}/shiny/64.png`}
                      alt="country flag"
                      className="country-flag"
                    />
                  </td>
                </tr>
              ))
          }
        </table>
        <nav className='bottom-inputs'>
          <ul className="pagination">
            {renderPageNumbers}
          </ul>
          <div className='page-limit'>
            <select
              value={pageLimit}
              onChange={(e) => setPageLimit(e.target.value)}
            >
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default App
