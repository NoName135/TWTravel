import * as React from 'react';
import { Routes, Route, Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import { AuthContext, useAuth } from './components/Context';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SingUp';
import ContactUs from './components/ContactUs';

import UserList from './components/UserList';
import MyFavorite from './components/Users/MyFavorite';
import MyItinerary from './components/Users/MyItinerary';
import CreateItinerary from './components/Users/CreateItinerary';
import Itinerary from './components/Itinerary';

import ViewList from './components/Lists/ViewList';
import ViewDetail from './components/Details/ViewDetail.js';

import RestaurantList from './components/Lists/RestaurantList';
import RestaurantDetail from './components/Details/RestaurantDetail';

import GuesthouseList from './components/Lists/GuesthouseList';
import GuesthouseDetail from './components/Details/GuesthouseDetail';

import ActivityList from './components/Lists/ActivityList';
import ActivityDetail from './components/Details/ActivityDetail';
import ScrollToTop from './components/ScrollToTop';

const ProtectedUserPages = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const Layout = () => {
  const useState = React.useState;
  const navigate = useNavigate();

  const [userName, setUserName] = useState(
    JSON.parse(localStorage.getItem('localUserData'))?.user.nickname || false
  );
  const [userPhoto, setUserPhoto] = useState(
    JSON.parse(localStorage.getItem('localUserData'))?.user.photo || false
  );

  const { setToken } = useAuth();
  React.useEffect(() => {
    if (localStorage.getItem('localUserData') !== null) {
      setToken(JSON.parse(localStorage.getItem('localUserData')).accessToken);
    }
   // eslint-disable-next-line
  },[])

  const [changePath, setChangePath] = useState('');
  React.useEffect(() => {
    // console.log(new Date().getTime());
    const now = new Date().getTime();
    const localStorageTime = JSON.parse(localStorage.getItem('localUserData'))?.timeStamp;
    // 登入超過55分鐘會自動登出
    if(now - localStorageTime > 1000*60*55){
      localStorage.removeItem('localUserData');
      setToken(null);
      setUserName(false);
      setUserPhoto(false);
    }else{
      if(userName !== JSON.parse(localStorage.getItem('localUserData'))?.user.nickname){
        setUserName(JSON.parse(localStorage.getItem('localUserData'))?.user.nickname)
      }
      if(userPhoto !== JSON.parse(localStorage.getItem('localUserData'))?.user.photo){
        setUserPhoto(JSON.parse(localStorage.getItem('localUserData'))?.user.photo)
      }
    }
    // eslint-disable-next-line
  }, [changePath]);

  const [recordScrollY, setRecordScrollY] = useState(0);

  document.addEventListener('scroll', () => {
    setRecordScrollY(window.scrollY);
  });

  const path = useLocation().pathname;
  const [faChevron, setFaChevron] = useState(false);

  // 煥頁關閉 Collapse
  const navCollapseRef = React.useRef(null);
  const userCollapseRef = React.useRef(null);
  //會員專區以上按鈕點擊會關閉 Navbar Collapse
  const hideNavBars = () => {
    setChangePath(path)
    navCollapseRef.current.classList.remove('show');
  };
  //會員專區以下按鈕點擊會關閉全部 Collapse
  const hideAllBars = (btn) => {
    setChangePath(path);
    navCollapseRef.current.classList.remove('show');
    userCollapseRef.current.classList.remove('show');
    setFaChevron(!faChevron);

    if(btn === 'logout'){
      localStorage.removeItem('localUserData');
      setToken(null);
      setUserName(false);
      setUserPhoto(false);
      if(path.includes('/view') || path.includes('/restaurant') || path.includes('/guesthouse') || path.includes('/activity')){
        window.location.reload(false);
      }
    }
  };

  return (
    <div className="container-fluid main-height">
      <div className="mainArea">
        {/* navbar */}
        <nav className={`navbar navbar-expand-lg bg-white nav-fix
          ${recordScrollY < 75 && path === '/' ? 'bg-opacity-90' : ''}
          ${recordScrollY < 80 && (path === '/' || path === '/view' || path === '/restaurant' || path === '/guesthouse' || path === '/activity') ? 'bg-opacity-lg-60' : ''}`}>
          <div className="container mx-auto my-2">
            <Link to="/" className="fs-4 navbar-brand ms-1 ms-lg-5 text-primary d-flex align-items-center" onClick={hideNavBars}>
              <img src={require('./img/logo192.png')} style={{height: '30px'}} />
              <span className='ps-2 font-lilita'>TWTravel</span>
            </Link>
            <button className="navbar-toggler me-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav" ref={navCollapseRef} style={{fontWeight: 'bold'}}>
              <ul className="navbar-nav ms-lg-auto align-items-center">
                <li className="nav-item mx-4 my-2 my-lg-0 w-75 text-center">
                  <Link to="/view" className={`nav-link ${path === '/view' ? 'text-primary bg-secondary rounded-pill' : 'nav-btn'}`} aria-current="page" onClick={hideNavBars}>景點</Link>
                </li>
                <li className="nav-item mx-4 mb-2 mb-lg-0 w-75 text-center">
                  <Link to="/restaurant" className={`nav-link ${path === '/restaurant' ? 'text-primary bg-secondary rounded-pill' : 'nav-btn'}`} aria-current="page" onClick={hideNavBars}>餐廳</Link>
                </li>
                <li className="nav-item mx-4 mb-2 mb-lg-0 w-75 text-center">
                  <Link to="/guesthouse" className={`nav-link ${path === '/guesthouse' ? 'text-primary bg-secondary rounded-pill' : 'nav-btn'}`} aria-current="page" onClick={hideNavBars}>旅宿</Link>
                </li>
                <li className="nav-item mx-4 mb-2 mb-lg-0 w-75 text-center">
                  <Link to="/activity" className={`nav-link ${path === '/activity' ? 'text-primary bg-secondary rounded-pill' : 'nav-btn'}`} aria-current="page" onClick={hideNavBars}>活動</Link>
                </li>
                <li className="nav-item mx-auto mx-lg-4 text-center position-relative w-75" style={{cursor: 'pointer'}}>
                  <div>
                    {/* 登入前 */}
                    <Link to="Login" className={`btn btn-primary px-3 rounded-pill justify-content-center align-items-center ${userName ? 'd-none' : 'd-flex'}`}>
                      <FontAwesomeIcon className='d-none d-lg-block' icon={faUser} />
                      <span className='ps-lg-2 text-nowrap'>登入</span>
                    </Link>
                    {/* 登入後 */}
                    <a className={`text-decoration-none d-none ${userName ? 'd-lg-block' : ''}`} data-bs-toggle="collapse" data-bs-target="#memberCollapse">
                      <div className='mx-3 border border-primary rounded-circle' style={{backgroundPosition: 'top', backgroundSize: 'cover',
                        backgroundImage: `url(${userPhoto ? userPhoto : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'})`}}>
                        <div className='rounded-circle nav-user' style={{width: '32px', height: '32px'}}></div>
                      </div>
                    </a>
                    <a className={`nav-link px-5 bg-primary text-white rounded-pill my-2 d-flex justify-content-between align-items-center ${userName ? 'd-lg-none' : 'd-none'}`} data-bs-toggle="collapse" data-bs-target="#memberCollapse" aria-expanded="false" aria-controls="memberCollapse"
                      onClick={() => setFaChevron(!faChevron)}>
                      <div style={{width: '16px'}}></div>
                      <span>{userName}</span>
                      <FontAwesomeIcon className={`chevron ${faChevron ? 'chevron-down' : 'chevron-up'}`} icon={faChevronDown} />
                    </a>
                  </div>
                  <div id="memberCollapse" ref={userCollapseRef} className={`collapse member-btn rounded bg-lg-white
                    ${recordScrollY < 80 && (path === '/' || path === '/view' || path === '/restaurant' || path === '/guesthouse' || path === '/activity') ? 'bg-opacity-lg-60' : ''}`}>
                    <ul className='list-unstyled flex-column text-center'>
                      <li className='mb-2 d-none d-lg-block border-bottom border-primary border-2 py-2' style={{cursor: 'initial'}}>{userName}</li>
                      <Link to='/user/user-list/my-favorite' className={`nav-link mb-2 mb-lg-0 ${path === '/user/user-list/my-favorite' ? 'text-primary bg-secondary rounded-pill mx-lg-2' : 'nav-btn'}`} onClick={hideAllBars}>
                        <li>我的收藏</li>
                      </Link>
                      <Link to='/user/user-list/my-itinerary' className={`nav-link mb-2 mb-lg-0 ${path === '/user/user-list/my-itinerary' ? 'text-primary bg-secondary rounded-pill mx-lg-2' : 'nav-btn'}`} onClick={hideAllBars}>
                        <li>我的行程</li>
                      </Link>
                      <Link to='/user/user-list/create-itinerary' className={`nav-link mb-2 mb-lg-0 ${path === '/user/user-list/create-itinerary' ? 'text-primary bg-secondary rounded-pill mx-lg-2' : 'nav-btn'}`} onClick={hideAllBars}>
                        <li>新增行程</li>
                      </Link>
                      <a className="nav-link mb-2 mb-lg-0 btn btn-outline-info mt-3" onClick={() => hideAllBars('logout')}>
                        <li>登出</li>
                      </a>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>

      {/* 頁尾 */}
      <footer
        className={`py-4 text-primary bg-white ${path === '/' ? 'bg-opacity-50' : ''} mt-5`}
        style={{borderRadius: '30px 30px 0 0', zIndex: '50'}}
      >
        <div className="container d-flex flex-column flex-lg-row justify-content-center align-items-center">
          <span className='pe-lg-2'>© 2022 Ezekiel Lin. All Rights Reserved.</span>
          <span className='mt-2 mt-lg-0 ms-lg-3'>此網站僅作為面試作品使用，非商業用途</span>
          <Link to='/ContactUs' target='_blank' className="btn btn-sm btn-outline-primary px-3 mt-2 mt-lg-0 ms-lg-auto">
            聯絡我們
          </Link>
        </div>
      </footer>
    </div>
  );
}

const User = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};

