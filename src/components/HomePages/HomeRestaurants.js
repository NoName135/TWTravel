import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faLocationDot } from '@fortawesome/free-solid-svg-icons';

function HomeRestaurants() {
  return (
    <>
      <div className="row row-cols-1 row-cols-lg-2 mt-4 g-2">
        <Link to='/restaurant/C3_387000000A_000009' className="col d-flex align-items-stretch text-dark text-decoration-none">
          <div
            className="card border-0 d-flex justify-content-center left-image-card"
            style={{ cursor: 'pointer' }}
          >
            <div className="row g-3">
              <div className="col-4 d-flex align-items-center">
                <img
                  className="card-img-top m-2 border"
                  src="https://travel.taichung.gov.tw/content/images/shops/1115/640x480_Filedata635176187938896328.jpg"
                />
              </div>
              <div className="col-8 d-flex flex-column">
                <p className="h6 mx-2 my-3" style={{fontWeight: 'bold'}}>PAPAMIA義式廚房</p>
                <div className="d-flex align-items-center mt-auto">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    AM11:30 - PM14:00 / PM17:30 - PM22:00
                  </span>
                </div>
                <div className="d-flex align-items-center my-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    臺中市407西屯區東興路三段412-1號
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to='/restaurant/C3_315080600H_000015' className="col d-flex align-items-stretch text-dark text-decoration-none">
          <div
            className="card border-0 d-flex justify-content-center left-image-card"
            style={{ cursor: 'pointer' }}
          >
            <div className="row g-3">
              <div className="col-4 d-flex align-items-center">
                <img
                  className="card-img-top m-2 border"
                  src="https://www.penghu-nsa.gov.tw/FileDownload/TravelInformation/Big/20150306144828102.jpg"
                />
              </div>
              <div className="col-8 d-flex flex-column">
                <p className="h6 mx-2 my-3" style={{fontWeight: 'bold'}}>桃太郎日本料理</p>
                <div className="d-flex align-items-center mt-auto">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    05:00-20:00
                  </span>
                </div>
                <div className="d-flex align-items-center my-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    澎湖縣馬公市中正路7巷7號
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to='/restaurant/C3_315080500H_000590' className="col d-flex align-items-stretch text-dark text-decoration-none">
          <div
            className="card border-0 d-flex justify-content-center left-image-card"
            style={{ cursor: 'pointer' }}
          >
            <div className="row g-3">
              <div className="col-4 d-flex align-items-center">
                <img
                  className="card-img-top m-2 border"
                  src="https://www.eastcoast-nsa.gov.tw/image/1550/640x480"
                />
              </div>
              <div className="col-8 d-flex flex-column">
                <p className="h6 mx-2 my-3" style={{fontWeight: 'bold'}}>太魯閣晶英酒店</p>
                <div className="d-flex align-items-center mt-auto">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>24小時</span>
                </div>
                <div className="d-flex align-items-center my-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    花蓮縣972秀林鄉天祥路18號
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to='/restaurant/C3_315081200H_003757' className="col d-flex align-items-stretch text-dark text-decoration-none">
          <div
            className="card border-0 d-flex justify-content-center left-image-card"
            style={{ cursor: 'pointer' }}
          >
            <div className="row g-3">
              <div className="col-4 d-flex align-items-center">
                <img
                  className="card-img-top m-2 border"
                  src="https://www.trimt-nsa.gov.tw/Content/Uploads/StrollArea/Detail/f57c740d-d286-443e-a06b-71fb190e4685_thumb.jpg"
                />
              </div>
              <div className="col-8 d-flex flex-column">
                <p className="h6 mx-2 my-3" style={{fontWeight: 'bold'}}>八堡圳農情館</p>
                <div className="d-flex align-items-center mt-auto">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    週一到週日 09:00-17:00
                  </span>
                </div>
                <div className="d-flex align-items-center my-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mx-2 text-primary"
                  />
                  <span style={{ fontSize: '10px' }}>
                    彰化縣二水鄉裕民村員集路三段253號
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

export default HomeRestaurants;
