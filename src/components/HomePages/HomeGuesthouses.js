import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import required modules
import { Navigation } from 'swiper';


function HomeGuesthouses() {
  return (
    <>
      <div className="row row-cols-1 row-cols-lg-3 mt-4 gx-2 gy-3">
        <div className="col">
          <div className="card">
            <Link to="/guesthouse/C4_315080000H_000045" className="guesthouse-title text-decoration-none bg-secondary">
              <div className="card-body">
                <h5 className="card-title text-center" style={{fontWeight: 'bold'}}>洛碁大飯店忠孝館</h5>
              </div>
            </Link>
            <Swiper
              className="home-guesthouse-swiper"
              navigation={true}
              modules={[Navigation]}
            >
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/92202.jpg" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/92203.jpg" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/92375.jpg" />
              </SwiperSlide>
            </Swiper>
            <div className="card-body bg-secondary">
              <div className="d-flex justify-content-center align-items-center">
                <FontAwesomeIcon
                  icon={faSackDollar}
                  className="mx-2 text-primary"
                />
                <span style={{ fontSize: '10px' }}>NT$ 7500 - 10000</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <Link to="/guesthouse/C4_315080000H_017082" className="guesthouse-title text-decoration-none bg-secondary">
              <div className="card-body">
                <h5 className="card-title text-center" style={{fontWeight: 'bold'}}>秀禾宇庭園民宿</h5>
              </div>
            </Link>
            <Swiper
              className="home-guesthouse-swiper"
              navigation={true}
              modules={[Navigation]}
            >
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/151650.jpg" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/26549.jpg" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/36401.JPG" />
              </SwiperSlide>
            </Swiper>
            <div className="card-body bg-secondary">
              <div className="d-flex justify-content-center align-items-center">
                <FontAwesomeIcon
                  icon={faSackDollar}
                  className="mx-2 text-primary"
                />
                <span style={{ fontSize: '10px' }}>NT$ 3000 - 5000</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <Link to="/guesthouse/C4_315080000H_001104" className="guesthouse-title text-decoration-none bg-secondary">
              <div className="card-body">
                <h5 className="card-title text-center" style={{fontWeight: 'bold'}}>竹亮山莊</h5>
              </div>
            </Link>
            <Swiper
              className="home-guesthouse-swiper"
              navigation={true}
              modules={[Navigation]}
            >
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/63947.jpg" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/63945.jpg" />
              </SwiperSlide>
              <SwiperSlide>
                <img src="https://taiwan.taiwanstay.net.tw/twpic/63941.jpg" />
              </SwiperSlide>
            </Swiper>
            <div className="card-body bg-secondary">
              <div className="d-flex justify-content-center align-items-center">
                <FontAwesomeIcon
                  icon={faSackDollar}
                  className="mx-2 text-primary"
                />
                <span style={{ fontSize: '10px' }}>NT$ 1500 - 6500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomeGuesthouses;
