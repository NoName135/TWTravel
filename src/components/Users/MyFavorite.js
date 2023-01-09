import * as React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import Swal from 'sweetalert2';

import { UserLoader } from '../Loadings';

const MyFavorite = () => {
  const useState = React.useState;
  const useEffect = React.useEffect;
  const navigate = useNavigate();

  const [favoriteData, setFavoriteData] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // 進入收藏內容的 Detail 頁面
  const linkTo = (id) => {
    // console.log(id)
    const classLink = id.split('_')[0]
    let firstPath;
    switch (classLink) {
      case 'C1':
        firstPath = 'view';
        break;
      case 'C2':
        firstPath = 'activity';
        break;
      case 'C3':
        firstPath = 'restaurant';
        break;
      case 'C4':
        firstPath = 'guesthouse';
        break;
    }
    navigate(`/${firstPath}/${id}`);
  }

  const removeFavorite = (id, name) => {
    // console.log(id,name)
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;

    Swal.fire({
      icon: 'question',
      title: '取消收藏',
      text: name,
      showCancelButton: true,
      confirmButtonText: '取消收藏',
      cancelButtonText: '離開',
      background: '#F2F8F8',
      confirmButtonColor: '#dc3545',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return axios
          .delete(`https://twtravel-server.onrender.com/600/favorites/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(res => {
            const filterFavorite = favoriteData.filter(item => item.id !== id)
            setFavoriteData(filterFavorite);
            return res;
          })
          .catch((err) => {
            return err
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      // console.log(result)
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
          Swal.fire({
            icon: 'success',
            title: `已取消收藏`,
            text: name,
            background: '#F2F8F8',
            confirmButtonColor: '#5C9500',
            timer: 2000,
            timerProgressBar: true,
          });
        }
      }
    })
  }

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    setUserLoading(true);
    axios
      .get(`https://twtravel-server.onrender.com/600/users/${userId}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res.data);
        setFavoriteData(res.data.sort((a,b) => b.id - a.id));
        if(res.data.length === 0){
          setFavoriteData([null])
        }
        setUserLoading(false);
      })
      .catch((err) => {
        // console.log(err);
        setUserLoading(false);
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
    <>
      {userLoading ? <UserLoader /> : null}
      <ul className="row g-3 list-unstyled">
        {favoriteData[0] === null
          ? <h4 className='text-center mt-5'>沒有任何收藏 (ΦωΦ)</h4>
          : favoriteData.map((data) => {
          return (
            <li className="col-12 col-lg-4 d-flex" key={data.id}>
              <div
                className="card border-0 w-100 position-relative"
                style={{ cursor: 'pointer' }}
              >
                <img
                  className="card activity-img"
                  src={
                    data.picture ||
                    'https://www.survivorsuk.org/wp-content/uploads/2017/01/no-image.jpg'
                  }
                />
                <div
                  className="card-img-overlay d-flex justify-content-center align-items-center img-mask"
                  onClick={() => linkTo(data.positionId)}
                >
                  <h5 className="text-center mb-0" style={{ width: '90%' }}>
                    {data.name}
                  </h5>
                </div>
                <FontAwesomeIcon
                  className={`position-absolute text-primary top-0 end-0 p-3`}
                  style={{ cursor: 'pointer' }}
                  icon={faStar}
                  size={'2x'}
                  onClick={() => removeFavorite(data.id, data.name)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default MyFavorite;
