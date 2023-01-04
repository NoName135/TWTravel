import * as React from 'react';
import { Link } from 'react-router-dom';
import HomeViews from './HomePages/HomeViews';
import HomeRestaurants from './HomePages/HomeRestaurants';
import HomeGuesthouses from './HomePages/HomeGuesthouses';
import HomeActivities from './HomePages/HomeActivities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import 'animate.css/animate.min.css';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import mapLocationImg from '../img/map-location.png';
import tourListImg from '../img/tour-list.png';
import travelerImg from '../img/traveler.png';
import homeSignup from '../img/home-signUp.jpg';
import { useAuth } from './Context';

const Home = () => {
  const useState = React.useState;
  const { token } = useAuth();

  return (
    <>
      {/* 首頁圖片 */}
      <div
        className="overflow-hidden"
        style={{ height: '600px', borderRadius: '0 0 80px 80px' }}
      >
        <div
          style={{
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1590510167593-fb811211a891?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80)',
          }}
        >
          <div
            className="d-flex flex-column justify-content-center align-items-center text-white"
            style={{
              height: '600px',
              fontWeight: 'bold',
              backgroundColor: 'rgba(0, 0, 0, .3)',
            }}
          >
            <h1>台灣旅遊，說走就走</h1>
            <h2 className="pt-2">Visit Formosa</h2>
            <p className="py-4">探訪福爾摩沙之美，就從自助旅行開始！</p>
            <Link
              to={`${token ? '/user/user-list/create-itinerary' : '/login'}`}
              className="btn btn-primary btn-lg fs-4 px-5"
            >
              行程規劃
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {/* 功能簡介 */}
        <div className="d-flex justify-content-center align-items-center mt-5 pt-4">
          <div
            className="bg-primary"
            style={{
              width: '192px',
              height: '14px',
              borderRadius: '20px 3px 3px 0',
            }}
          ></div>
          <span
            className="h3 mb-0 text-primary text-nowrap px-4"
            style={{ fontWeight: 'bold' }}
          >
            功能簡介
          </span>
          <div
            className="bg-primary"
            style={{
              width: '192px',
              height: '14px',
              borderRadius: '3px 20px 0 3px',
            }}
          ></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <ul className="list-unstyled mt-5 row row-cols-1 row-cols-lg-3">
              <li className="col">
                <AnimationOnScroll
                  animateOnce={true}
                  animateIn="animate__fadeInUpBig"
                >
                  <div className="card bg-transparent border-0 align-items-center">
                    <img
                      className="card-img-top mx-auto"
                      src={require('../img/wishlist.png')}
                      style={{ width: '160px' }}
                    />
                    <div className="card-body col-8 col-lg-12">
                      <p className="text-center fs-5">加入收藏</p>
                      <p>
                        在搜尋景點、餐廳、住宿、活動地點時，將想前往的地點加入收藏，可以在個人檔案瀏覽，在安排行程時也可以快速新增。
                      </p>
                    </div>
                  </div>
                </AnimationOnScroll>
              </li>
              <li className="col">
                <AnimationOnScroll
                  animateOnce={true}
                  delay={100}
                  animateIn="animate__fadeInUpBig"
                >
                  <div className="card bg-transparent border-0 align-items-center">
                    <img
                      className="card-img-top mx-auto"
                      src={require('../img/rocket.png')}
                      style={{ width: '160px' }}
                    />
                    <div className="card-body col-8 col-lg-12">
                      <p className="text-center fs-5">計算路程</p>
                      <p>
                        在規劃行程時，只要新增想去的地點，選擇您預計使用的交通工具，我們會自動幫您計算路程所需的時間。
                      </p>
                    </div>
                  </div>
                </AnimationOnScroll>
              </li>
              <li className="col">
                <AnimationOnScroll
                  animateOnce={true}
                  delay={200}
                  animateIn="animate__fadeInUpBig"
                >
                  <div className="card bg-transparent border-0 align-items-center">
                    <img
                      className="card-img-top mx-auto"
                      src={require('../img/box.png')}
                      style={{ width: '160px' }}
                    />
                    <div className="card-body col-8 col-lg-12">
                      <p className="text-center fs-5">存取記錄</p>
                      <p>
                        在規劃行程途中會隨時存檔，不用擔心中途關閉或意外發生，也可以從您過往行程複製修改，讓您快速規劃新的旅程。
                      </p>
                    </div>
                  </div>
                </AnimationOnScroll>
              </li>
            </ul>
          </div>
        </div>

        {/* 尋找地點 */}
        <div className="d-flex justify-content-center align-items-center mt-5 pt-4">
          <div
            className="bg-primary"
            style={{
              width: '192px',
              height: '14px',
              borderRadius: '20px 3px 3px 0',
            }}
          ></div>
          <span
            className="h3 mb-0 text-primary text-nowrap px-4"
            style={{ fontWeight: 'bold' }}
          >
            尋找地點
          </span>
          <div
            className="bg-primary"
            style={{
              width: '192px',
              height: '14px',
              borderRadius: '3px 20px 0 3px',
            }}
          ></div>
        </div>
        <p className="fs-4 text-center mt-4">四大類別讓您快速找到想去的地點</p>
        {/* 別有天地 */}
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-lg-8">
            <div className="d-flex">
              <FontAwesomeIcon
                className="text-primary"
                icon={faFlag}
                size="2x"
              />
              <span className="fs-5 ps-4 text-dark">別有天地</span>
              <Link
                to="/view"
                className="btn btn-outline-primary rounded-pill ms-auto"
              >
                看更多景點
              </Link>
            </div>
            <HomeViews />

            {/* 美食珍饌 */}
            <div className="d-flex mt-5">
              <FontAwesomeIcon
                className="text-primary"
                icon={faFlag}
                size="2x"
              />
              <span className="fs-5 ps-4 text-dark">美食珍饌</span>
              <Link
                to="/restaurant"
                className="btn btn-outline-primary rounded-pill ms-auto"
              >
                看更多餐廳
              </Link>
            </div>
            <HomeRestaurants />

            {/* 養精蓄銳 */}
            <div className="d-flex mt-5">
              <FontAwesomeIcon
                className="text-primary"
                icon={faFlag}
                size="2x"
              />
              <span className="fs-5 ps-4 text-dark">養精蓄銳</span>
              <Link
                to="/guesthouse"
                className="btn btn-outline-primary rounded-pill ms-auto"
              >
                看更多旅宿
              </Link>
            </div>
            <HomeGuesthouses />

            {/* 精彩絕倫 */}
            <div className="d-flex mt-5">
              <FontAwesomeIcon
                className="text-primary"
                icon={faFlag}
                size="2x"
              />
              <span className="fs-5 ps-4 text-dark">精彩絕倫</span>
              <Link
                to="/activity"
                className="btn btn-outline-primary rounded-pill ms-auto"
              >
                看更多活動
              </Link>
            </div>
            <HomeActivities />
          </div>

          {/* 便利功能 */}
          <div className="d-flex justify-content-center align-items-center mt-5 pt-4">
            <div
              className="bg-primary"
              style={{
                width: '192px',
                height: '14px',
                borderRadius: '20px 3px 3px 0',
              }}
            ></div>
            <span
              className="h3 mb-0 text-primary text-nowrap px-4"
              style={{ fontWeight: 'bold' }}
            >
              便利功能
            </span>
            <div
              className="bg-primary"
              style={{
                width: '192px',
                height: '14px',
                borderRadius: '3px 20px 0 3px',
              }}
            ></div>
          </div>
          <p className="fs-4 text-center mt-4">
            人性化的功能，輕鬆規劃您的規劃行程
          </p>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-6">
              <AnimationOnScroll
                animateIn="animate__fadeInLeft"
                animateOut="animate__fadeOutRight"
              >
                <div className="row row-cols-1 row-cols-lg-2 flex-row-reverse justify-content-center">
                  <div
                    className="col"
                    style={{
                      height: '300px',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                      backgroundPosition: 'right',
                      backgroundImage: `url(${mapLocationImg})`,
                    }}
                  ></div>
                  <div className="col-8 d-flex flex-column justify-content-center pt-4">
                    <h4 style={{ fontWeight: 'bold' }}>拖曳就能改變行程順序</h4>
                    <p className="pt-4">
                      新增行程後突然想要修改順序嗎？只要點擊並拖曳，就能直接變更順序，路程時間也會幫您重新計算。
                    </p>
                  </div>
                </div>
              </AnimationOnScroll>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-6">
              <AnimationOnScroll
                animateIn="animate__fadeInRight"
                animateOut="animate__fadeOutLeft"
              >
                <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
                  <div
                    className="col mt-4"
                    style={{
                      height: '300px',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                      backgroundPosition: 'left',
                      backgroundImage: `url(${tourListImg})`,
                    }}
                  ></div>
                  <div className="col-8 d-flex flex-column justify-content-center pt-4">
                    <h4 style={{ fontWeight: 'bold' }}>輸入地址也能計算路程</h4>
                    <p className="pt-4">
                      新增行程時搜尋不到您要找的地點嗎？只要輸入地址，也能幫您計算路程時間，客製化您想要的行程。
                    </p>
                  </div>
                </div>
              </AnimationOnScroll>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-6">
              <AnimationOnScroll
                animateIn="animate__fadeInLeft"
                animateOut="animate__fadeOutRight"
              >
                <div className="row row-cols-1 row-cols-lg-2 flex-row-reverse justify-content-center">
                  <div
                    className="col mt-4"
                    style={{
                      height: '300px',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                      backgroundPosition: 'right',
                      backgroundImage: `url(${travelerImg})`,
                    }}
                  ></div>
                  <div className="col-8 d-flex flex-column justify-content-center pt-4">
                    <h4 style={{ fontWeight: 'bold' }}>
                      自動計算抵達和離開時間
                    </h4>
                    <p className="pt-4">
                      不想計算何時要前往下個地點嗎？只要輸入您想在這個地方待多久，就會幫您算出抵達和離開的時間。
                    </p>
                  </div>
                </div>
              </AnimationOnScroll>
            </div>
          </div>

          {/* 立即註冊 */}
          <div className="col-12 col-lg-10 overflow-hidden mt-5 pt-4">
            <div
              style={{
                backgroundPosition: 'left bottom',
                backgroundSize: 'cover',
                borderRadius: '50px',
                backgroundImage: `url(${homeSignup})`,
              }}
            >
              <div
                className="d-flex flex-column justify-content-center align-items-center text-white px-2 text-center"
                style={{
                  height: '250px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, .5)',
                  borderRadius: '50px',
                }}
              >
                <AnimationOnScroll
                  animateOnce={true}
                  delay={500}
                  animateIn="animate__bounceIn"
                >
                  <h3>立即註冊開始規劃您的行程！</h3>
                  <Link
                    to="SignUp"
                    className="btn btn-primary btn-lg mt-5 px-4"
                  >
                    註冊帳號
                  </Link>
                </AnimationOnScroll>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