const View = () => {
  return(
    <>
      <main>
        <Outlet />
      </main>
    </>
  )
}

const Restaurant = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};

const Guesthouse = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};

const Activity = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
};

const EditItinerary = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}

const NotFound = () => {
  return (
    <>
      <main>
        <Link to="/" className="fs-2 d-flex justify-content-center mt-5 text-danger text-decoration-none">你迷路了嗎？可以點我回首頁</Link>
      </main>
    </>
  );
};

function App() {
  const [token, setToken] = React.useState(null);
  return (
    <div className="App">
      <ScrollToTop />
      <AuthContext.Provider value={{ token, setToken }}>
        <Routes>
          <Route path="login" element={<Login />}></Route>
          <Route path="signUp" element={<SignUp />}></Route>
          <Route path="contactUs" element={<ContactUs />}></Route>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedUserPages />}>
              <Route path="user" element={<User />}>
                <Route path="user-list" element={<UserList />}>
                  <Route path="my-favorite" element={<MyFavorite />} />
                  <Route path="my-itinerary" element={<MyItinerary />} />
                  <Route
                    path="create-itinerary"
                    element={<CreateItinerary />}
                  />
                </Route>
                <Route path='edit-itinerary' element={<EditItinerary />}>
                  <Route path=":editId" element={<Itinerary />} />
                </Route>
              </Route>
            </Route>
            <Route path="view" element={<View />}>
              <Route index element={<ViewList />} />
              <Route path=":viewId" element={<ViewDetail />} />
            </Route>
            <Route path="restaurant" element={<Restaurant />}>
              <Route index element={<RestaurantList />} />
              <Route path=":restaurantId" element={<RestaurantDetail />} />
            </Route>
            <Route path="guesthouse" element={<Guesthouse />}>
              <Route index element={<GuesthouseList />} />
              <Route path=":guesthouseId" element={<GuesthouseDetail />} />
            </Route>
            <Route path="activity" element={<Activity />}>
              <Route index element={<ActivityList />} />
              <Route path=":activityId" element={<ActivityDetail />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
