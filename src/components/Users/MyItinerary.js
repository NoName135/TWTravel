import * as React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import Swal from 'sweetalert2';

import { UserLoader } from '../Loadings';

const MyItinerary = () => {
  const useState = React.useState;
  const useEffect = React.useEffect;

  const [itineraryData, setItineraryData] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  const deleteItinerary = (id, name) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;

    Swal.fire({
      icon: 'question',
      title: '刪除行程',
      text: name,
      showCancelButton: true,
      confirmButtonText: '確認刪除',
      cancelButtonText: '離開',
      background: '#F2F8F8',
      confirmButtonColor: '#dc3545',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return axios
          .delete(`https://tw-travel-server.vercel.app/600/itineraries/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            const filterItinerary = itineraryData.filter((item) => item.id !== id);
            setItineraryData(filterItinerary);
            return res;
          })
          .catch((err) => {
            return err;
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
            title: `已刪除行程`,
            text: name,
            background: '#F2F8F8',
            confirmButtonColor: '#5C9500',
            timer: 2000,
            timerProgressBar: true,
          });
        }
      }
    });
  }

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    setUserLoading(true);
    axios
      .get(
        `https://tw-travel-server.vercel.app/600/users/${userId}/itineraries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        setItineraryData(res.data.sort((a, b) => b.id - a.id));
        if (res.data.length === 0) {
          setItineraryData([null]);
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
        {itineraryData[0] === null
          ? <h4 className='text-center mt-5'>沒有任何行程，前往
              <a href='#/user/user-list/create-itinerary' className='link-primary text-decoration-none text-nowrap lh-lg'>
                新增行程 <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </h4>
          : itineraryData.map((data, i) => {
          return (
            <li className="col-12 col-lg-4 d-flex" key={i}>
              <div className="card border-0 w-100">
                <img
                  className="card activity-img"
                  src={`https://source.unsplash.com/random/640x480/?landscape&${i}`}
                />
                <div className="card-img-overlay d-flex justify-content-center align-items-center my-itinerary-mask">
                  <div className="text-center flex-column justify-content-around my-itinerary-text h-100">
                    <h5 className="mb-0">{data.name}</h5>
                    <p className="mb-0">{`出發日期：${data.startDate}`}</p>
                  </div>
                  <div className="justify-content-around my-itinerary-btn w-100">
                    <Link to={`/user/edit-itinerary/${data.id}`} className="btn btn-primary px-3">
                      <FontAwesomeIcon icon={faPen} />
                      <span className="ms-2">編輯</span>
                    </Link>
                    <div className="btn btn-danger px-3" onClick={() => deleteItinerary(data.id, data.name)}>
                      <FontAwesomeIcon icon={faTrash} />
                      <span className="ms-2">刪除</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default MyItinerary;
