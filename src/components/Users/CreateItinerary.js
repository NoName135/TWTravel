import * as React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { UserLoader, CreateLoader } from '../Loadings';

const CreateItinerary = () => {
  const useState = React.useState;
  const useEffect = React.useEffect;
  const navigate = useNavigate();

  const today = new Date()
  const [date, setDate] = useState(dayjs(`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`));

  const [itineraryData, setItineraryData] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async(data) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    // console.log(data);
    let newId;
    let error;

    setCreateLoading(true);
    try{
      await axios
        .post(`https://twtravel-server.onrender.com/600/itineraries`, {
          "userId": userId,
          "name": data.itineraryName,
          "startDate": `${date.$y}-${(date.$M + 1).toString().padStart(2, '0')}-${(date.$D).toString().padStart(2, '0')}`,
        },{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            console.log(res.data)
            newId = res.data.id;
          })

      for(let i=0; i<Number(data.itineraryDays); i++){
        await axios
          .post(
            `https://twtravel-server.onrender.com/600/itineraries/${newId}/days`,{
              "userId": userId,
              "sort": i+1,
              "startTime": "08:00",
              "position": []
            },{
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
        }
      }
      catch(err){
        console.log(err)
        error = err;
      }

    if(error){
      setCreateLoading(false);
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
    }else{
      setCreateLoading(false);
      Swal.fire({
        icon: 'success',
        title: `已新增行程`,
        text: data.itineraryName,
        text: '將跳轉至編輯行程',
        background: '#F2F8F8',
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 2000,
      });
      setTimeout(() => {
        navigate(`/user/edit-itinerary/${newId}`);
      }, '2000');
    }
  };

  // const reactSwal = withReactContent(Swal);
  // 複製現有行程
  const duplicate = (id, name) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;
    const duplicateDate = `${date.$y}-${(date.$M+1).toString().padStart(2,'0')}-${date.$D.toString().padStart(2,'0')}`;

    Swal.fire({
      title: '複製行程',
      text: name,
      showCancelButton: true,
      confirmButtonText: '新增行程',
      cancelButtonText: '取消',
      background: '#F2F8F8',
      confirmButtonColor: '#5C9500',
      showLoaderOnConfirm: true,
      preConfirm: async() => {
        let newId;
        let error;
        let duplicateData;

        setUserLoading(true);
        try{
          await axios
            .post(`https://twtravel-server.onrender.com/600/itineraries`, {
              "userId": userId,
              "name": name + '-複製',
              "startDate": duplicateDate,
            },{
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => {
                // console.log(res)
                newId = res.data.id;
              })

          await axios
            .get(`https://twtravel-server.onrender.com/600/users/${userId}/days?itineraryId=${id}`,{
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(res => {
                // console.log(res);
                duplicateData = res.data
              })

          for(let i=0; i<duplicateData.length; i++){
            await axios
              .post(
                `https://twtravel-server.onrender.com/600/itineraries/${newId}/days`,{
                  "userId": duplicateData[i]?.userId,
                  "sort": duplicateData[i]?.sort,
                  "startTime": "08:00",
                  "position": duplicateData[i]?.position
                },{
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
          }
        }
        catch(err){
          console.log(err)
          error = err;
        }

        // 有 error 就回傳 error
        if(error){
          return error;
        }else{
          return newId;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        // console.log(result)
        if (result.isConfirmed) {
          // 失敗時開啟以下 Swal2
          if (result.value.name === 'AxiosError') {
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
          } else {
            // 成功時開啟以下 Swal2
            // console.log(result)
            setUserLoading(false);
            Swal.fire({
              icon: 'success',
              title: `複製成功`,
              text: '將跳轉至編輯行程',
              background: '#F2F8F8',
              showConfirmButton: false,
              allowOutsideClick: false,
              timer: 2000,
            });
            setTimeout(() => {
              navigate(`/user/edit-itinerary/${result.value}`);
            }, '2000');
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
        `https://twtravel-server.onrender.com/600/users/${userId}/itineraries`,
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
      {/* 建立新行程 */}
      <form className="form-group d-flex flex-column" onSubmit={handleSubmit(onSubmit)}>
        {/* 行程名稱 */}
        <label className="ms-1" htmlFor="itineraryName">
          行程名稱
        </label>
        <input
          className="mt-2 form-control"
          type="text"
          name="itineraryName"
          id="itineraryName"
          placeholder="請輸入行程名稱 (最多16字)"
          {...register('itineraryName', {
            required: { value: true, message: '此欄位必填' },
            maxLength: { value: 16, message: '不可超過16個字' },
            // pattern: {
            //   value: /^(?!.*^user-list$)/i,
            //   message: '不可輸入此內容',
            // },
          })}
        />
        <span className="text-danger mt-1 ms-2">
          {errors.itineraryName?.message}
        </span>

        <div className="row">
          <div className="col-8 mt-4">
            {/* 出發日期 */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack>
                <DatePicker
                  minDate={dayjs().toDate()}
                  inputFormat="YYYY-MM-DD"
                  label="出發日期"
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                  }}
                  renderInput={(params) => (
                    <TextField {...params}
                    {...register('itineraryDate', {
                      required: { value: true, message: '此欄位必填' }
                    })}
                    onKeyDown={(e) => e.preventDefault()}
                    />
                  )}
                />
                <span className="text-danger mt-1 ms-2 text-nowrap">
                  {errors.itineraryDate?.message}
                </span>
              </Stack>
            </LocalizationProvider>
          </div>

          <div className="col-4 mt-4">
            {/* 天數 */}
            <TextField
              className="w-100"
              label="天數"
              type="number"
              defaultValue="1"
              InputLabelProps={{
                shrink: true,
              }}
              {...register('itineraryDays', {
                required: { value: true, message: '格式錯誤' },
                pattern: { value: /^[1-9]\d{0,}$/, message: '最少為 1' },
              })}
            />
            <span className="text-danger mt-1 ms-2 text-nowrap">
              {errors.itineraryDays?.message}
            </span>
          </div>
          <div className='d-flex justify-content-center mt-4 mb-5 position-relative'>
            <input
              className="btn btn-primary"
              style={{ width: '50%' }}
              type="submit"
              disabled={Object.keys(errors).length > 0 || createLoading}
              value={!createLoading ? '新增行程' : ''}
            />
            {createLoading ? <CreateLoader /> : null}
          </div>
        </div>
      </form>

      <div className="border-bottom border-primary mb-5"></div>
      {/* 複製行程 */}
      <h3 className="text-center mb-4">從我的行程複製</h3>
      <ul className="row g-3 list-unstyled mb-0 position-relative">
        {userLoading ? <UserLoader /> : null}
        {itineraryData[0] === null
          ? <h5 className='text-center mt-4'>沒有任何行程 (ΦωΦ)</h5>
          : itineraryData.map((data, i) => {
          return (
            <li className="col-12 col-lg-6" key={i} onClick={() => {duplicate(data.id, data.name)}}>
              <div
                className="card border-0 left-image-card"
                style={{ cursor: 'pointer' }}
              >
                <div className="row d-flex align-items-center">
                  <div className="col-4">
                    <img
                      className="card-img-top m-2 border rounded-circle"
                      src={`https://source.unsplash.com/random/320x240/?landscape&${i}`}
                    />
                  </div>
                  <div className="col-8 card-body">
                    <h3 className="card-title fs-6 fs-md-4">
                      {data.name}
                    </h3>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  );
};

export default CreateItinerary;
