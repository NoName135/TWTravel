import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import {
  faXmarkCircle,
  faSearch,
  faChevronCircleLeft,
  faChevronCircleRight,
  faStar
} from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import Swal from 'sweetalert2';

import cityOptions from '../CityOptions';
import { districtsOption as districts } from '../CityOptions';
import { zipCodeSearch as zipCodeDistricts } from '../CityOptions';

function SearchPosition(props) {
  const { addPositionWindow, setAddPositionWindow, addPosition, editId } = props;
  const useState = React.useState;
  const useEffect = React.useEffect;

  const [inputSearch, setInputSearch] = useState('');
  const [page, setPage] = useState([]);
  const [targetPage, setTargetPage] = useState(1)
  // ScenicSpot、Restaurant、Hotel、Activity
  const [searchTarget, setSearchTarget] = useState({
    label: '景點',
    value: 'ScenicSpot',
  });
  const [selectSearchCity, setSelectSearchCity] = useState({
    label: '臺北市',
    value: 'Taipei',
  });
  const [selectSearchDistrict, setSelectSearchDistrict] = useState({
    label: '全部地區',
    value: '全部地區',
  });
  const searchDistrictOptions = [{ label: '全部地區', value: '全部地區' }];
  districts(selectSearchCity.value).map((data) =>
    searchDistrictOptions.push({ label: data, value: data })
  );
  const searchCityChange = (obj) => {
    setSelectSearchCity(obj);
    setSelectSearchDistrict({
      label: '全部地區',
      value: '全部地區',
    });
  };

  const [renderSearch, setRenderSearch] = useState([]);
  const handleRenderSearch = () => {
    // console.log(selectSearchDistrict, inputSearch);
    const searchData = searchCards
      .filter(item => {
        return !inputSearch || item.name.toLowerCase().match(inputSearch.trim().toLowerCase());
      })
      .filter(item => {
        return selectSearchDistrict.value === '全部地區' || item.district === selectSearchDistrict.value
      })
    // 渲染資料到畫面
    setRenderSearch(searchData);
    setPage(
      new Array(Math.ceil(searchData.length / 27)).fill('').map((_, i) => i + 1)
    );
    setTargetPage(1);
    setTimeout(() => {
      document.querySelector('#searchArea').scrollTo({ top: 0, behavior: 'smooth' });
    }, 100)
  }

  const [searchCards, setSearchCards] = useState([]);
  // 找出 api 的 district
  const districtFinder = (item) => {
    let district;

    if(searchTarget.value === 'Activity'){
      if(!item.Address){
        item.Address = item.City;
      }else if (item.Address.indexOf(item.City) === -1) {
        item.Address = item.Location.split(' ').join('') + item.Address;
      }
      districts(selectSearchCity.value).forEach((districtData) => {
        if (item.Address) {
          if (item.Address.includes(districtData)) {
            district = districtData;
          }
        }
      });

      if (district) {
        return district;
      } else {
        return
      }
    }else{
      districts(selectSearchCity.value).forEach((districtData) => {
        if (item.Address) {
          if (item.Address.includes(districtData)) {
            district = districtData;
          }
        }
      });

      if (district) {
        return district;
      } else if (item.ZipCode) {
        return zipCodeDistricts(item.ZipCode.split('').slice(0, 3).join(''));
      } else {
        return;
      }
    }
  };

  const searchData = (data) => {
    // console.log(data)
    const cardArray = [];
    data.forEach((item) => {
      const cardObj = {};
      cardObj.id = item[`${searchTarget.value}ID`];
      cardObj.name = item[`${searchTarget.value}Name`];
      cardObj.picture = item.Picture?.PictureUrl1
        ? item.Picture.PictureUrl1
        : '';
      cardObj.district = districtFinder(item);
      cardObj.px = item.Position.PositionLat;
      cardObj.py = item.Position.PositionLon;

      if (searchTarget.value === 'Activity') {
        if (!item.Address) {
          item.Address = item.City;
        } else if (
          item.Address.indexOf(item.City) > -1 ||
          item.Location.includes('site')
        ) {
          cardObj.address = item.Address;
        } else {
          cardObj.address = item.Location.split(' ').join('') + item.Address;
        }
      } else {
        if (!item.Address) {
          item.Address = item.City + districtFinder(item);
        }
        cardObj.address = item.Address;
      }
      cardArray.push(cardObj);
    });
    setSearchCards(cardArray)
    // console.log(cardArray)
    // 渲染資料到畫面
    setRenderSearch(cardArray);
    setPage(
    new Array(Math.ceil(cardArray.length / 27)).fill('').map((_, i) => i + 1)
    );
    setTargetPage(1);
    setInputSearch('');
    setSelectSearchDistrict({
      label: '全部地區',
      value: '全部地區',
    });
    setTimeout(() => {
      document.querySelector('#searchArea').scrollTo({ top: 0, behavior: 'smooth' });
    }, 100)
  };

  useEffect(() => {
    let tdxTime = 0;
    const getTdx = async () => {
      // localStorage 有 localUserData 才跑下方函式
      // setListLoading(true);
      axios
        .get(
          `https://tdx.transportdata.tw/api/basic/v2/Tourism/${searchTarget.value}/${selectSearchCity.value}?$format=JSON`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: localStorage.getItem('tdxToken'),
            },
          }
        )
        .then((res) => {
          // console.log(res.data);
          searchData(res.data);
          // setListLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (tdxTime < 3) {
            tdxTime++;
            getTdxToken();
          } else {
            // setListLoading(false);
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
          }
        });
    };

    const getTdxToken = () => {
      axios({
        method: 'post',
        url: 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
        dataType: 'JSON',
        data: {
          grant_type: 'client_credentials',
          client_id: 'qscwdvefb3-0cabaaa5-66c1-4984',
          client_secret: 'a342df17-9e26-4f59-8cca-59775e27daec',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .then((res) => {
          // console.log(res);
          const token = `Bearer ${res.data.access_token}`;
          const timeStamp = new Date().getTime();
          localStorage.setItem('tdxToken', token);
          localStorage.setItem('tdxTimeStamp', timeStamp);
          getTdx();
        })
        .catch((err) => {
          console.log(err);
          localStorage.removeItem('tdxToken');
        });
    };

    // 判斷是否有 TDX token
    if (!localStorage.getItem('tdxToken')) {
      getTdxToken();
    } else {
      getTdx();
    }
    // eslint-disable-next-line
  }, [selectSearchCity, searchTarget]);

  return (
    <div
      className={`d-flex flex-column align-items-center ${
        addPositionWindow !== 'search' ? 'd-none' : ''
      }`}
    >
      {/* 搜尋地點 */}
      <div className="bg-secondary p-3 search-column mt-lg-0 rounded-top position-relative">
        <FontAwesomeIcon
          className="position-absolute top-0 end-0 pt-2 pe-2"
          style={{ cursor: 'pointer' }}
          icon={faXmarkCircle}
          size={'2x'}
          onClick={() => setAddPositionWindow('')}
        />
        <div className="mt-4 mt-lg-0 d-flex flex-column flex-lg-row justify-content-center align-items-center">
          {/* 搜尋地點選項 */}
          <h5 className="m-0" style={{ fontWeight: 'bold' }}>
            我想尋找：
          </h5>
          <div className="d-lg-none p-0 mt-2 mt-lg-0 select-width">
            <Select
              defaultValue={searchTarget}
              value={searchTarget}
              onChange={setSearchTarget}
              options={[
                {
                  label: '景點',
                  value: 'ScenicSpot',
                },
                {
                  label: '餐廳',
                  value: 'Restaurant',
                },

                {
                  label: '旅宿',
                  value: 'Hotel',
                },

                {
                  label: '活動',
                  value: 'Activity',
                },
              ]}
              isSearchable={true}
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
          <div
            className="d-none d-lg-flex justify-content-around"
            style={{ width: '70%' }}
          >
            <div
              className={`btn btn-outline-primary ${
                searchTarget.value === 'ScenicSpot' ? 'active' : ''
              }`}
              onClick={(e) =>
                setSearchTarget({
                  label: '景點',
                  value: 'ScenicSpot',
                })
              }
            >
              景點
            </div>
            <div
              className={`btn btn-outline-primary ${
                searchTarget.value === 'Restaurant' ? 'active' : ''
              }`}
              onClick={(e) =>
                setSearchTarget({
                  label: '餐廳',
                  value: 'Restaurant',
                })
              }
            >
              餐廳
            </div>
            <div
              className={`btn btn-outline-primary ${
                searchTarget.value === 'Hotel' ? 'active' : ''
              }`}
              onClick={(e) =>
                setSearchTarget({
                  label: '旅宿',
                  value: 'Hotel',
                })
              }
            >
              旅宿
            </div>
            <div
              className={`btn btn-outline-primary ${
                searchTarget.value === 'Activity' ? 'active' : ''
              }`}
              onClick={(e) =>
                setSearchTarget({
                  label: '活動',
                  value: 'Activity',
                })
              }
            >
              活動
            </div>
          </div>
        </div>
        <div className="mt-2 d-flex flex-column flex-lg-row align-items-center">
          <div className="p-0 mt-2 mt-lg-0 select-width">
            <Select
              defaultValue={selectSearchCity}
              value={selectSearchCity}
              onChange={(e) => searchCityChange(e)}
              options={cityOptions}
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
          <div className="p-0 mt-2 mt-lg-0 select-width">
            <Select
              defaultValue={selectSearchDistrict}
              value={selectSearchDistrict}
              onChange={setSelectSearchDistrict}
              options={searchDistrictOptions}
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
          <input
            type="text"
            className="mt-2 mt-lg-0 form-control"
            id="search"
            placeholder="請先選取城市再輸入關鍵字"
            onChange={(e) => {
              setInputSearch(e.target.value);
            }}
          ></input>
          <div
            className="btn btn-primary ms-lg-2 text-nowrap mt-2 mt-lg-0"
            onClick={handleRenderSearch}
          >
            <FontAwesomeIcon className="text-white" icon={faSearch} />
            <span className="ps-2">搜尋</span>
          </div>
        </div>
      </div>
      {/* 搜尋地點卡片區塊 */}
      <div
        id="searchArea"
        className="pt-4 search-column bg-light rounded-bottom overflow-auto search-card"
        style={{ height: '550px'}}
      >
        {renderSearch.length !== 0
        ? <h5 className='ms-4 ps-lg-2'>共有 {`${renderSearch.length} 處${searchTarget.label}`} </h5>
        : <h5 className='ms-4 ps-lg-2'>{`搜尋不到任何${searchTarget.label}！`}</h5>}
        <ul
          className="row row-cols-1 row-cols-lg-3 g-3 list-unstyled mt-0 mx-auto"
          style={{ width: '95%' }}
        >
          {renderSearch
            .filter((item, i) => {
              return Math.ceil((i + 1) / 27) === targetPage;
            })
            .map((item) => {
              return (
                <li className="col d-flex" key={item.id}
                  onClick={() => {addPosition('search', item)}}>
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
        {/* 頁碼 */}
        <nav aria-label="Page navigation font-lilita">
          <ul className="pagination justify-content-center align-items-center fw-bold mt-5">
            <li
              className={`page-item ${targetPage === 1 ? 'disabled' : ''} ${
                renderSearch.length === 0 ? 'd-none' : ''
              }`}
              onClick={() => {
                setTargetPage(targetPage === 1 ? targetPage : targetPage - 1);
                if (targetPage === 1) {
                  return;
                } else {
                  document
                    .querySelector('#searchArea')
                    .scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <a className="page-link" href={`#/user/edit-itinerary/${editId}`}>
                <FontAwesomeIcon icon={faChevronCircleLeft} size={'xl'} />
              </a>
            </li>
            {page
              .filter((data) =>
                page.length > 4 && targetPage > 2 ? data === 1 : null
              )
              .map((data) => {
                return (
                  <li
                    className="page-item d-md-none"
                    key={data}
                    onClick={() => {
                      setTargetPage(data);
                      if (targetPage === data) {
                        return;
                      } else {
                        document
                          .querySelector('#searchArea')
                          .scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <a
                      className={`page-link rounded ${
                        data === targetPage ? 'active' : ''
                      }`}
                      href={`#/user/edit-itinerary/${editId}`}
                    >
                      {data}
                    </a>
                  </li>
                );
              })}
            {page
              .filter((data) =>
                page.length > 6 && targetPage > 3 ? data === 1 : null
              )
              .map((data) => {
                return (
                  <li
                    className="page-item d-none d-md-block"
                    key={data}
                    onClick={() => {
                      setTargetPage(data);
                      if (targetPage === data) {
                        return;
                      } else {
                        document
                          .querySelector('#searchArea')
                          .scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <a
                      className={`page-link rounded ${
                        data === targetPage ? 'active' : ''
                      }`}
                      href={`#/user/edit-itinerary/${editId}`}
                    >
                      {data}
                    </a>
                  </li>
                );
              })}
            {page.length > 4 && targetPage > 2 ? (
              <span className="d-md-none">...</span>
            ) : null}
            {page.length > 6 && targetPage > 4 ? (
              <span className="d-none d-md-block">...</span>
            ) : null}
            {page
              .filter((data) => {
                if (page.length < 5) {
                  return data;
                }
                if (targetPage < 3) {
                  return data < 5;
                } else {
                  return data > targetPage - 2 && data < targetPage + 2;
                }
              })
              .map((data) => {
                return (
                  <li
                    className="page-item d-md-none"
                    key={data}
                    onClick={() => {
                      setTargetPage(data);
                      if (targetPage === data) {
                        return;
                      } else {
                        document
                          .querySelector('#searchArea')
                          .scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <a
                      className={`page-link rounded ${
                        data === targetPage ? 'active' : ''
                      }`}
                      href={`#/user/edit-itinerary/${editId}`}
                    >
                      {data}
                    </a>
                  </li>
                );
              })}
            {page
              .filter((data) => {
                if (page.length < 7) {
                  return data;
                }
                if (targetPage < 4) {
                  return data < 7;
                } else {
                  return data > targetPage - 3 && data < targetPage + 3;
                }
              })
              .map((data) => {
                return (
                  <li
                    className="page-item d-none d-md-block"
                    key={data}
                    onClick={() => {
                      setTargetPage(data);
                      if (targetPage === data) {
                        return;
                      } else {
                        document
                          .querySelector('#searchArea')
                          .scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <a
                      className={`page-link rounded ${
                        data === targetPage ? 'active' : ''
                      }`}
                      href={`#/user/edit-itinerary/${editId}`}
                    >
                      {data}
                    </a>
                  </li>
                );
              })}
            {page.length > 4 && targetPage < page.length - 1 ? (
              <span className="d-md-none">...</span>
            ) : null}
            {page.length > 6 && targetPage < page.length - 2 ? (
              <span className="d-none d-md-block">...</span>
            ) : null}
            <li
              className={`page-item ${
                targetPage === page.length ? 'disabled' : ''
              } ${renderSearch.length === 0 ? 'd-none' : ''}`}
              onClick={() => {
                setTargetPage(
                  targetPage === page.length ? targetPage : targetPage + 1
                );
                if (targetPage === page.length) {
                  return;
                } else {
                  document
                    .querySelector('#searchArea')
                    .scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <a className="page-link" href={`#/user/edit-itinerary/${editId}`}>
                <FontAwesomeIcon icon={faChevronCircleRight} size={'xl'} />
              </a>
            </li>
          </ul>
          <p className="text-center mb-4" style={{ fontWeight: 'bold' }}>
            共 {page.length} 頁
          </p>
        </nav>
      </div>
    </div>
  );
}

export default SearchPosition;
