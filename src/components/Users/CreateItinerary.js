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
        title: '??????????????????',
        text: '???????????????????????????????????????',
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
        title: `???????????????`,
        text: data.itineraryName,
        text: '????????????????????????',
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
  // ??????????????????
  const duplicate = (id, name) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;
    const duplicateDate = `${date.$y}-${(date.$M+1).toString().padStart(2,'0')}-${date.$D.toString().padStart(2,'0')}`;

    Swal.fire({
      title: '????????????',
      text: name,
      showCancelButton: true,
      confirmButtonText: '????????????',
      cancelButtonText: '??????',
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
              "name": name + '-??????',
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

        // ??? error ????????? error
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
          // ????????????????????? Swal2
          if (result.value.name === 'AxiosError') {
            setUserLoading(false);
            localStorage.removeItem('localUserData');
            Swal.fire({
              icon: 'warning',
              title: '??????????????????',
              text: '???????????????????????????????????????',
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
            // ????????????????????? Swal2
            // console.log(result)
            setUserLoading(false);
            Swal.fire({
              icon: 'success',
              title: `????????????`,
              text: '????????????????????????',
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
          title: '??????????????????',
          text: '???????????????????????????????????????',
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
      {/* ??????????????? */}
      <form className="form-group d-flex flex-column" onSubmit={handleSubmit(onSubmit)}>
        {/* ???????????? */}
        <label className="ms-1" htmlFor="itineraryName">
          ????????????
        </label>
        <input
          className="mt-2 form-control"
          type="text"
          name="itineraryName"
          id="itineraryName"
          placeholder="????????????????????? (??????16???)"
          {...register('itineraryName', {
            required: { value: true, message: '???????????????' },
            maxLength: { value: 16, message: '????????????16??????' },
            // pattern: {
            //   value: /^(?!.*^user-list$)/i,
            //   message: '?????????????????????',
            // },
          })}
        />
        <span className="text-danger mt-1 ms-2">
          {errors.itineraryName?.message}
        </span>

        <div className="row">
          <div className="col-8 mt-4">
            {/* ???????????? */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack>
                <DatePicker
                  minDate={dayjs().toDate()}
                  inputFormat="YYYY-MM-DD"
                  label="????????????"
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                  }}
                  renderInput={(params) => (
                    <TextField {...params}
                    {...register('itineraryDate', {
                      required: { value: true, message: '???????????????' }
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
            {/* ?????? */}
            <TextField
              className="w-100"
              label="??????"
              type="number"
              defaultValue="1"
              InputLabelProps={{
                shrink: true,
              }}
              {...register('itineraryDays', {
                required: { value: true, message: '????????????' },
                pattern: { value: /^[1-9]\d{0,}$/, message: '????????? 1' },
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
              value={!createLoading ? '????????????' : ''}
            />
            {createLoading ? <CreateLoader /> : null}
          </div>
        </div>
      </form>

      <div className="border-bottom border-primary mb-5"></div>
      {/* ???????????? */}
      <h3 className="text-center mb-4">?????????????????????</h3>
      <ul className="row g-3 list-unstyled mb-0 position-relative">
        {userLoading ? <UserLoader /> : null}
        {itineraryData[0] === null
          ? <h5 className='text-center mt-4'>?????????????????? (??????)</h5>
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
