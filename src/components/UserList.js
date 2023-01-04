import * as React from 'react';
import { Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import Swal from 'sweetalert2';

import { PhotoLoader } from './Loadings';

const UserList = () => {
  const path = useLocation().pathname;
  const useState = React.useState;

  const photoRef = React.useRef();
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photo, setPhoto] = useState(
    JSON.parse(localStorage.getItem('localUserData')).user.photo ||
      'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
  );

  const [name, setName] = useState(
    JSON.parse(localStorage.getItem('localUserData')).user.nickname
  );

  const photoToServer = (imageLink) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    axios
      .patch(
        `https://tw-travel-server.vercel.app/600/users/${userId}`,
        { photo: imageLink },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        const localUser = JSON.parse(localStorage.getItem('localUserData'));
        localUser.user.photo = imageLink;
        localStorage.setItem('localUserData', JSON.stringify(localUser));
        setPhoto(imageLink);
        setPhotoLoading(false);
      })
      .catch((err) => {
        // console.log(err);
        setPhotoLoading(false);
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

  const handleUpload = () => {
    console.log(photoRef.current.files[0]);
    let formData = new FormData();
    formData.append('image', photoRef.current.files[0]);

    setPhotoLoading(true);
    // 上傳圖片到 Imgur
    // 在 Localhost 執行的話 index.html需加入 <meta name="referrer" content="no-referrer">
    axios
      .post('https://api.imgur.com/3/image', formData, {
        headers: {
          Authorization: 'Client-ID ' + '0361c3fa7d90333',
        },
        mimeType: 'multipart/form-data',
      })
      .then((res) => {
        // console.log(res)
        photoToServer(res.data.data.link);
      })
      .catch((err) => {
        // console.log(err)
        setPhotoLoading(false);
        Swal.fire({
          icon: 'error',
          title: '上傳失敗',
          background: '#F2F8F8',
          confirmButtonColor: '#dc3545',
          footer: '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>'
        });
      });
  }

  const changeName = () => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    Swal.fire({
      title: '修改暱稱',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: '確定變更',
      cancelButtonText: '取消',
      background: '#F2F8F8',
      confirmButtonColor: '#5C9500',
      showLoaderOnConfirm: true,
      preConfirm: (newNickname) => {
        if (newNickname.length > 8) {
          Swal.showValidationMessage('暱稱不可超過 8 個字');
        } else {
          return axios
            .patch(
              `https://tw-travel-server.vercel.app/600/users/${userId}`,
              { nickname: newNickname },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              // console.log(res.data);
              setName(newNickname);
              return res;
            })
            .catch((err) => {
              // console.log(err);
              return err;
            });
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      // console.log(result);
      if (result.isConfirmed) {
        // 失敗時開啟以下 Swal2
        if (result.value.name === 'AxiosError') {
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
        } else {
          // 成功時開啟以下 Swal2
          const localUser = JSON.parse(localStorage.getItem('localUserData'));
          localUser.user.nickname = result.value.data.nickname;
          localStorage.setItem('localUserData', JSON.stringify(localUser));
          Swal.fire({
            icon: 'success',
            title: `暱稱已變更`,
            text: result.value.data.nickname,
            background: '#F2F8F8',
            confirmButtonColor: '#5C9500',
          });
        }
      }
    });
  }

  return (
    <>
      <div className="container">
        <div className="row">
          {/* user 側邊攔 */}
          <div className="col-12 col-lg-4 d-flex">
            <div
              className="d-flex flex-column align-items-center position-fixed bg-light w-lg-auto fixed-position"
              style={{ paddingTop: '110px', zIndex: '10' }}
            >
              <label htmlFor="fileUpload">
                <div
                  className="card rounded-circle d-none d-lg-flex border-primary position-relative"
                  style={{
                    cursor: 'pointer',
                    maxWidth: '25vmin',
                    minWidth: '25vmin',
                    minHeight: '25vmin',
                    maxHeight: '25vmin',
                    backgroundPosition: 'top',
                    backgroundSize: 'cover',
                    borderRadius: '50px',
                    backgroundImage: `url(${photo})`,
                  }}
                >
                  {photoLoading ? <PhotoLoader /> : null}
                </div>
              </label>
              <input
                id="fileUpload"
                type="file"
                name="file"
                accept="image/*"
                ref={photoRef}
                className="position-fixed top-0"
                onChange={handleUpload}
              />
              <h2 className="mt-0 mt-lg-4 text-center position-relative">
                {name}
                <span>
                  <FontAwesomeIcon
                    className="link-primary ps-2 position-absolute"
                    icon={faPenToSquare}
                    style={{ cursor: 'pointer', paddingTop: '3px' }}
                    onClick={changeName}
                  />
                </span>
              </h2>
              <ul className="list-unstyled d-flex d-lg-block justify-content-around text-center mt-4 w-100">
                <li>
                  <Link
                    to="/user/user-list/my-favorite"
                    className={`${
                      path === '/user/user-list/my-favorite'
                        ? 'link-info'
                        : 'link-dark'
                    } text-decoration-none`}
                  >
                    <h3
                      className="fs-4 fs-lg-3 mt-lg-4"
                      style={{ fontWeight: 'bold' }}
                    >
                      我的收藏
                    </h3>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/user-list/my-itinerary"
                    className={`${
                      path === '/user/user-list/my-itinerary'
                        ? 'link-info'
                        : 'link-dark'
                    } text-decoration-none`}
                  >
                    <h3
                      className="fs-4 fs-lg-3 mt-lg-4 mx-1"
                      style={{ fontWeight: 'bold' }}
                    >
                      我的行程
                    </h3>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/user-list/create-itinerary"
                    className={`${
                      path === '/user/user-list/create-itinerary'
                        ? 'link-info'
                        : 'link-dark'
                    } text-decoration-none`}
                  >
                    <h3
                      className="fs-4 fs-lg-3 mt-lg-4"
                      style={{ fontWeight: 'bold' }}
                    >
                      新增行程
                    </h3>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* user 切換頁面 */}
          <div className="col-12 col-lg-8 user-main position-relative">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserList;