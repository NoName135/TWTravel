import * as React from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmarkCircle,
  faChevronCircleLeft,
  faChevronCircleRight,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import cityOptions from '../CityOptions';

import axios from 'axios';
import Swal from 'sweetalert2';

function FavoritePosition(props) {
  const { addPositionWindow, setAddPositionWindow, addPosition } = props;
  const useState = React.useState;
  const useEffect = React.useEffect;

  const [selectFavoriteCity, setSelectFavoriteCity] = React.useState({
    label: '全部縣市',
    value: '全部縣市',
  });
  const favoriteCityOptions = [{ label: '全部縣市', value: '全部縣市' }];
  cityOptions.map((d) => favoriteCityOptions.push(d));

  const [renderFavorite, setRenderFavorite] = useState([])
  const changeCity = (obj) => {
    setSelectFavoriteCity(obj);
    const filterFavorite = favoriteData.filter(item => {
      return obj.value === '全部縣市' || item.city === obj.label
    })
    setRenderFavorite(filterFavorite)
  }

  const [favoriteData, setFavoriteData] = useState([]);
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    // setUserLoading(true);
    axios
      .get(
        `https://tw-travel-server.vercel.app/600/users/${userId}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        setFavoriteData(res.data.sort((a, b) => b.id - a.id));
        setRenderFavorite(res.data.sort((a, b) => b.id - a.id));
        // setUserLoading(false);
      })
      .catch((err) => {
        // console.log(err);
        // setUserLoading(false);
        localStorage.removeItem('localUserData');
        Swal.fire({
          icon: 'warning',
          title: '登入權限過期',
          text: '系統將自動登出，請重新登入',
          background: '#F2F8F8',
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 2000,
          timerProgressBar: true,
        });
        setTimeout(() => {
          window.location.reload(false);
        }, '2000');
      });
    // eslint-disable-next-line
  }, []);
  return (
    <div
      className={`d-flex flex-column align-items-center ${
        addPositionWindow !== 'favorite' ? 'd-none' : ''
      }`}
      style={{ width: '100%' }}
    >
      {/* 我的收藏 */}
      <div className="bg-secondary p-3 search-column rounded-top position-relative">
        <FontAwesomeIcon
          className="position-absolute top-0 end-0 pt-2 pe-2"
          style={{ cursor: 'pointer' }}
          icon={faXmarkCircle}
          size={'2x'}
          onClick={() => setAddPositionWindow('')}
        />
        <div className="mt-4 mt-lg-0 d-flex flex-column flex-lg-row justify-content-between align-items-center">
          <h4 className="m-0" style={{ fontWeight: 'bold' }}>
            我的收藏
          </h4>
          <div className="d-flex d-flex flex-column flex-lg-row align-items-center">
            <h5 className="mb-0 me-2 mt-3 mt-lg-0">請選擇縣市</h5>
            <Select
              className="mt-1 mt-lg-0"
              defaultValue={selectFavoriteCity}
              value={selectFavoriteCity}
              onChange={(e) => changeCity(e)}
              options={favoriteCityOptions}
              isSearchable={true}
              maxMenuHeight="200px"
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#5C9500',
                  primary25: '#EFF4E5',
                },
              })}
            />
          </div>
          <div></div>
        </div>
      </div>
      {/* 我的收藏卡片區塊 */}
      <div
        id="favoriteArea"
        className="pt-4 search-column bg-light rounded-bottom overflow-auto search-card"
        style={{ height: '550px' }}
      >
        {renderFavorite.length === 0 ? <h4 className='text-center mt-3'>沒有任何收藏 (ΦωΦ)</h4> : null}
        <ul
          className="row row-cols-1 row-cols-lg-3 g-3 list-unstyled mt-0 mx-auto"
          style={{ width: '95%' }}
        >
          {renderFavorite.map((item) => {
            return (
              <li
                key={item.id}
                className="col d-flex"
                onClick={() => {addPosition('favorite', item)}}
              >
                <div
                  className="card border-0 w-100"
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    className="card activity-img"
                    src={
                      item.picture ||
                      'https://www.survivorsuk.org/wp-content/uploads/2017/01/no-image.jpg'
                    }
                  />
                  <div className="card-img-overlay d-flex justify-content-center align-items-center img-mask">
                    <h5 className="text-center" style={{ width: '85%' }}>
                      {item.name}
                    </h5>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default FavoritePosition;
