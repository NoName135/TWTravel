import * as React from 'react';
import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faList, faXmark, faStar, faLocationDot, faPhone, faSackDollar, faChevronCircleLeft, faChevronCircleRight, faDeleteLeft, faStarOfDavid } from '@fortawesome/free-solid-svg-icons';

import guesthouseTitleImg from '../../img/3.guesthouse.jpg';
import cityOptions from '../CityOptions';
import { districtsOption as districts } from '../CityOptions';
import { zipCodeSearch as zipCodeDistricts } from '../CityOptions';

import axios from 'axios';
import Swal from 'sweetalert2';

import { ListLoader, ListStarLoader } from '../Loadings';

const GuesthouseList = () => {
  const useState = React.useState;
  const location = useLocation().state;

  const [listLoading, setListLoading] = useState(false);
  const [listStarLoading, setListStarLoading] = useState([]);

  const [currentCity, setCurrentCity] = useState(location?.currentCity || '');
  const [selectCity, setSelectCity] = useState(
    JSON.parse(localStorage.getItem('defaultCity')) || {
      label: '臺北市',
      value: 'Taipei',
    }
  );

  const [inputSearch, setInputSearch] = useState('');
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState({});
  const [filterClass, setFilterClass] = useState({});
  const [filterService, setFilterService] = useState({});
  const [filterGrade, setFilterGrade] = useState({});
  const [page, setPage] = useState([]);
  const [targetPage, setTargetPage] = useState(1);

  const setDefaultCity = (obj) => {
    setRestaurants([]);
    setInsideFacilities([]);
    setOutsideFacilities([]);
    setConvenience([]);
    setOtherService([]);

    setSelectCity(obj);
    localStorage.setItem('defaultCity', JSON.stringify(obj));
  };

  const [favorites, setFavorites] = useState([]);
  // 新增或刪除收藏
  const changeFavorite = (data) => {
    if (!localStorage.getItem('localUserData')) {
      Swal.fire({
        icon: 'info',
        title: '無法加入收藏',
        text: '登入會員才能使用收藏功能',
        background: '#F2F8F8',
        confirmButtonColor: '#5C9500',
      });
    } else {
      const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
      const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;
      const id = data.id;

      const findIndex = favorites.map((item) => item.positionId).indexOf(id);

      // 加入 listStarLoading Hook
      setListStarLoading([...listStarLoading, id]);
      if (findIndex > -1) {
        // console.log(favorites[findIndex].id);
        axios
          .delete(
            `https://twtravel-server.onrender.com/600/favorites/${favorites[findIndex].id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            // console.log(res.data);
            // 移除 Loading 畫面
            const removeLoading = listStarLoading.filter((item) => item !== id);
            setListStarLoading(removeLoading);
            Swal.fire({
              toast: true,
              position: 'top-end',
              customClass: {
                container: 'mt-80',
              },
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              title: '取消收藏',
              text: `${data.name}`,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              },
            });

            const newFavorites = favorites.filter(
              (item) => item.id !== favorites[findIndex].id
            );
            setFavorites(newFavorites);
          })
          .catch((err) => {
            // console.log(err.response.data);
            // 移除 Loading 畫面
            const removeLoading = listStarLoading.filter((item) => item !== id);
            setListStarLoading(removeLoading);
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
      } else {
        axios
          .post(
            `https://twtravel-server.onrender.com/600/users/${userId}/favorites`,
            {
              userId: userId,
              positionId: data.id,
              name: data.name,
              city: data.city,
              picture: data.picture[0] || '',
              address: data.address || '',
              px: data.px,
              py: data.py,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            // console.log(res.data);
            // 移除 Loading 畫面
            const removeLoading = listStarLoading.filter((item) => item !== id);
            setListStarLoading(removeLoading);
            Swal.fire({
              toast: true,
              position: 'top-end',
              customClass: {
                container: 'mt-80',
              },
              icon: 'success',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              title: '成功收藏',
              text: `${data.name}`,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              },
            });
            setFavorites([
              ...favorites,
              { id: res.data.id, positionId: res.data.positionId },
            ]);
          })
          .catch((err) => {
            // console.log(err.response.data);
            // 移除 Loading 畫面
            const removeLoading = listStarLoading.filter((item) => item !== id);
            setListStarLoading(removeLoading);
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
      }
    }
  };

  // 篩選出要顯示的卡片
  const [renderCards, setRenderCards] = useState([]);
  const filterCards = (cityData, stateData) => {
    //傳入搜尋時縣市資料以及 useLocation.state 資料，沒有傳入資料就使用 hook 的資料
    if (!cityData) {
      cityData = hotelCards;
    }

    //設定搜尋值為 useLocation.state 資料，沒有就使用 hook 資料
    let search;
    stateData?.inputSearch ? (search = stateData.inputSearch) : (search = inputSearch);

    const districtArray = [];
    const classArray = [];
    const serviceArray = [];
    const gradeArray = [];

    //使用 useLocation 的 filterDistrict、filterClass、targetPage 或使用 hook 資料
    Object.entries(stateData?.filterDistrict || filterDistrict).forEach(
      (data) => {
        if (data[1]) {
          districtArray.push(data[0]);
        }
      }
    );
    Object.entries(stateData?.filterClass || filterClass).forEach((data) => {
      if (data[1]) {
        classArray.push(data[0]);
      }
    });
    Object.entries(stateData?.filterService || filterService).forEach((data) => {
      if (data[1]) {
        serviceArray.push(data[0]);
      }
    });

    Object.entries(stateData?.filterGrade || filterGrade).forEach((data) => {
      if (data[1]) {
        gradeArray.push(data[0]);
      }
    });

    const renderData = cityData
      .filter((data) => {
        return data.name.toLowerCase().match(search.trim().toLowerCase());
      })
      .filter((data) => {
        if (classArray.length === 0) {
          return data;
        } else {
          return classArray.indexOf(data.class) > -1;
        }
      })
      .filter((data) => {
        if (serviceArray.length === 0) {
          return data;
        } else {
          let serviceItem = true;
          serviceArray.filter((item) => {
            if (data.service.indexOf(item) === -1) {
              serviceItem = false;
            }
          });
          return serviceItem;
        }
      })
      .filter((data) => {
        if (gradeArray.length === 0) {
          return data;
        } else {
          return gradeArray.indexOf(data.grade) > -1;
        }
      })
      .filter((data) => {
        if (districtArray.length === 0) {
          return data;
        } else {
          return districtArray.indexOf(data.district) > -1;
        }
      });
    setRenderCards(renderData);
    setPage(
      new Array(Math.ceil(renderData.length / 27)).fill('').map((_, i) => i + 1)
    );

    setTargetPage(stateData?.targetPage || 1);
  };

  // 清除全部選取
  const clearAllCheck = () => {
    const clearDistrict = {};
    const clearClass = {};
    const clearService = {};
    const clearGrade = {};

    Object.keys(filterDistrict).map((data) => {
      clearDistrict[data] = false;
    });
    Object.keys(filterClass).map((data) => {
      clearClass[data] = false;
    });
    Object.keys(filterService).map((data) => {
      clearService[data] = false;
    });
    Object.keys(filterGrade).map((data) => {
      clearGrade[data] = false;
    });

    setFilterDistrict(clearDistrict);
    setFilterClass(clearClass);
    setFilterService(clearService);
    setFilterGrade(clearGrade);
  };

  // 找出縣市的區域
  const findDistricts = () => {
    const districtObj = {};
    districts(selectCity.value).forEach((data) => {
      districtObj[data] = false;
    });
    setFilterDistrict(districtObj);
  };

  // 找出縣市所有類別
  const renderHotelClass = (data) => {
    const hotelClassArr = [];
    const classCheck = {};

    data.forEach((obj) => {
      Object.entries(obj).filter((item) => {
        if (item[0].includes('Class')) {
          if (hotelClassArr.indexOf(item[1]) === -1) {
            hotelClassArr.push(item[1]);
            classCheck[item[1]] = false;
          }
        }
      });
    });

    setFilterClass(classCheck);
  };

  // 找出所有縣市服務
  const [restaurants, setRestaurants] = useState([]);
  const [insideFacilities, setInsideFacilities] = useState([]);
  const [outsideFacilities, setOutsideFacilities] = useState([]);
  const [convenience, setConvenience] = useState([]);
  const [otherService, setOtherService] = useState([]);

  const renderHotelService = (data, service) => {
    const hotelServiceArr = [];
    const serviceCheck = {};

    //提供服務分類判斷 (餐廳、室內、戶外、便利、其他)
    data.forEach((obj) => {
      Object.entries(obj).filter((item) => {
        if (item[0].includes('ServiceInfo')) {
          const serviceArray = item[1]
            .replace(/ <br>/g, '')
            .replace(/[(收免費)]/g, '')
            .split(',')
            .filter((item) => item);
          serviceArray.forEach((data) => {
            if (hotelServiceArr.indexOf(data) === -1) {
              if (data.includes('餐廳') || data.includes('咖啡') || data.includes('酒')) {
                if (restaurants.indexOf(data) === -1) {
                  setRestaurants(restaurants => [...restaurants, data])
                }
              } else if (data.includes('室') || data.includes('會議') || data.includes('健身') || data.includes('店') || data.includes('廳') || data.includes('專櫃') || data.includes('三溫暖')) {
                if (insideFacilities.indexOf(data) === -1) {
                  setInsideFacilities((insideFacilities) => [...insideFacilities, data].sort((a, b) => a.localeCompare(b, 'zh-hant')));
                }
              } else if (data.includes('設施') || data.includes('場') || data.includes('泳池') || data.includes('店') || data.includes('自行車租借')) {
                if (outsideFacilities.indexOf(data) === -1) {
                  setOutsideFacilities((outsideFacilities) => [...outsideFacilities, data].sort((a, b) => a.localeCompare(b, 'zh-hant')));
                }
              } else if (data.includes('網') || data.includes('i') || data.includes('郵電') || data.includes('衣')) {
                if (convenience.indexOf(data) === -1) {
                  setConvenience((convenience) => [...convenience, data].sort((a, b) => a.localeCompare(b, 'zh-hant')));
                }
              }else{
                if (otherService.indexOf(data) === -1) {
                  setOtherService((otherService) => [...otherService, data].sort((a, b) => a.localeCompare(b, 'zh-hant')));
                }
              }
              hotelServiceArr.push(data);

              //判斷是否傳入 useLocation.state.filterService 資料到物件，沒有就全部選項 false
              if (!service) {
                serviceCheck[data] = false;
              }
            }
          });
        }
      });
    });
    //判斷是否傳入 useLocation.state.filterService 資料，沒有就重新設定 hook 資料
    if (!service) {
      setFilterService(serviceCheck);
    }
  };

  // 定義所有縣市星級
  const renderHotelGrade = (data) => {
    const hotelGradeArr = [];
    const gradeCheck = {};

    data.forEach((obj) => {
      Object.entries(obj).filter((item) => {
        if (item[0].includes('Grade')) {
          item[1] = item[1].replace('一', '1');
          item[1] = item[1].replace('二', '2');
          item[1] = item[1].replace('三', '3');
          item[1] = item[1].replace('四', '4');
          item[1] = item[1].replace('五', '5');
          if (hotelGradeArr.indexOf(item[1]) === -1) {
            hotelGradeArr.push(item[1]);
          }
        }
      });
    });

    hotelGradeArr.sort((a, b) => a.localeCompare(b, 'zh-hant')).forEach(item => {
      gradeCheck[item] = false;
    })
    setFilterGrade(gradeCheck);
  };

  // 處理後的卡片資料
  const [hotelCards, setHotelCards] = useState([]);
  // 找出 api 的 district
  const districtFinder = (item) => {
    let district;
    districts(selectCity.value).forEach((districtData) => {
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
  };

  // 處理 api 資料
  const guesthouseData = (data, favorite) => {
    const hotelArray = [];

    data.forEach((item) => {
      const cardObj = {};

      // 判斷是否有 favorite 資料
      if (favorite) {
        const favoriteIdObj = [];
        favorite.forEach((item) => {
          favoriteIdObj.push({ id: item.id, positionId: item.positionId });
        });
        setFavorites(favoriteIdObj);
      }

      cardObj.website = '';
      cardObj.service = [];
      cardObj.picture = [];

      // 找出價格範圍
      let specs = item.Spec?.split(';').filter((item) => item);
      if (specs) {
        specs = specs.map((data) => {
          if (data.indexOf(')') > -1) {
            data = data.split(')')[1];
          }
          if (data.indexOf('房') > -1) {
            data = data.split('房')[1];
          }
          if (data.indexOf('他') > -1) {
            data = data.split('他')[1];
          }
          return data;
        });
        specs = specs.sort((a, b) => a - b);
        specs = specs.filter(item => item != 0)

        if (specs.length === 0) {
          cardObj.price = '無提供價格資訊';
        } else if (specs.length === 1 || specs[0] === specs[specs.length - 1]) {
          cardObj.price = `NT$ ${specs[0]}`;
        } else {
          cardObj.price = `NT$ ${specs[0]} - ${specs[specs.length - 1]}`;
        }
      } else {
        cardObj.price = '無提供價格資訊';
      }

      if (item.ServiceInfo) {
        cardObj.service = item.ServiceInfo.replace(/ <br>/g, '')
          .replace(/[(收免費)]/g, '')
          .split(',')
          .filter((item) => item);
      }

      Object.entries(item.Picture).forEach((picUrl) => {
        if (picUrl[0].includes('PictureUrl')) {
          if (picUrl[1].includes('thumb')) {
            cardObj.picture.push(picUrl[1].replace('_thumb', ''));
          } else {
            cardObj.picture.push(picUrl[1]);
          }
        }
      });

      let grade = '0';
      if (item.Grade) {
        item.Grade = item.Grade.replace('一', '1');
        item.Grade = item.Grade.replace('二', '2');
        item.Grade = item.Grade.replace('三', '3');
        item.Grade = item.Grade.replace('四', '4');
        item.Grade = item.Grade.replace('五', '5');
        grade = item.Grade;
        cardObj.grade = item.Grade;
      } else {
        cardObj.grade = grade;
      }
      cardObj.gradeStar = new Array(Number(grade[0])).fill('*');

      cardObj.id = item.HotelID;
      cardObj.name = item.HotelName;
      cardObj.detail = item.Description;
      cardObj.class = item.Class;
      cardObj.phone = item.Phone;
      cardObj.fax = item.Fax;
      cardObj.address = item.Address;
      cardObj.parking = item.ParkingInfo;
      cardObj.px = item.Position.PositionLat;
      cardObj.py = item.Position.PositionLon;
      cardObj.website = item.WebsiteUrl;
      cardObj.city = item.City;
      const date = item.UpdateTime.split('T')[0];
      const time = item.UpdateTime.split('T')[1].split('+')[0];
      cardObj.district = districtFinder(item);
      cardObj.updateTime = `${date} ${time}`;

      hotelArray.push(cardObj);
    });

    setHotelCards(hotelArray);
    //重選縣市時更新資料，沒有就傳送搜尋時的資料
    if (!currentCity || currentCity !== selectCity.value) {
      setInputSearch('');
      setRenderCards(hotelArray);
      setPage(
        new Array(Math.ceil(hotelArray.length / 27))
          .fill('')
          .map((_, i) => i + 1)
      );
      setTargetPage(1);
      //將選擇縣市的 value 傳入 currentCity
      setCurrentCity(selectCity.value);
    } else {
      filterCards(hotelArray, location);
    }
  };

  // 取得 API 資料
  React.useEffect(() => {
    let tdxTime = 0;

    const getTdx = async () => {
      // localStorage 有 localUserData 才跑下方函式
      const userFavorite = () => {
        if (localStorage?.getItem('localUserData')) {
          const localStorageData = JSON.parse(
            localStorage.getItem('localUserData')
          );
          const id = localStorageData.user.id;
          const token = localStorageData.accessToken;
          return axios.get(`https://twtravel-server.onrender.com/600/users/${id}/favorites`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          return;
        }
      };

      setListLoading(true);
      Promise.all([
        await axios.get(
          `https://tdx.transportdata.tw/api/basic/v2/Tourism/Hotel/${selectCity.value}?$format=JSON`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: localStorage.getItem('tdxToken'),
            },
          }
        ),
        userFavorite(),
      ])
        .then((res) => {
          // console.log(res);
          const data = res[0].data;
          const favoriteData = res[1]?.data;
          //使用 useLocation.state 資料或更新縣市資料
          if (!currentCity || currentCity !== selectCity.value) {
            findDistricts();
            renderHotelClass(data);
            renderHotelGrade(data);
            renderHotelService(data);
          } else {
            setCurrentCity(location.currentCity);
            setAdvanceSearch(location.advanceSearch);
            setInputSearch(location.inputSearch);
            setFilterDistrict(location.filterDistrict);
            setFilterClass(location.filterClass);
            setFilterService(location.filterService);
            setFilterGrade(location.filterGrade);
            setTargetPage(location.targetPage);
            renderHotelService(data, location.filterService);
          }
          guesthouseData(data, favoriteData);
          setListLoading(false);
        })
        .catch((err) => {
          // console.log(err.response.data);
          if (tdxTime < 3) {
            tdxTime++;
            getTdxToken();
          } else {
            setListLoading(false);
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
          localStorage.setItem('tdxToken', token);
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
  }, [selectCity]);

  return (
    <>
      {/* 景點圖片 */}
      <div
        style={{
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundImage: `url(${guesthouseTitleImg})`,
          borderRadius: '0 0 80px 80px',
        }}
      >
        <div
          className="d-flex flex-column text-white"
          style={{
            height: '500px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, .3)',
            borderRadius: '0 0 80px 80px',
          }}
        >
          <h1
            className="container"
            style={{ marginTop: '150px', marginBottom: '135px' }}
          >
            尋找旅宿
          </h1>
          <div
            className={`container p-0 justify-content-center mx-auto px-2 ${
              !advanceSearch ? 'row' : 'd-none'
            }`}
          >
            {/* 城市選單 */}
            <div className="col-12 col-lg-2 p-0 text-dark">
              {/* hook取值: selectCity.value */}
              <Select
                defaultValue={selectCity}
                value={selectCity}
                onChange={(e) => {
                  setDefaultCity(e);
                }}
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
            {/* 搜尋關鍵字 */}
            <div className="col-12 col-lg-7 mt-2 mt-lg-0 p-0">
              <div className="position-relative">
                <input
                  type="text"
                  className=" form-control"
                  id="search"
                  placeholder="請先選取城市再輸入關鍵字"
                  onChange={(e) => {
                    setInputSearch(e.target.value);
                  }}
                  value={inputSearch}
                ></input>
                <FontAwesomeIcon
                  className="text-dark top-0 end-0 position-absolute me-2"
                  style={{ cursor: 'pointer', marginTop: '3.5px' }}
                  icon={faDeleteLeft}
                  size={'2x'}
                  onClick={() => setInputSearch('')}
                />
              </div>
            </div>
            {/* 搜尋按鈕 */}
            <div className="col-12 col-lg-3 mt-2 mt-lg-0">
              <div className="row">
                <div
                  className="col btn btn-primary ms-lg-2"
                  onClick={() => filterCards()}
                >
                  <FontAwesomeIcon
                    className="text-white me-2"
                    icon={faSearch}
                  />
                  <span className="text-nowrap">搜尋</span>
                </div>
                <div
                  className="col btn btn-outline-primary bg-secondary ms-2"
                  onClick={() => setAdvanceSearch(true)}
                >
                  <FontAwesomeIcon
                    className="text-primary me-2"
                    icon={faList}
                  />
                  <span className="text-nowrap">進階搜尋</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 進階搜尋區塊 */}
      <div
        className={`container d-flex flex-column p-0 justify-content-center mx-auto px-3 mb-5 ${
          advanceSearch ? 'd-block' : 'd-none'
        }`}
        style={{ marginTop: '-175px' }}
      >
        <div
          className="row align-items-center py-2 rounded-top"
          style={{ background: 'gray' }}
        >
          <h4 className="col m-0 ps-4 me-auto text-nowrap text-white">
            進階搜尋
          </h4>
          <div className="col text-end me-2">
            <div
              className="btn btn-danger rounded-circle"
              onClick={() => setAdvanceSearch(false)}
            >
              <FontAwesomeIcon icon={faXmark} size={'lg'} />
            </div>
          </div>
        </div>
        <div className="row p-4 bg-secondary text-dark rounded-bottom">
          {/* 城市選單 */}
          <div className="col-12 col-lg-4 p-0">
            {/* hook取值: selectCity.value */}
            <Select
              defaultValue={selectCity}
              value={selectCity}
              onChange={(e) => {
                setDefaultCity(e);
              }}
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
          {/* 搜尋關鍵字 */}
          <div className="col-12 col-lg-8 mt-2 mt-lg-0 p-0">
            <div className="position-relative">
              <input
                type="text"
                className=" form-control"
                id="search"
                placeholder="請先選取城市再輸入關鍵字"
                onChange={(e) => {
                  setInputSearch(e.target.value);
                }}
                value={inputSearch}
              ></input>
              <FontAwesomeIcon
                className="text-dark top-0 end-0 position-absolute me-2"
                style={{ cursor: 'pointer', marginTop: '3.5px' }}
                icon={faDeleteLeft}
                size={'2x'}
                onClick={() => setInputSearch('')}
              />
            </div>
          </div>
          {/* 行政區域 */}
          <h4 className="fs-5 pt-4" style={{ fontWeight: 'bold' }}>
            行政區域
          </h4>
          <ul className="d-flex flex-wrap mt-2 d-flex list-unstyled">
            {Object.keys(filterDistrict).map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value} - ${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${data}`}
                    value={`${data}`}
                    checked={filterDistrict[data]}
                    onChange={() =>
                      setFilterDistrict({
                        ...filterDistrict,
                        [data]: !filterDistrict[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={`${data}`}>
                    {`${data}`}
                  </label>
                </li>
              );
            })}
          </ul>
          {/* 類別清單 */}
          <h4 className="fs-5 pt-2" style={{ fontWeight: 'bold' }}>
            類別
          </h4>
          <ul className="d-flex flex-wrap mt-2 d-flex list-unstyled">
            {Object.keys(filterClass).map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterClass[data]}
                    onChange={() =>
                      setFilterClass({
                        ...filterClass,
                        [data]: !filterClass[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
          </ul>
          <h4
            className="fs-5 pt-2 d-flex flex-column flex-lg-row align-items-lg-center"
            style={{ fontWeight: 'bold' }}
          >
            提供服務<span className="ps-lg-2 fs-6">(符合全部選項才顯示)</span>
          </h4>
          <ul className="d-flex flex-wrap mt-2 d-flex list-unstyled">
            <h6 className="w-100 text-primary" style={{ fontWeight: 'bold' }}>
              餐飲設施
            </h6>
            {restaurants.map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterService[data]}
                    onChange={() =>
                      setFilterService({
                        ...filterService,
                        [data]: !filterService[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
            <h6
              className="w-100 mt-3 text-primary"
              style={{ fontWeight: 'bold' }}
            >
              戶外設施
            </h6>
            {outsideFacilities.map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterService[data]}
                    onChange={() =>
                      setFilterService({
                        ...filterService,
                        [data]: !filterService[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
            <h6
              className="w-100 mt-3 text-primary"
              style={{ fontWeight: 'bold' }}
            >
              室內設施
            </h6>
            {insideFacilities.map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterService[data]}
                    onChange={() =>
                      setFilterService({
                        ...filterService,
                        [data]: !filterService[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
            <h6
              className="w-100 mt-3 text-primary"
              style={{ fontWeight: 'bold' }}
            >
              便利設施
            </h6>
            {convenience.map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterService[data]}
                    onChange={() =>
                      setFilterService({
                        ...filterService,
                        [data]: !filterService[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
            <h6
              className="w-100 mt-3 text-primary"
              style={{ fontWeight: 'bold' }}
            >
              其他
            </h6>
            {otherService.map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterService[data]}
                    onChange={() =>
                      setFilterService({
                        ...filterService,
                        [data]: !filterService[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
          </ul>
          <h4 className="fs-5 pt-2" style={{ fontWeight: 'bold' }}>
            旅宿星級
          </h4>
          <ul className="d-flex flex-wrap mt-2 d-flex list-unstyled">
            {Object.keys(filterGrade).map((data) => {
              return (
                <li
                  className="form-check mx-2"
                  key={`${selectCity.value}-${data}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={data}
                    id={data}
                    checked={filterGrade[data]}
                    onChange={() =>
                      setFilterGrade({
                        ...filterGrade,
                        [data]: !filterGrade[data],
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={data}>
                    {data}
                  </label>
                </li>
              );
            })}
          </ul>
          {/* 搜尋按鈕 */}
          <div className="col-12 col-lg-3 mt-2 mt-lg-0 d-flex flex-column ms-auto">
            <div className="row">
              <div
                className="col btn btn-danger ms-lg-2"
                onClick={() => clearAllCheck()}
              >
                <span className="">全部清除</span>
              </div>
              <div
                className="col btn btn-primary ms-2"
                onClick={() => filterCards()}
              >
                <FontAwesomeIcon className="me-2" icon={faSearch} />
                <span className="text-nowrap">搜尋</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 卡片區塊 */}
      <div className="container mt-5 position-relative">
        {renderCards.length !== 0 ? <h5>共有 {renderCards.length} 處旅宿</h5> : <h5>搜尋不到任何旅宿！</h5>}
        {listLoading ? <ListLoader /> : null}
        <ul className="row row-cols-1 row-cols-lg-3 list-unstyled g-4 mt-2">
          {renderCards
            .filter((data, i) => {
              return Math.ceil((i + 1) / 27) === targetPage;
            })
            .map((data, i) => {
              return (
                <li className="col" key={i}>
                  <div
                    className="card w-100 left-image-card"
                    style={{ cursor: 'pointer', border: '3px solid #EFF4E5' }}
                  >
                    <div className="position-relative">
                      <img
                        className="card activity-img"
                        src={
                          data.picture[0] ||
                          'https://www.survivorsuk.org/wp-content/uploads/2017/01/no-image.jpg'
                        }
                      />
                      <Link
                        to={`/guesthouse/${data.id}`}
                        state={{
                          currentCity: currentCity,
                          inputSearch: inputSearch,
                          advanceSearch: advanceSearch,
                          filterDistrict: filterDistrict,
                          filterClass: filterClass,
                          filterService: filterService,
                          filterGrade: filterGrade,
                          targetPage: targetPage,
                        }}
                      >
                        <div className="card-img-overlay d-flex flex-column justify-content-between img-mask">
                          <h5 className="fs-6 pt-2" style={{ width: '85%' }}>
                            {data.district}
                          </h5>
                          <h4 className="fs-4">
                            {data.gradeStar.map((item, i) => {
                              return (
                                <FontAwesomeIcon
                                  key={i}
                                  className="star-color fs-6"
                                  style={{ marginLeft: '3px' }}
                                  icon={faStarOfDavid}
                                  size={'xs'}
                                />
                              );
                            })}
                            <br />
                            {data.name}
                          </h4>
                        </div>
                      </Link>
                      {/* Loading 畫面與收藏按鈕切換 */}
                      <ListStarLoader
                        listStarLoading={listStarLoading}
                        id={data.id}
                      />
                      <FontAwesomeIcon
                        className={`position-absolute p-3
                        ${listStarLoading.indexOf(data.id) > -1 ? 'd-none' : 'd-block'}
                        ${favorites
                            .map((item) => item.positionId)
                            .indexOf(data.id) > -1
                            ? 'text-primary'
                            : 'text-secondary'
                        }`}
                        style={{top: '0', right: '0', cursor: 'pointer',}}
                        icon={faStar}
                        size={'2x'}
                        onClick={() => changeFavorite(data)}
                      />
                    </div>
                    {/* 卡片連結區塊 */}
                    <Link
                      to={`/guesthouse/${data.id}`}
                      state={{
                        currentCity: currentCity,
                        inputSearch: inputSearch,
                        advanceSearch: advanceSearch,
                        filterDistrict: filterDistrict,
                        filterClass: filterClass,
                        filterService: filterService,
                        filterGrade: filterGrade,
                        targetPage: targetPage,
                      }}
                      className="text-decoration-none text-dark"
                    >
                      <div className="card-body">
                        <p className="card-text d-flex">
                          <FontAwesomeIcon
                            className="text-primary ms-1"
                            icon={faLocationDot}
                            size={'xl'}
                          />
                          <span className={`ps-2 text-truncate`}>
                            {data.address || data.city}
                          </span>
                        </p>
                        <p className="card-text d-flex">
                          <FontAwesomeIcon
                            className="text-primary"
                            icon={faPhone}
                            size={'xl'}
                          />
                          <span className={`ps-2 text-truncate`}>
                            {data.phone || '無提供聯絡電話'}
                          </span>
                        </p>
                        <p className="card-text d-flex">
                          <FontAwesomeIcon
                            className="text-primary"
                            icon={faSackDollar}
                            size={'xl'}
                          />
                          <span className={`ps-2 text-truncate`}>
                            {data.price}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
      {/* 頁碼 */}
      <nav aria-label="Page navigation font-lilita">
        <ul className="pagination justify-content-center align-items-center fw-bold mt-5">
          <li
            className={`page-item ${targetPage === 1 ? 'disabled' : ''} ${renderCards.length === 0 ? 'd-none' : ''}`}
            onClick={() => {
              setTargetPage(targetPage === 1 ? targetPage : targetPage - 1);
              if (targetPage === 1) {
                return;
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <a className="page-link" href="#/guesthouse">
              <FontAwesomeIcon icon={faChevronCircleLeft} size={'xl'} />
            </a>
          </li>
          {page
            .filter(data => page.length > 4 && targetPage > 2 ? data === 1 : null)
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <a
                    className={`page-link rounded ${
                      data === targetPage ? 'active' : ''
                    }`}
                    href="#/guesthouse"
                  >
                    {data}
                  </a>
                </li>
              );
          })}
          {page
            .filter(data => page.length > 6 && targetPage > 3 ? data === 1 : null)
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <a
                    className={`page-link rounded ${
                      data === targetPage ? 'active' : ''
                    }`}
                    href="#/guesthouse"
                  >
                    {data}
                  </a>
                </li>
              );
          })}
          {page.length > 4 && targetPage > 2 ? <span className='d-md-none'>...</span> : null}
          {page.length > 6 && targetPage > 4 ? <span className='d-none d-md-block'>...</span> : null}
          {page
            .filter(data => {
              if(page.length < 5){
                return data;
              }
              if(targetPage < 3){
                return data < 5
              }else{
                return data > targetPage-2 && data < targetPage+2
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <a
                    className={`page-link rounded ${
                      data === targetPage ? 'active' : ''
                    }`}
                    href="#/guesthouse"
                  >
                    {data}
                  </a>
                </li>
              );
          })}
          {page
            .filter(data => {
              if (page.length < 7) {
                return data;
              }
              if(targetPage < 4){
                return data < 7
              }else{
                return data > targetPage-3 && data < targetPage+3
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <a
                    className={`page-link rounded ${
                      data === targetPage ? 'active' : ''
                    }`}
                    href="#/guesthouse"
                  >
                    {data}
                  </a>
                </li>
              );
          })}
          {page.length > 4 && targetPage < page.length - 1 ? <span className='d-md-none'>...</span> : null}
          {page.length > 6 && targetPage < page.length - 2 ? <span className='d-none d-md-block'>...</span> : null}
          <li
            className={`page-item ${targetPage === page.length ? 'disabled' : ''} ${renderCards.length === 0 ? 'd-none' : ''}`}
            onClick={() => {
              setTargetPage(
                targetPage === page.length ? targetPage : targetPage + 1
              );
              if (targetPage === page.length) {
                return;
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <a className="page-link" href="#/guesthouse">
              <FontAwesomeIcon icon={faChevronCircleRight} size={'xl'} />
            </a>
          </li>
        </ul>
        <p
          className="text-center mb-0"
          style={{ fontWeight: 'bold' }}
        >
          共 {page.length} 頁
        </p>
      </nav>
    </>
  );
};

export default GuesthouseList;
