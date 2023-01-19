import * as React from 'react';
import { Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar, faArrowUpRightFromSquare, faLocationDot, faPhone, faDoorOpen, faMapLocationDot, faUtensils, faHouse, faUmbrella, faEye } from '@fortawesome/free-solid-svg-icons';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import required modules
import { EffectFade, Navigation, Pagination } from 'swiper';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { districtsOption as districts } from '../CityOptions';
import { zipCodeSearch as zipCodeDistricts } from '../CityOptions';

import axios from 'axios';
import Swal from 'sweetalert2';

import { DetailLoader, DetailStarLoader } from '../Loadings';


const ViewDetail = () => {
  const useState = React.useState;
  const navigate = useNavigate();

  const location = useLocation().state;
  const currentCity = location ? location.currentCity : null;
  const advanceSearch = location ? location.advanceSearch : null;
  const inputSearch = location ? location.inputSearch : null;
  const filterDistrict = location ? location.filterDistrict : null;
  const filterClass = location ? location.filterClass : null;
  const targetPage = location ? location.targetPage : null;

  const { viewId } = useParams();
  const mapRef = React.useRef();

  const [renderData, setRenderData] = useState({ name: '', picture: [] });
  const [position, setPosition] = useState([0, 0]);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStarLoading, setDetailStarLoading] = useState(false);

  const weatherRef = React.useRef();
  const [renderWeather, setRenderWeather] = useState([{
    name: 'unknown',
    pop: [0,0,0],
    wx: ['','',''],
    wxImg: ['sun.png','sun.png','sun.png'],
    minT: [0,0,0],
    maxT: [0,0,0]
  }]);

  //進入我的收藏頁面
  const linkMyFavorite = () => {
    if (!localStorage.getItem('localUserData')) {
      Swal.fire({
        icon: 'info',
        title: '無法查看收藏',
        text: '登入會員才能使用收藏功能',
        background: '#F2F8F8',
        confirmButtonColor: '#5C9500',
      });
    } else {
      navigate('/user/user-list/my-favorite');
    }
  };

  const [favoriteId, setFavoriteId] = useState(false);
  //新增或刪除收藏
  const changeFavorite = (data) => {
    // localStorage 有 localUserData 才能使用收藏功能
    if (!localStorage.getItem('localUserData')) {
      Swal.fire({
        icon: 'info',
        title: '無法加入收藏',
        text: '登入會員才能使用收藏功能',
        background: '#F2F8F8',
        confirmButtonColor: '#5C9500',
      });
    } else {
      const token = JSON.parse(
        localStorage.getItem('localUserData')
      ).accessToken;
      const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

      setDetailStarLoading(true);
      //判斷是否已加入收藏
      if (favoriteId) {
        axios
          .delete(
            `https://twtravel-server.onrender.com/600/favorites/${favoriteId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            // console.log(res.data);
            setDetailStarLoading(false);
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
            setFavoriteId(false);
          })
          .catch((err) => {
            // console.log(err.response.data);
            setDetailStarLoading(false);
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
              positionId: viewId,
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
            setDetailStarLoading(false);
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
            setFavoriteId(res.data.id);
          })
          .catch((err) => {
            // console.log(err.response.data);
            setDetailStarLoading(false);
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

  // 變更天氣預設位置
  React.useEffect(() => {
    renderWeather.forEach((item, i) => {
      if(item.name === renderData.district){
        weatherRef.current.swiper.slideTo(i, 0);
      }
    })
  },[renderWeather])

  // 處理 api 資料
  const viewData = (data, favorite) => {
    // 取得天氣資料
    const today = new Date()
    const lastDate = new Date(today.setDate(today.getDate() + 3));
    const lastDateStr = `${lastDate.getFullYear()}-${(lastDate.getMonth()+1).toString().padStart(2, '0')}-${lastDate.getDate().toString().padStart(2, '0')}`;
    const getWeatherApi = (lastDateStr) => {
      const weatherData = (districtWeather) => {
        // console.log(districtWeather)
        const weatherArray = []
        districtWeather.forEach(item => {
          const weatherObj = {
            pop: [],
            wx: [],
            wxImg: [],
            minT: [],
            maxT: []
          };
          weatherObj.name = item.locationName;
          item.weatherElement.forEach(data => {
            for(let i=data.time.length-1; data.time.length>6 ? i>=1 : i>=0; i-=2){
              if(data.elementName === 'PoP12h'){
                const firstData = parseInt(data.time[i].elementValue[0].value);
                const secondData = parseInt(i > 0 ? data.time[i-1].elementValue[0].value : '');
                if(secondData){
                  weatherObj.pop.unshift(firstData > secondData ? firstData : secondData);
                }else{
                  weatherObj.pop.unshift(firstData);
                }
              }else if(data.elementName === 'MaxT'){
                const firstData = parseInt(data.time[i].elementValue[0].value);
                const secondData = parseInt(i > 0 ? data.time[i-1].elementValue[0].value : '');
                if(secondData){
                  weatherObj.maxT.unshift(firstData > secondData ? firstData : secondData);
                }else{
                  weatherObj.maxT.unshift(firstData);
                }
              }else if(data.elementName === 'MinT'){
                const firstData = parseInt(data.time[i].elementValue[0].value);
                const secondData = parseInt(i > 0 ? data.time[i-1].elementValue[0].value : '');
                if(secondData){
                  weatherObj.minT.unshift(firstData > secondData ? secondData : firstData);
                }else{
                  weatherObj.minT.unshift(firstData);
                }
              }else if(data.elementName === 'Wx'){
                // https://www.iconfinder.com/iconsets/the-weather-is-nice-today
                const firstValue = parseInt(data.time[i].elementValue[1].value);
                const secondValue = parseInt(i > 0 ? data.time[i-1].elementValue[1].value : '');
                const weatherImg = (wxValue) => {
                  if(wxValue >= 2 && wxValue <= 3){
                    weatherObj.wxImg.unshift('sun_cloud.png');
                  }else if(wxValue >= 4 && wxValue <= 7){
                    weatherObj.wxImg.unshift('cloud.png');
                  }else if(wxValue == 8 || wxValue == 15 || wxValue == 16 || wxValue >= 20 && wxValue <= 22){
                    weatherObj.wxImg.unshift('sun_thunderstorm.png');
                  }else if(wxValue >= 9 && wxValue <= 12 || wxValue == 17 || wxValue == 18 || wxValue == 29 || wxValue == 30){
                    weatherObj.wxImg.unshift('cloud_thunderstorm.png');
                  }else if(wxValue == 13 || wxValue == 14 || wxValue == 39){
                    weatherObj.wxImg.unshift('rain.png');
                  }else if(wxValue == 19){
                    weatherObj.wxImg.unshift('sun_rain.png');
                  }else if(wxValue == 23 || wxValue == 37 || wxValue == 42){
                    weatherObj.wxImg.unshift('cloud_snow.png');
                  }else if(wxValue >= 24 && wxValue <= 26){
                    weatherObj.wxImg.unshift('sun_fog.png');
                  }else if(wxValue == 27 || wxValue == 28 || wxValue >= 31 && wxValue <= 36 || wxValue == 38 || wxValue == 41){
                    weatherObj.wxImg.unshift('cloud_fog.png');
                  }else{
                    weatherObj.wxImg.unshift('sun.png');
                  }
                }
                if(secondValue){
                  if(firstValue > secondValue){
                    const wxData = data.time[i].elementValue[0].value;
                    weatherObj.wx.unshift(wxData);
                    weatherImg(firstValue);
                  }else{
                    const wxData = data.time[i-1].elementValue[0].value;
                    weatherObj.wx.unshift(wxData);
                    weatherImg(secondValue);
                  }
                }else{
                  const wxData = data.time[i].elementValue[0].value;
                  weatherObj.wx.unshift(wxData);
                  weatherImg(firstValue);
                }
              }
            }
          })
          weatherArray.push(weatherObj);
        })
        // console.log(weatherArray);
        setRenderWeather(weatherArray);
      }

      axios
        .get(
          `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-${cityWeatherId}?Authorization=CWB-A3F1ACE0-0537-45D8-980D-DE69B3E9CF7A&elementName=MinT,MaxT,PoP12h,Wx&timeTo=${lastDateStr}T06%3A00%3A00`
        )
        .then((res) => {
          // console.log(res.data.records.locations[0].location);
          weatherData(res.data.records.locations[0].location);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getWeatherApi(lastDateStr);

    const cardObj = {};
    if (favorite) {
      // 已加入收藏就將 favoriteId hook值變更
      favorite.forEach((item) => {
        if (item.positionId === viewId) {
          setFavoriteId(item.id);
        }
      });
    }

    let district;
    districts(data.City).forEach((districtData) => {
      if (data.Address) {
        if (data.Address.includes(districtData)) {
          district = districtData;
        }
      }
    });

    if (district) {
      cardObj.district = district;
    } else if (data.ZipCode) {
      cardObj.district = zipCodeDistricts(
        data.ZipCode.split('').slice(0, 3).join('')
      );
    } else {
      cardObj.district = '';
    }

    cardObj.website = '';
    cardObj.picture = [];

    Object.entries(data.Picture).forEach((picUrl) => {
      if (picUrl[0].includes('PictureUrl')) {
        if (picUrl[1].includes('thumb')) {
          cardObj.picture.push(picUrl[1].replace('_thumb', ''));
        } else {
          cardObj.picture.push(picUrl[1]);
        }
      }
    });

    if (cardObj.picture.length === 0) {
      cardObj.picture.push(
        'https://www.survivorsuk.org/wp-content/uploads/2017/01/no-image.jpg'
      );
    }

    cardObj.name = data.ScenicSpotName;
    cardObj.detail = data.DescriptionDetail;
    cardObj.phone = data.Phone;
    cardObj.address = data.Address;
    cardObj.openTime = data.OpenTime;
    cardObj.px = data.Position.PositionLat;
    cardObj.py = data.Position.PositionLon;
    cardObj.website = data.WebsiteUrl;
    cardObj.city = data.City;
    cardObj.updateDate = data.UpdateTime.split('T')[0];

    // console.log(cardObj);
    setRenderData(cardObj);
    setPosition([cardObj.px, cardObj.py]);
    mapRef.current.setView([cardObj.px, cardObj.py], 15);
  };

  let cityWeatherId = '063';
  const getCityWeatherId = (city) => {
    switch (city) {
      case '宜蘭縣':
        cityWeatherId = '003';
        break;
      case '桃園市':
        cityWeatherId = '007';
        break;
      case '新竹縣':
        cityWeatherId = '011';
        break;
      case '苗栗縣':
        cityWeatherId = '015';
        break;
      case '彰化縣':
        cityWeatherId = '019';
        break;
      case '南投縣':
        cityWeatherId = '023';
        break;
      case '雲林縣':
        cityWeatherId = '027';
        break;
      case '嘉義縣':
        cityWeatherId = '031';
        break;
      case '屏東縣':
        cityWeatherId = '035';
        break;
      case '臺東縣':
        cityWeatherId = '039';
        break;
      case '花蓮縣':
        cityWeatherId = '043';
        break;
      case '澎湖縣':
        cityWeatherId = '047';
        break;
      case '基隆市':
        cityWeatherId = '051';
        break;
      case '新竹市':
        cityWeatherId = '055';
        break;
      case '嘉義市':
        cityWeatherId = '059';
        break;
      case '臺北市':
        cityWeatherId = '063';
        break;
      case '高雄市':
        cityWeatherId = '067';
        break;
      case '新北市':
        cityWeatherId = '071';
        break;
      case '臺中市':
        cityWeatherId = '075';
        break;
      case '臺南市':
        cityWeatherId = '079';
        break;
      case '連江縣':
        cityWeatherId = '083';
        break;
      case '金門縣':
        cityWeatherId = '087';
        break;
    }
  }

  // 取得 API 資料
  React.useEffect(() => {
    let tdxTime = 0;

    const getTdxId = async () => {
      // localStorage 有 localUserData 才跑下方函式
      const userFavorite = () => {
        if (localStorage?.getItem('localUserData')) {
          const localStorageData = JSON.parse(
            localStorage.getItem('localUserData')
          );
          const id = localStorageData.user.id;
          const token = localStorageData.accessToken;
          return axios.get(
            `https://twtravel-server.onrender.com/600/users/${id}/favorites`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          return;
        }
      };

      setDetailLoading(true);
      Promise.all([
        axios.get(
          `https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$filter=contains(ScenicSpotID,'${viewId}')&$format=JSON`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: localStorage.getItem('tdxToken'),
            },
          }
        ),
        userFavorite()
      ])
        .then((res) => {
          // console.log(res);
          getCityWeatherId(res[0].data[0].City);
          const data = res[0].data[0];
          const favoriteId = res[1]?.data;
          viewData(data, favoriteId);
          setDetailLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (tdxTime < 3) {
            tdxTime++;
            getTdxToken();
          } else {
            setDetailLoading(false);
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
          setDetailLoading(false);
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
          getTdxId();
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
      getTdxId();
    }

    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="container position-relative">
        {detailLoading ? <DetailLoader /> : null}
        <div
          id="custom-toast"
          className="bg-light position-fixed w-100"
          style={{ paddingTop: '100px', paddingBottom: '15px', zIndex: '1001' }}
        >
          <Link
            to="/view"
            className="link-dark d-flex align-items-center"
            style={{ width: '150px' }}
            state={{
              currentCity: currentCity,
              inputSearch: inputSearch,
              advanceSearch: advanceSearch,
              filterDistrict: filterDistrict,
              filterClass: filterClass,
              targetPage: targetPage,
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={'xl'} />
            <span className="fs-5 ps-2" style={{ fontWeight: 'bold' }}>
              返回景點搜尋
            </span>
          </Link>
        </div>
        <h1
          className="text-primary text-center text-lg-start"
          style={{ fontWeight: 'bold', paddingTop: '160px' }}
        >
          {renderData.name}
        </h1>
        <div className="row flex-lg-row-reverse">
          <div className="col-12 col-lg-4 d-flex justify-content-center justify-content-lg-end">
            {renderData.website ? (
              <a
                href={renderData.website}
                target="_blank"
                className="text-decoration-none mt-3"
              >
                <button
                  className={`btn btn-outline-primary position-relative website-link ${
                    renderData.website ? '' : 'd-none'
                  }`}
                >
                  <span className="px-2">前往官方網站</span>
                  <FontAwesomeIcon
                    className="position-absolute top-0 end-0 pt-1 pe-1"
                    icon={faArrowUpRightFromSquare}
                  />
                </button>
              </a>
            ) : null}
          </div>
          <div className="col-12 mt-3 d-lg-none text-center">
            <h5>更新日期：{renderData.updateDate}</h5>
          </div>
          <div className="col-12 col-lg-8 mt-3">
            <div className="d-flex align-items-center">
              <h4 className="mb-0" style={{ fontWeight: 'bold' }}>
                {renderData.city}
              </h4>
              <h5 className="ps-4 d-none d-lg-flex mb-0">
                更新日期：{renderData.updateDate}
              </h5>
              <div
                className="btn btn-info ms-auto"
                style={{ fontWeight: 'bold', marginRight: '48px' }}
                onClick={linkMyFavorite}
              >
                <FontAwesomeIcon className="me-1" icon={faEye} />
                查看收藏
              </div>
            </div>
          </div>
        </div>

        {/* 主要卡片區域 */}
        <div className="row mt-1 g-3">
          <div
            className="sticky-top-95 d-lg-none w-auto ms-auto"
            style={{ zIndex: '1001', marginTop: '-40px' }}
          >
            {detailStarLoading ? <DetailStarLoader /> : null}
            <FontAwesomeIcon
              className={`${favoriteId ? 'text-primary' : 'text-gray-500'}
              ${detailStarLoading ? 'd-none' : ''}`}
              icon={faStar}
              size={'2x'}
              style={{ cursor: 'pointer' }}
              onClick={() => changeFavorite(renderData)}
            />
          </div>
          <div className="col-12 col-lg-8">
            <div
              className="float-end sticky-top-95 d-none d-lg-block"
              style={{ zIndex: '1001', marginTop: '-57px' }}
            >
              {detailStarLoading ? <DetailStarLoader /> : null}
              <FontAwesomeIcon
                className={`${favoriteId ? 'text-primary' : 'text-gray-500'}
                  ${detailStarLoading ? 'd-none' : ''}`}
                icon={faStar}
                size={'2x'}
                style={{ cursor: 'pointer' }}
                onClick={() => changeFavorite(renderData)}
              />
            </div>
            <div className="border border-2 border-primary rounded p-3">
              {/* SwiperJS */}
              <div>
                <Swiper
                  className="details-swiper"
                  spaceBetween={30}
                  effect={'fade'}
                  navigation={true}
                  pagination={{
                    clickable: true,
                  }}
                  modules={[EffectFade, Navigation, Pagination]}
                >
                  {renderData.picture.map((data) => {
                    return (
                      <SwiperSlide key={data}>
                        <img src={data} />
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
              {/* 景點介紹 */}
              <h4 className="mt-4 mb-0" style={{ fontWeight: 'bold' }}>
                景點介紹
              </h4>
              <div
                className="mt-3 lh-lg"
                style={{ fontSize: '18px', letterSpacing: '2px' }}
              >
                {renderData.detail}
              </div>
              {/* 景點資訊 */}
              <h4 className="mt-4" style={{ fontWeight: 'bold' }}>
                景點資訊
              </h4>
              <p className="d-flex mt-4">
                <FontAwesomeIcon
                  className="text-primary ms-1"
                  icon={faLocationDot}
                  size={'xl'}
                />
                <span className="ps-2 ms-1">
                  {renderData.address ? renderData.address : renderData.city}
                </span>
              </p>
              <p className="d-flex">
                <FontAwesomeIcon
                  className="text-primary"
                  icon={faPhone}
                  size={'xl'}
                />
                <span className="ps-2">
                  {renderData.phone || '無提供聯絡電話'}
                </span>
              </p>
              <p className="d-flex">
                <FontAwesomeIcon
                  className="text-primary"
                  icon={faDoorOpen}
                  size={'xl'}
                />
                <span className="ps-2">
                  {renderData.openTime || '全天開放'}
                </span>
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="sticky-top-160">
              {/* Open Street Map */}
              <div style={{ height: '300px' }}>
                <MapContainer
                  ref={mapRef}
                  className="h-100"
                  center={position}
                  zoom={15}
                  zoomControl={false}
                  scrollWheelZoom={'center'}
                  touchZoom={'center'}
                  doubleClickZoom={'center'}
                  dragging={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position}>
                    <Popup>
                      <p>
                        {renderData.name}
                        <a
                          href={`https://www.google.com/maps/place/${position[0]},${position[1]}`}
                          target="_blank"
                        >
                          <FontAwesomeIcon
                            className="ps-1"
                            icon={faMapLocationDot}
                          />
                        </a>
                      </p>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              {/* 附近場所 */}
              <div className="row row-cols-2 gx-2 gx-lg-3 mt-3">
                <div className="col">
                  <a
                    href={`https://www.google.com.tw/maps/search/餐廳/@${position[0]},${position[1]},16z`}
                    target="_blank"
                    className="text-decoration-none"
                  >
                    <div className="btn btn-outline-primary d-flex flex-column justify-content-center align-items-center py-4">
                      <FontAwesomeIcon
                        className=""
                        icon={faUtensils}
                        size={'2x'}
                      />
                      <span className="fs-4 pt-2">附近餐廳</span>
                    </div>
                  </a>
                </div>
                <div className="col">
                  <a
                    href={`https://www.google.com.tw/maps/search/住宿/@${position[0]},${position[1]},16z`}
                    target="_blank"
                    className="text-decoration-none"
                  >
                    <div className="btn btn-outline-primary d-flex flex-column justify-content-center align-items-center py-4">
                      <FontAwesomeIcon
                        className=""
                        icon={faHouse}
                        size={'2x'}
                      />
                      <span className="fs-4 pt-2">附近旅宿</span>
                    </div>
                  </a>
                </div>
              </div>
              {/* 天氣預報 */}
              <div className="row row-cols-1 mt-3">
                <div className="col">
                  <div className="d-flex flex-column border border-primary rounded p-3 position-relative">
                      <h4 className="position-absolute bg-light" style={{ fontWeight: 'bold', zIndex: '10' }}>
                        天氣預報
                      </h4>
                    <Swiper
                      ref={weatherRef}
                      navigation={true}
                      modules={[Navigation]}
                      className="weather-swiper"
                    >
                      {renderWeather.map((item, i) => {
                        return (
                        <SwiperSlide key={item.name}>
                          <p className="text-end mb-0" style={{marginTop: '2px', marginRight: '24px'}}>
                            {item.name}
                          </p>
                          <div className="row flex-column mt-2">
                            <div className="col mt-2">
                              <div className="card bg-secondary">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center p-2">
                                  <h5
                                    className="mb-lg-0 text-primary"
                                    style={{ fontWeight: 'bold' }}
                                  >
                                    今天
                                  </h5>
                                  <div className="d-flex justify-content-between align-items-center" style={{width: '101.5px'}}>
                                    <img
                                      style={{ width: '30px', height: '30px' }}
                                      src={require(`../../img/weathers/${item.wxImg[0]}`)}
                                      title={item.wx[0]}
                                    />
                                    <span className="ps-1">{item.minT[0]} - {item.maxT[0]}°C</span>
                                  </div>
                                  <div className="mt-1 mt-lg-0 d-flex justify-content-between align-items-center" style={{width: '70px'}}>
                                    <FontAwesomeIcon
                                      className="text-primary"
                                      icon={faUmbrella}
                                      size={'lg'}
                                    />
                                    <span className="ps-1">{item.pop[0]}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col mt-2">
                              <div className="card bg-secondary">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center p-2">
                                  <h5
                                    className="mb-lg-0 text-primary"
                                    style={{ fontWeight: 'bold' }}
                                  >
                                    明天
                                  </h5>
                                  <div className="d-flex justify-content-between align-items-center" style={{width: '101.5px'}}>
                                    <img
                                      style={{ width: '30px', height: '30px' }}
                                      src={require(`../../img/weathers/${item.wxImg[1]}`)}
                                      title={item.wx[1]}
                                    />
                                    <span className="ps-1">{item.minT[1]} - {item.maxT[1]}°C</span>
                                  </div>
                                  <div className="mt-1 mt-lg-0 d-flex justify-content-between align-items-center" style={{width: '70px'}}>
                                    <FontAwesomeIcon
                                      className="text-primary"
                                      icon={faUmbrella}
                                      size={'lg'}
                                    />
                                    <span className="ps-1">{item.pop[1]}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col mt-2">
                              <div className="card bg-secondary">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center p-2">
                                  <h5
                                    className="mb-lg-0 text-primary"
                                    style={{ fontWeight: 'bold' }}
                                  >
                                    後天
                                  </h5>
                                  <div className="d-flex justify-content-between align-items-center" style={{width: '101.5px'}}>
                                    <img
                                      style={{ width: '30px', height: '30px' }}
                                      src={require(`../../img/weathers/${item.wxImg[2]}`)}
                                      title={item.wx[2]}
                                    />
                                    <span className="ps-1">{item.minT[2]} - {item.maxT[2]}°C</span>
                                  </div>
                                  <div className="mt-1 mt-lg-0 d-flex justify-content-between align-items-center" style={{width: '70px'}}>
                                    <FontAwesomeIcon
                                      className="text-primary"
                                      icon={faUmbrella}
                                      size={'lg'}
                                    />
                                    <span className="ps-1">{item.pop[2]}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                        )
                      })}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewDetail;