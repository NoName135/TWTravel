import * as React from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faArrowLeft, faPenToSquare, faCloudArrowDown, faCirclePlus, faTrashCan, faLocationPin, faCar, faMotorcycle, faBicycle, faPersonWalking, faFilePen, faMagnifyingGlass, faStar, faPlus, faPen, faAnglesRight, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import Swal from 'sweetalert2';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';

import { ItineraryLoader, DayLoader, VehicleLoader } from './Loadings';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import SearchPosition from './AddPosition/SearchPosition';
import FavoritePosition from './AddPosition/FavoritePosition';
import CustomPosition from './AddPosition/CustomPosition';

import cityOptions from './CityOptions';
import { districtsOption as districts } from './CityOptions';

// map資料
import { MapContainer, TileLayer, Marker, Popup, Tooltip, LayersControl } from 'react-leaflet';
import * as L from 'leaflet';
import { text } from '@fortawesome/fontawesome-svg-core';

const { BaseLayer } = LayersControl;

const Itinerary = () => {
  const { editId } = useParams();
  const useState = React.useState;
  const useEffect = React.useEffect;
  const pictureRef = React.useRef([]);
  const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // 變更地點圖片
  const changePicture = async(data, i) => {
    // console.log(data, i)
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    // console.log(pictureRef.current[i].files[0]);
    const positions = JSON.parse(JSON.stringify(renderDay[targetDay - 1].position));
    let pictureData = new FormData();
    pictureData.append('image', pictureRef.current[i].files[0]);

    const updatePosition = async() => {
      await axios.patch(
        `https://twtravel-server.onrender.com/600/days/${renderDay[targetDay - 1].id}`,
        { position: positions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => {
          // console.log(res.data);
          renderDay[targetDay - 1].position = positions;
          setRenderDay([...renderDay]);
          setItineraryLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setItineraryLoading(false);
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

    // 上傳圖片到 Imgur
    // 在 Localhost 執行的話 index.html需加入 <meta name="referrer" content="no-referrer">
    let pictureUrl;
    setItineraryLoading(true);
    await axios
      .post('https://api.imgur.com/3/image', pictureData, {
        headers: {
          Authorization: 'Client-ID ' + '0361c3fa7d90333',
        },
        mimeType: 'multipart/form-data',
      })
      .then((res) => {
        // console.log(res.data.data.link)
        pictureUrl = res.data.data.link;
        positions.forEach(item => {
          if(item.id === data.id){
            item.picture = pictureUrl
          }
        })
        updatePosition();
      })
      .catch((err) => {
        // console.log(err)
        setItineraryLoading(false);
        Swal.fire({
          icon: 'error',
          title: '變更圖片失敗',
          background: '#F2F8F8',
          confirmButtonColor: '#dc3545',
          footer:
            '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>',
        });
      });
  }

  // 設定日期時間
  const [date, setDate] = useState(dayjs(new Date()));
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const handleDateClick = (e) => {
    setIsDateOpen((isDateOpen) => !isDateOpen);
    setAnchorEl(e.currentTarget);
  };
  const [time, setTime] = useState(new Date());
  const [isTimeOpen, setIsTimeOpen] = React.useState(false);
  const handleTimeClick = (e) => {
    setIsTimeOpen((isTimeOpen) => !isTimeOpen);
    setAnchorEl(e.currentTarget);
  };
  const [anchorEl, setAnchorEl] = React.useState(null);

  const onChangeDate = (newDate) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const changeDate = `${newDate.$y}-${(newDate.$M + 1).toString().padStart(2, '0')}-${newDate.$D.toString().padStart(2, '0')}`;
    setDate(newDate);

    axios.patch(
        `https://twtravel-server.onrender.com/600/itineraries/${editId}`,
        { startDate: changeDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        setRenderItinerary(res.data);
      })
      .catch((err) => {
        console.log(err);
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
  const onChangeTime = (newTime) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const todayId = renderDay[targetDay-1].id;
    const changeTime = `${(newTime.$H).toString().padStart(2, '0')}:${newTime.$m.toString().padStart(2, '0')}`;
    if(newTime.$H === time.$H && newTime.$m === time.$m){
      return
    }else{
      setTime(newTime);

      axios.patch(
          `https://twtravel-server.onrender.com/600/days/${todayId}`,
          { startTime: changeTime },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          // console.log(res.data);
          const newRender = [...renderDay];
          newRender[targetDay-1].startTime=changeTime
          setRenderDay(newRender);

        })
        .catch((err) => {
          // console.log(err);
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

  const changeStayTime = async(data, index) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    // console.log(data)
    await Swal.fire({
      title: '變更停留時間',
      html: `
        <h4 class='mb-3'>${data.name}</h4>
        <form id='timeValid' class="form-inline d-flex justify-content-center align-items-center mb-2 ms-2">
          <div class="form-group">
            <label for="hour" class='sr-only'>hour</label>
            <input id='hour' class='form-control' type="number" min='0' max='23' value='0'>
          </div>
          <p class='fs-5 mb-0 text-nowrap mx-1'>小時</p>
          <div class="form-group ms-1">
            <label for="minute" class='sr-only'>minute</label>
            <input id='minute' class='form-control' type="number" min='0' max='59' value='0'>
          </div>
          <p class='fs-5 mb-0 text-nowrap mx-1'>分鐘</p>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: '變更時間',
      cancelButtonText: '取消',
      background: '#F2F8F8',
      confirmButtonColor: '#5C9500',
      showLoaderOnConfirm: true,
      focusConfirm: false,
      preConfirm: async () => {
        const hour = parseInt(document.getElementById('hour').value);
        const minute = parseInt(document.getElementById('minute').value);
        // 判斷 hour minute 是否為數字
        if (isNaN(hour) || isNaN(minute)) {
          Swal.showValidationMessage(`格式不正確，請重新輸入`);
          document.getElementById('timeValid').reset();
        } else if (hour < 0 || minute < 0) {
          Swal.showValidationMessage(`請輸入正整數`);
          document.getElementById('timeValid').reset();
        } else if (hour * 60 + minute < 1) {
          Swal.showValidationMessage(`停留時間最少為1分鐘`);
          document.getElementById('timeValid').reset();
        } else {
          // return [hour, minute];
          data.stayTime = hour * 60 + minute;
          const today = { ...renderDay[targetDay - 1] };
          today.position[index].stayTime = data.stayTime;

          return await axios
            .patch(
              `https://twtravel-server.onrender.com/600/days/${today.id}`,
              {
                position: today.position,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              // console.log(res.data)
              // 更新 renderDay
              const newRender = [...renderDay];
              newRender[targetDay - 1] = today;
              setRenderDay(newRender);
              // 更新 stayTimes
              const newStayTimes = [...stayTimes];
              newStayTimes[index] = data.stayTime;
              setStayTimes(newStayTimes);
              return res.data;
            })
            .catch((err) => {
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
          // console.log(result)
          Swal.fire({
            icon: 'success',
            title: `成功變更停留時間`,
            text: data.name,
            background: '#F2F8F8',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,
          });
        }
      }
    });
  }

  const changeVehicle = async(target, firstData, secondData, i) => {
    // console.log(changeVehicleObj, target, firstData, secondData, i);
    // 自訂時間視窗
    if(target === 'custom'){
      await Swal.fire({
        title: '自訂通勤時間',
        html: `
          <h4 class='mb-3'>${firstData.name}</h4>
          <form id='timeValid' class="form-inline d-flex justify-content-center align-items-center mb-2 ms-2">
            <div class="form-group">
              <label for="hour" class='sr-only'>hour</label>
              <input id='hour' class='form-control' type="number" min='0' max='23' value='0'>
            </div>
            <p class='fs-5 mb-0 text-nowrap mx-1'>小時</p>
            <div class="form-group ms-1">
              <label for="minute" class='sr-only'>minute</label>
              <input id='minute' class='form-control' type="number" min='0' max='59' value='0'>
            </div>
            <p class='fs-5 mb-0 text-nowrap mx-1'>分鐘</p>
          </form>
        `,
        showCancelButton: true,
        confirmButtonText: '變更時間',
        cancelButtonText: '取消',
        background: '#F2F8F8',
        confirmButtonColor: '#5C9500',
        showLoaderOnConfirm: true,
        focusConfirm: false,
        preConfirm: () => {
          const hour = parseInt(document.getElementById('hour').value);
          const minute = parseInt(document.getElementById('minute').value);
          // 判斷 hour minute 是否為數字
          if (isNaN(hour) || isNaN(minute)) {
            Swal.showValidationMessage(`格式不正確，請重新輸入`);
            document.getElementById('timeValid').reset();
          } else if (hour < 0 || minute < 0) {
            Swal.showValidationMessage(`請輸入正整數`);
            document.getElementById('timeValid').reset();
          } else if (hour * 60 + minute < 1) {
            Swal.showValidationMessage(`時間最少為1分鐘`);
            document.getElementById('timeValid').reset();
          } else {
            // return [hour, minute];
            const customTime = hour * 60 + minute;
            const newTimesArray = [...changeRouteTimes];
            newTimesArray[i] = customTime;
            setChangeRouteTimes(newTimesArray);
            setChangeVehicleObj({
              ...changeVehicleObj,
              [firstData.id]: target,
            });
          }
        },
      });
      return
    }
    // 選到相同交通工具不執行
    const calculateTime = async(minute) => {
      if(minute){
        const newTimesArray = [...changeRouteTimes];
        newTimesArray[i] = minute;
        setChangeRouteTimes(newTimesArray);
        setChangeVehicleObj({...changeVehicleObj, [firstData.id]: target})
      }
      else{
        Swal.fire({
          toast: true,
          position: 'top-end',
          customClass: {
            container: 'mt-80',
          },
          icon: 'error',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          title: '無法計算時間！',
          text: '請選擇其他交通工具或自訂時間',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });
      }
    }
    const date = renderItinerary.startDate;
    const startTime = renderDay[targetDay - 1].startTime;
    // console.log(target, firstData, secondData, i, date, startTime);
    const time = (
      parseInt((
        [...stayTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return Number(acc) + Number(cur);
          }, parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])) +
        [0, ...driveTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return (Number(acc) + Number(cur));
          }))/60).toString().padStart(2, '0')
        +':'+(
        ([...stayTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return Number(acc) + Number(cur);
          }, parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])) +
        [0, ...driveTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return (Number(acc) + Number(cur));
          }))%60).toString().padStart(2, '0')
    )
    const MAP_API_KEY = 'o0Ej3PsJCAkZfp1e9GyxUu56E8oEHTyVbhh8aevKa7E';
    let routeTime;
    // 判斷是否為自訂時間
    const targetVehicle = target === 'car' ? 'driving' : target;
      setVehicleLoading(true);
      if(target !== 'scooter'){
        // 執行 Travel Time API
        await axios.post('https://api.traveltimeapp.com/v4/routes',
        {"locations": [
            {
              "id": "Home",
              "coords": {
                "lat": firstData.px,
                "lng": firstData.py
              }
            },
            {
              "id": "Office",
              "coords": {
                "lat": secondData.px,
                "lng": secondData.py
              }
            }
          ],
          "departure_searches": [
            {
              "id": "Daily Commute",
              "departure_location_id": "Office",
              "arrival_location_ids": ["Home"],
              "transportation": {
                "type": targetVehicle
              },
              "departure_time": `${date}T${time}:00+08:00`,
              "properties": ["route"]
            }
          ]
        },
        {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Application-Id': '2dc1e8f3',
          'X-Api-Key': 'f161ad683e5e92be1d63242d63136709'
          }
        })
          .then((res) => {
            let travelTimes = 0;
            // console.log(res.data.results[0].locations[0].properties[0].route.parts)
            const allData = (res.data?.results[0]?.locations[0]?.properties[0].route.parts);
            if(allData){
              allData.forEach((d) => { travelTimes += d.travel_time; })
            }
            // console.log(`${travelTimes}秒`);
            calculateTime(parseInt(travelTimes/60));
            setVehicleLoading(false);
          })
          .catch((err) => {
            // console.log(err);
            setVehicleLoading(false);
            Swal.fire({
              icon: 'error',
              title: '功能異常',
              background: '#F2F8F8',
              confirmButtonColor: '#dc3545',
              footer:
                '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>',
            });
          })
    }else{
      // 執行 Here Map API
      await axios.get(`https://router.hereapi.com/v8/routes?transportMode=${targetVehicle}&avoid[features]=controlledAccessHighway&origin=${firstData.px},${firstData.py}&destination=${secondData.px},${secondData.py}&departureTime=${date}T${time}:00+08:00&return=polyline,actions,instructions,summary&apikey=${MAP_API_KEY}`)
        .then((res) => {
          // console.log(res.data.routes[0].sections[0].summary.duration);
          calculateTime(parseInt(res.data?.routes[0]?.sections[0].summary.duration/60));
          setVehicleLoading(false);
        })
        .catch((err) => {
          // console.log(err);
          setVehicleLoading(false);
          Swal.fire({
            icon: 'error',
            title: '功能異常',
            background: '#F2F8F8',
            confirmButtonColor: '#dc3545',
            footer:
              '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>',
          });
        })
    }
  }


  const changePosition = (dayId, positions, data, index) =>{
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    // console.log(dayId, positions, data, index);

    const MAP_API_KEY = 'o0Ej3PsJCAkZfp1e9GyxUu56E8oEHTyVbhh8aevKa7E';
    Swal.fire({
      title: '變更地點',
      html: `
        <h4 class='mb-3'>${data.name}</h4>
        <form class="mb-2 mx-2">
          <div class="form-group text-start mb-3">
            <label for="position-changeTitle">名稱</label>
            <input type="text" class="form-control" id="position-changeTitle" placeholder="請輸入名稱">
          </div>
          <div class="form-group text-start">
            <label for="position-changeAddress">地址</label>
            <input type="text" class="form-control" id="position-changeAddress" placeholder="請輸入地址">
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: '變更地點',
      cancelButtonText: '取消',
      background: '#F2F8F8',
      confirmButtonColor: '#5C9500',
      showLoaderOnConfirm: true,
      focusConfirm: false,
      preConfirm: async () => {
        const title = document.getElementById('position-changeTitle').value;
        const address = document.getElementById('position-changeAddress').value;
        const encodeAddress = encodeURI(address);
        if(!title || !address){
          Swal.showValidationMessage(`欄位不得為空`);
        }else{
          let px;
          let py;
          await axios
            .get(
              `https://geocoder.ls.hereapi.com/6.2/geocode.json?searchtext=${encodeAddress}&gen=9&apiKey=${MAP_API_KEY}`
            )
              .then((res) => {
                if (!res.data.Response.View[0]?.Result[0]){
                  Swal.showValidationMessage(`找不到地址，請重新輸入`);
                }else if(res.data.Response.View[0]?.Result[0].Location.Address.Country !== 'TWN'){
                  Swal.showValidationMessage(`地址僅限台灣地區`);
                }else{
                  px = res.data.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude;
                  py = res.data.Response.View[0].Result[0].Location.NavigationPosition[0].Longitude;
                }
              })
              .catch((err) => {
                console.log(err);
              });

          if(px && py){
            // 變更位置資料
            const newData = {...data}
            newData.name = title;
            newData.picture = '';
            newData.address = address
            newData.px = px;
            newData.py = py;
            newData.vehicle = 59;
            newData.avoidHighway = false;
            const newPositions = positions.map(item => item.id === newData.id ? item = newData : item)
            // 判斷 index 是否為 0，改變上一個位置的交通工具顯示
            let prevPositionIndex = -1;
            if(index > 0) {
              newPositions.forEach((item, i) => {if(item.id === newData.id){prevPositionIndex = i-1}})
              newPositions[prevPositionIndex].vehicle = 59;
              newPositions[prevPositionIndex].avoidHighway = false;
            }
            return await axios
              .patch(`https://twtravel-server.onrender.com/600/days/${dayId}`, {
                "position": newPositions
              },{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(res => {
                  // console.log(res)
                  renderDay.forEach(item => item.id === dayId ? item.position = newPositions : null)
                  // 判斷是否為當天第一筆位置，不是則將上筆位置的車程一起設定為 59 分鐘
                  const newVehicles = {...vehicle}
                  newVehicles[newData.id] = { vehicle: 59, avoidHighway: false };
                  if(prevPositionIndex >= 0){
                    newVehicles[newPositions[prevPositionIndex].id] = { vehicle: 59, avoidHighway: false };
                  }
                  setVehicle(newVehicles)
                  // vehicleObj(交通工具區塊) 將目前位置 id 改變為 custom
                  const newChangeVehicle = {...changeVehicleObj}
                  newChangeVehicle[newData.id] = 'custom'
                  if(prevPositionIndex >= 0){
                    newChangeVehicle[newPositions[prevPositionIndex].id] = 'custom'
                  }
                  setChangeVehicleObj(newChangeVehicle);
                  // 將選擇交通工具區塊時間改變為 59 分鐘，有上筆資料便一起變更
                  const newRouteTimes = [...changeRouteTimes];
                  if(index > 0){
                    newRouteTimes[index - 1] = 59
                  }
                  // 最後一筆資料不匯入陣列
                  if(index < changeRouteTimes.length){
                    newRouteTimes[index] = 59
                  }
                  setChangeRouteTimes(newRouteTimes)
                  // 變更 driveTimes(每筆路程時間顯示區)的陣列時間，有上筆資料便一起變更
                  const newDriveTimes = [...driveTimes];
                  if (index > 0) {
                    newDriveTimes[index - 1] = 59;
                  }
                  // 最後一筆資料不匯入陣列
                  if(index < driveTimes.length){
                    newDriveTimes[index] = 59
                  }
                  setDriveTimes(newDriveTimes)
                  // 變更成功就收闔編輯按鈕
                  setCardButtons({...cardButtons, [newData.id]:{ edit: false, vehicle: false }})
                  mapRef.current.setView([px, py])
                  return res.data.position[index]
                })
                .catch(err => {
                  return err;
                })
          }
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
          // console.log(result)
          Swal.fire({
            icon: 'success',
            title: `成功變更地點`,
            text: result.value.name,
            background: '#F2F8F8',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,
          });
        }
      }
    });
  }

  const deletePosition = (dayId, positions, data, index) => {
    // console.log(dayId, positions, data, index);
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;

    Swal.fire({
      icon: 'question',
      title: '刪除地點',
      text: data.name,
      showCancelButton: true,
      confirmButtonText: '確認刪除',
      cancelButtonText: '離開',
      background: '#F2F8F8',
      confirmButtonColor: '#dc3545',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const name = data.name;

        let prevPositionIndex = -1;
        positions.forEach((item, i) => {if(item.id === data.id){prevPositionIndex = i-1}})
        // 刪除位置資料
        const newPositions = positions.filter((item) => item.id !== data.id);
        // 判斷 index 是否為 0，改變上一個位置的交通工具顯示
        if(index > 0) {
          newPositions[prevPositionIndex].vehicle = 59;
          newPositions[prevPositionIndex].avoidHighway = false;
        }

        return await axios
          .patch(`https://twtravel-server.onrender.com/600/days/${dayId}`, {
            "position": newPositions
          },{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(res => {
              // console.log(res)
              renderDay.forEach(item => item.id === dayId ? item.position = newPositions : null)
              // 刪除並判斷是否為當天第一筆位置，不是則將上筆位置的車程設定為 59 分鐘
              const newVehicles = {...vehicle}
              delete newVehicles[data.id];
              if(prevPositionIndex >= 0){
                newVehicles[newPositions[prevPositionIndex].id] = { vehicle: 59, avoidHighway: false };
              }
              setVehicle(newVehicles)
              // 刪除 vehicleObj(交通工具區塊)，並判斷是否為當天第一筆位置，不是則將上筆資料改變為 custom
              const newChangeVehicle = {...changeVehicleObj}
              delete newChangeVehicle[data.id];
              if(prevPositionIndex >= 0){
                newChangeVehicle[newPositions[prevPositionIndex].id] = 'custom'
              }
              setChangeVehicleObj(newChangeVehicle);
              // 將選擇交通工具區塊時間改變為 59 分鐘，有上筆資料便一起變更
              const newRouteTimes = [...changeRouteTimes];
              if(index > 0){
                newRouteTimes[index - 1] = 59
              }
              // 刪除陣列資料，最後一筆資料不變更陣列
              if(index < changeRouteTimes.length){
                newRouteTimes.splice(index, 1);
              }
              setChangeRouteTimes(newRouteTimes)
              // 變更 driveTimes(每筆路程時間顯示區)的陣列時間，有上筆資料便一起變更
              const newDriveTimes = [...driveTimes];
              if (index > 0) {
                newDriveTimes[index - 1] = 59;
              }
              // 刪除陣列資料，最後一筆資料不變更陣列
              if(index < driveTimes.length){
                newDriveTimes.splice(index, 1);
              }
              setDriveTimes(newDriveTimes);
              // 刪除 stayTimes 陣列資料
              const newStayTimes = [...stayTimes];
              newStayTimes.splice(index, 1);
              setStayTimes(newStayTimes);

              return name
            })
            .catch(err => {
              return err;
            })
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
          // console.log(result)
          Swal.fire({
            icon: 'success',
            title: `成功刪除地點`,
            text: result.value,
            background: '#F2F8F8',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,
          });
        }
      }
    });
  };

  const addPosition = (target, data) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const today = renderDay[targetDay - 1];
    // dayId, positions, data, index;
    // console.log(today.id, today.position, data, today.position.length)
    Swal.fire({
      title: '新增地點',
      text: data.name,
      showCancelButton: true,
      confirmButtonText: '確定新增',
      cancelButtonText: '取消',
      background: '#F2F8F8',
      confirmButtonColor: '#5C9500',
      showLoaderOnConfirm: true,
      preConfirm: async() => {
        // console.log(target,data)
        const newData = {...data}
        let prevPosition = -1;
        if (today.position.length > 0){
          prevPosition = today.position[today.position.length - 1];
        }
        // 尋找最後一個 Id 的 position
        let lastId = 0;
        if(today.position.length > 0){
          const lastIdPosition = today.position.reduce((acc, cur) => acc.id < cur.id ? cur : acc)
          lastId = lastIdPosition.id
        }
        if (target === 'search') {
          delete newData.district;
          newData.id = lastId + 1;
          newData.sort = prevPosition < 0 ? 1 : prevPosition.sort + 1;
          newData.stayTime = 59;
          newData.vehicle = 59;
          newData.avoidHighway = false;
        }else if (target === 'favorite'){
          delete newData.userId;
          delete newData.city;
          delete newData.positionId;
          newData.id = lastId + 1;
          newData.sort = prevPosition < 0 ? 1 : prevPosition.sort + 1;
          newData.stayTime = 59;
          newData.vehicle = 59;
          newData.avoidHighway = false;
        }else if (target === 'custom'){
          newData.id = lastId + 1;
          newData.sort = prevPosition < 0 ? 1 : prevPosition.sort + 1;
          newData.stayTime = 59;
          newData.vehicle = 59;
          newData.avoidHighway = false;
        }
        const newPositions = [...today.position]
        newPositions.push(newData)
        return await axios
          .patch(`https://twtravel-server.onrender.com/600/days/${today.id}`, {
            position: newPositions
          },{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => {
              // 過濾多於資料
              const newRenderData = {};
              Object.entries(res.data).filter(item => {
                if(item[0] !== 'itineraryId' && item[0] !== 'userId'){
                  newRenderData[item[0]] = item[1]
                }
              })
              // console.log(newRenderData)
              // 新增的資料
              const positionData = newPositions[newPositions.length-1]
              // 新增渲染地點資料
              const newRenderDay = renderDay.map(item => item.id === today.id ? item = newRenderData : item)
              setRenderDay(newRenderDay)
              // 將新增的車程設定為 59 分鐘
              const newVehicles = {...vehicle}
              newVehicles[positionData.id] = { vehicle: 59, avoidHighway: false };
              setVehicle(newVehicles)
              // 新增 vehicleObj(交通工具區塊)為 custom
              const newChangeVehicle = {...changeVehicleObj}
              newChangeVehicle[positionData.id] = 'custom';
              setChangeVehicleObj(newChangeVehicle);
              // 新增交通工具區塊時間為 59 分鐘
              const newRouteTimes = [...changeRouteTimes];
              newRouteTimes.push(positionData.vehicle)
              setChangeRouteTimes(newRouteTimes)
              // 新增 driveTimes(每筆路程時間顯示區)的陣列時間
              const newDriveTimes = [...driveTimes];
              newDriveTimes.push(positionData.vehicle)
              setDriveTimes(newDriveTimes);
              // 新增 stayTimes 陣列資料
              const newStayTimes = [...stayTimes];
              newStayTimes.push(positionData.stayTime);
              setStayTimes(newStayTimes);
              // 收闔編輯按鈕
              setCardButtons({...cardButtons, [positionData.id]:{ edit: false, vehicle: false }})
              mapRef.current.setView([positionData.px, positionData.py]);
              setAddPositionWindow('')
              return positionData
            })
            .catch((err) => {
              return err
            })
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
            // console.log(result)
            Swal.fire({
              icon: 'success',
              title: `新增成功`,
              text: result.value.name,
              background: '#F2F8F8',
              showConfirmButton: false,
              allowOutsideClick: false,
              timer: 2000,
            });
          }
        }
      });
  }

  // 拖曳 Positions 重新排序
  const onDragPosition = async(event) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;

    // console.log(event);
    const { source, destination } = event;
    // 如果 destination 位置不正確或是位置和 source 相同就不執行
    if (!destination || source.index === destination.index) {
      return;
    }

    // 複製 targetDay 的 position
    const newPositions = JSON.parse(JSON.stringify(renderDay[targetDay-1].position));
    // 從 source.index 剪下被拖曳的元素
    const [remove] = newPositions.splice(source.index, 1);
    //在 destination.index 位置貼上被拖曳的元素
    newPositions.splice(destination.index, 0, remove);
    // 變更 position 的 sort
    newPositions.map((item, i) => item.sort = i+1)
    // 變更 newPosition 的 vehicle
    newPositions[destination.index].vehicle = 59;
    newPositions[destination.index].avoidHighway = false;
    if(destination.index > 0){
      newPositions[destination.index-1].vehicle = 59;
      newPositions[destination.index - 1].avoidHighway = false;
    }
    // 如果 source 大於 destination.index，就將 source vehicle 設定為 59 分鐘
    if(source.index > destination.index){
      newPositions[source.index].vehicle = 59;
      newPositions[source.index].avoidHighway = false;
    }
    // 如果 source.index 小於 destination.index 並且 source.index 索引值大於 0，就將 source.index 上一筆 vehicle 設定為 59 分鐘
    if(source.index < destination.index && source.index > 0){
      newPositions[source.index-1].vehicle = 59;
      newPositions[source.index - 1].avoidHighway = false;
    }
    // console.log(newPositions)

    setItineraryLoading(true);
    await axios
      .patch(`https://twtravel-server.onrender.com/600/days/${renderDay[targetDay-1].id}`, {
        "position": newPositions
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          // console.log(res)
          renderDay.forEach((item, i) => targetDay == i+1 ? item.position = newPositions : null)
          // 判斷 destination 是否為第一筆位置，不是則將上筆位置的車程一起設定為 59 分鐘
          const newVehicles = {...vehicle}
          newVehicles[newPositions[destination.index].id] = { vehicle: 59, avoidHighway: false };
          if(destination.index > 0){
            newVehicles[newPositions[destination.index-1].id] = { vehicle: 59, avoidHighway: false };
          }
          // 如果 source 大於 destination.index，就將 source 索引位置車程設定為 59 分鐘
          if(source.index > destination.index){
            newVehicles[newPositions[source.index].id] = { vehicle: 59, avoidHighway: false };
          }
          // 如果 source.index 小於 destination.index 並且 source.index 索引值大於 0，就將 source.index 索引位置上一筆車程設定為 59 分鐘
          if(source.index < destination.index && source.index > 0){
            newVehicles[newPositions[source.index-1].id] = { vehicle: 59, avoidHighway: false };
          }
          setVehicle(newVehicles)
          // vehicleObj(交通工具區塊) 將目前位置 id 改變為 custom
          const newChangeVehicle = {...changeVehicleObj}
          newChangeVehicle[newPositions[destination.index].id] = 'custom';
          if (destination.index > 0) {
            newChangeVehicle[newPositions[destination.index - 1].id] = 'custom';
          }
          if(source.index > destination.index){
            newChangeVehicle[newPositions[source.index].id] = 'custom';
          }
          if(source.index < destination.index && source.index > 0){
            newChangeVehicle[newPositions[source.index-1].id] = 'custom';
          }
          setChangeVehicleObj(newChangeVehicle);
          // driveTimes、routeTimes 重跑陣列排序
          const newDriveTimes = [];
          const newRouteTimes = [];
          let startIndex;
          let endIndex;
          if(destination.index > source.index){
            startIndex = source.index;
            endIndex = destination.index;
          }else{
            startIndex = destination.index;
            endIndex = source.index;
          }
          driveTimes.forEach((item, i) => {
            if (i >= startIndex && i <= endIndex) {
              if (destination.index > source.index && i != source.index) {
                if (i > 0) {
                  newDriveTimes[i - 1] = item;
                  newRouteTimes[i-1] = item;
                }
              } else {
                newDriveTimes[i + 1] = item;
                newRouteTimes[i + 1] = item;
              }
            } else {
              newDriveTimes[i] = item;
              newRouteTimes[i] = item;
            }
          });
          // 將選擇交通工具區塊時間改變為 59 分鐘
          newRouteTimes[destination.index] = 59
          if (destination.index > 0) {
            newRouteTimes[destination.index - 1] = 59;
          }
          if (source.index > destination.index) {
            newRouteTimes[source.index] = 59;
          }
          if (source.index < destination.index && source.index > 0) {
            newRouteTimes[source.index - 1] = 59;
          }
          // 最後一筆資料不匯入陣列
          if(newRouteTimes.length > changeRouteTimes.length){
            newRouteTimes.pop();
          }
          setChangeRouteTimes(newRouteTimes)
          // 變更 driveTimes(每筆路程時間顯示區)的陣列時間
          newDriveTimes[destination.index] = 59;
          if (destination.index > 0) {
            newDriveTimes[destination.index - 1] = 59;
          }
          if (source.index > destination.index) {
            newDriveTimes[source.index] = 59;
          }
          if (source.index < destination.index && source.index > 0) {
            newDriveTimes[source.index - 1] = 59;
          }
          // 最後一筆資料不匯入陣列
          if (newDriveTimes.length > driveTimes.length) {
            newDriveTimes.pop();
          }
          setDriveTimes(newDriveTimes)
          // 變更 stayTimes 的陣列時間
          const newStayTimes = [];
          newPositions.forEach(item => newStayTimes.push(item.stayTime))
          setStayTimes(newStayTimes);
          // 變更地圖顯示位置
          mapRef.current.setView([
            newPositions[destination.index].px,
            newPositions[destination.index].py
          ]);
          setItineraryLoading(false);
        })
        .catch(err => {
          setItineraryLoading(false);
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
        })

  };

  const [renderItinerary, setRenderItinerary] = useState({ name: 'unknown' });
  const [renderDay, setRenderDay] = useState([]);
  const [targetDay, setTargetDay] = useState(1);
  // 停留跟行駛時間換算分鐘
  const [stayTimes, setStayTimes] = useState([0]);
  const [driveTimes, setDriveTimes] = useState([0]);
  // 變更交通工具時顯示時間
  const [changeRouteTimes, setChangeRouteTimes] = useState([]);
  // 顯示監視器
  const [camera, setCamera] = useState(faEyeSlash);
  // 新增地點視窗
  const [addPositionWindow, setAddPositionWindow] = useState('');

  // Card 按鈕開關
  const [cardButtons, setCardButtons] = useState({
    1: { edit: false, vehicle: false }
  });

  const handleChangeVehicle = (id, index) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    // console.log(id, changeVehicleObj, renderDay[targetDay-1], index, driveTimes, changeRouteTimes)
    // 深拷貝 positions
    const positions = JSON.parse(JSON.stringify(renderDay[targetDay - 1].position));
    let newVehicle = changeVehicleObj[id];
    positions.forEach(item => {
      if(item.id === id){
        if (newVehicle === 'custom') {
          newVehicle = changeRouteTimes[index];
        }
        item.vehicle = newVehicle;
        if(newVehicle !== 'car'){
          item.avoidHighway = false;
        }
      }
    })

    setVehicleLoading(true);
    axios.patch(
      `https://twtravel-server.onrender.com/600/days/${renderDay[targetDay - 1].id}`,
      { position: positions },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        // console.log(res.data);
        renderDay[targetDay - 1].position = positions;
        setRenderDay([...renderDay]);
        setVehicle({ ...vehicle, [id]: { vehicle: newVehicle, avoidHighway: false } });
        setDriveTimes([...changeRouteTimes]);
        setCardButtons({...cardButtons, [id]:{edit: cardButtons[id].edit ,vehicle: false}})
        setVehicleLoading(false);
      })
      .catch((err) => {
        // console.log(err);
        setVehicleLoading(false);
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

  const [highwayLoader, setHighwayLoader] = useState(false);
  const changeHighwayRadio = async(id, i) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const MAP_API_KEY = 'o0Ej3PsJCAkZfp1e9GyxUu56E8oEHTyVbhh8aevKa7E';

    const positions = JSON.parse(JSON.stringify(renderDay[targetDay - 1].position));
    positions.forEach(item => {
      if(item.id === id){
        item.avoidHighway = !item.avoidHighway
      }
    })

    const date = renderItinerary.startDate;
    const startTime = renderDay[targetDay - 1].startTime;
    // console.log(target, firstData, secondData, i, date, startTime);
    const time = (
      parseInt((
        [...stayTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return Number(acc) + Number(cur);
          }, parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])) +
        [0, ...driveTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return (Number(acc) + Number(cur));
          }))/60).toString().padStart(2, '0')
        +':'+(
        ([...stayTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return Number(acc) + Number(cur);
          }, parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])) +
        [0, ...driveTimes]
          .filter((data, index) => index <= i)
          .reduce((acc, cur) => {
            return (Number(acc) + Number(cur));
          }))%60).toString().padStart(2, '0')
    )

    let timeStamp;
    setHighwayLoader(true);
    const changeRadio = async() => {
      await axios.patch(
        `https://twtravel-server.onrender.com/600/days/${renderDay[targetDay - 1].id}`,
        { position: positions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => {
          // console.log(res.data);
          renderDay[targetDay - 1].position = positions;
          setRenderDay([...renderDay]);
          setVehicle({ ...vehicle, [id]: { vehicle: vehicle[id].vehicle, avoidHighway: !vehicle[id].avoidHighway }});
          const newDriveTimes = [...driveTimes]
          newDriveTimes[i] = timeStamp;
          setDriveTimes(newDriveTimes);
          setHighwayLoader(false);
        })
        .catch((err) => {
          // console.log(err);
          setHighwayLoader(false)
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

    if(vehicle[id].avoidHighway === true){
      // 執行 Travel Time API
      await axios.post('https://api.traveltimeapp.com/v4/routes',
      {"locations": [
          {
            "id": "Home",
            "coords": {
              "lat": positions[i].px,
              "lng": positions[i].py
            }
          },
          {
            "id": "Office",
            "coords": {
              "lat": positions[i+1].px,
              "lng": positions[i+1].py
            }
          }
        ],
        "departure_searches": [
          {
            "id": "Daily Commute",
            "departure_location_id": "Office",
            "arrival_location_ids": ["Home"],
            "transportation": {
              "type": "driving"
            },
            "departure_time": `${date}T${time}:00+08:00`,
            "properties": ["route"]
          }
        ]
      },
      {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Application-Id': '2dc1e8f3',
        'X-Api-Key': 'f161ad683e5e92be1d63242d63136709'
        }
      })
        .then((res) => {
          let travelTimes = 0;
          // console.log(res.data.results[0].locations[0].properties[0].route.parts)
          const allData = (res.data.results[0].locations[0].properties[0].route.parts);
          allData.forEach((d) => { travelTimes += d.travel_time; })
          // console.log(`${travelTimes}秒`);
          timeStamp = parseInt(travelTimes / 60);
          changeRadio();
        })
        .catch((err) => {
          // console.log(err);
          Swal.fire({
            icon: 'error',
            title: '功能異常',
            background: '#F2F8F8',
            confirmButtonColor: '#dc3545',
            footer:
              '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>',
          });
        })
    }else{
      // 執行 Here Map API
      await axios.get(`https://router.hereapi.com/v8/routes?transportMode=car&avoid[features]=controlledAccessHighway&origin=${positions[i].px},${positions[i].py}&destination=${positions[i+1].px},${positions[i+1].py}&departureTime=${date}T${time}:00+08:00&return=polyline,actions,instructions,summary&apikey=${MAP_API_KEY}`)
        .then((res) => {
          // console.log(res.data.routes[0].sections[0].summary.duration/60);
          timeStamp = parseInt(res.data.routes[0].sections[0].summary.duration / 60);
          changeRadio();
        })
        .catch((err) => {
          // console.log(err);
          Swal.fire({
            icon: 'error',
            title: '功能異常',
            background: '#F2F8F8',
            confirmButtonColor: '#dc3545',
            footer:
              '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>',
          });
        })
    }
  }

  // Card 交通工具選擇
  const [vehicle, setVehicle] = useState({
    1: { vehicle: 'car', avoidHighway: false }
  });
  // 變更交通工具顯示
  const [changeVehicleObj, setChangeVehicleObj] = useState({});

  // Map data
  const mapRef = React.useRef();
  const positionIcon = new L.Icon({
    iconUrl:
    'https://icons.iconarchive.com/icons/icons-land/vista-map-markers/256/Map-Marker-Bubble-Pink-icon.png',
    iconAnchor: [25, 50],
    popupAnchor: [0, -43],
    iconSize: [50, 50],
  });
  const handleOnFlyTo = (location) => {
    // console.log(location)
    mapRef.current.flyTo(location, 15, {
      duration: 2,
    });
  }

  // City data
  const [selectCity, setSelectCity] = useState({ label: '臺北市',  value: '臺北市' });
  const [selectDistrict, setSelectDistrict] = useState({ label: '松山區', value: '松山區' });
  const [speedCameras, setSpeedCameras] = useState([]);
  const districtOptions = [];
  districts(selectCity.value).map((d) => districtOptions.push({label: d,value: d}));
  const cityChange = (obj) => {
    setSelectCity(obj);
    setSelectDistrict({  label: districts(obj.value)[0],  value: districts(obj.value)[0] });
  }
  const districtChange = (obj) => {
    // console.log(obj);
    setSelectDistrict(obj)
  }

  // 計算通勤時間，匯入當天全部位置、當天資料、日期資料
  const calculateTime = async(positions, firstDay, date) => {
    const driveArray = []
    const MAP_API_KEY = 'o0Ej3PsJCAkZfp1e9GyxUu56E8oEHTyVbhh8aevKa7E';
    let time = firstDay.startTime
    let timeStamp = firstDay.startTime.split(':')[0]*60 + firstDay.startTime.split(':')[1]*1
    // console.log(firstDay);
    for(let i=0; i<positions.length-1; i++){
      // console.log(positions[i],positions[i+1])
      timeStamp += firstDay.position[i].stayTime
      time = parseInt(timeStamp/60).toString().padStart(2, '0') +':'+ (timeStamp%60).toString().padStart(2, '0')
      // console.log(time);
      // 判斷是否為自訂時間
      if(typeof firstDay.position[i].vehicle === 'number'){
        driveArray.push(firstDay.position[i].vehicle);
      }else if(firstDay.position[i].vehicle !== 'scooter' && firstDay.position[i].avoidHighway === false){
         // 執行 Travel Time API
        const vehicle = firstDay.position[i].vehicle === 'car' ? 'driving': firstDay.position[i].vehicle;
        setItineraryLoading(true);
        await axios.post('https://api.traveltimeapp.com/v4/routes',
        {"locations": [
            {
              "id": "Home",
              "coords": {
                "lat": positions[i][0],
                "lng": positions[i][1]
              }
            },
            {
              "id": "Office",
              "coords": {
                "lat": positions[i+1][0],
                "lng": positions[i+1][1]
              }
            }
          ],
          "departure_searches": [
            {
              "id": "Daily Commute",
              "departure_location_id": "Office",
              "arrival_location_ids": ["Home"],
              "transportation": {
                "type": vehicle
              },
              "departure_time": `${date}T${time}:00+08:00`,
              "properties": ["route"]
            }
          ]
        },
        {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Application-Id': '2dc1e8f3',
          'X-Api-Key': 'f161ad683e5e92be1d63242d63136709'
          }
        })
          .then((res) => {
            let travelTimes = 0;
            // console.log(res.data.results[0].locations[0].properties[0].route.parts)
            const allData = (res.data.results[0].locations[0].properties[0].route.parts);
            allData.forEach((d) => { travelTimes += d.travel_time; })
            // console.log(`${travelTimes}秒`);
            timeStamp += parseInt(travelTimes / 60);
            driveArray.push(parseInt(travelTimes/60));
            setItineraryLoading(false)
          })
          .catch((err) => {
            console.log(err);
            setItineraryLoading(false)
          })
      }else{
        // 執行 Here Map API
        setItineraryLoading(true);
        await axios.get(`https://router.hereapi.com/v8/routes?transportMode=${firstDay.position[i].vehicle}&avoid[features]=controlledAccessHighway&origin=${positions[i][0]},${positions[i][1]}&destination=${positions[i+1][0]},${positions[i+1][1]}&departureTime=${date}T${time}:00+08:00&return=polyline,actions,instructions,summary&apikey=${MAP_API_KEY}`)
          .then((res) => {
            // console.log(res.data.routes[0].sections[0].summary);
            timeStamp += parseInt(res.data.routes[0].sections[0].summary.duration/60);
            driveArray.push(parseInt(res.data.routes[0].sections[0].summary.duration/60))
            setItineraryLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setItineraryLoading(false);
          })
      }
    }
    // console.log(driveArray);
    setDriveTimes(driveArray);
    setChangeRouteTimes(driveArray);
  }

  // 變更名稱
  const changeName = async() => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    // console.log(data)
    await Swal.fire({
      title: '變更行程名稱',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: '變更名稱',
      cancelButtonText: '取消',
      background: '#F2F8F8',
      confirmButtonColor: '#5C9500',
      showLoaderOnConfirm: true,
      focusConfirm: false,
      preConfirm: async (name) => {
        if (name.length > 16) {
          Swal.showValidationMessage(`最多可輸入16個字`);
        } else {
          return await axios
            .patch(
              `https://twtravel-server.onrender.com/600/itineraries/${editId}`,
              {
                name: name,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              // console.log(res.data)
              setRenderItinerary({...renderItinerary, name: res.data.name})
              return res.data.name
            })
            .catch((err) => {
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
          // console.log(result)
          Swal.fire({
            icon: 'success',
            title: `成功變更行程名稱`,
            text: result.value,
            background: '#F2F8F8',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,
          });
        }
      }
    });
  }

  const addDay = () => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    const userId = JSON.parse(localStorage.getItem('localUserData')).user.id;

    setDayLoading(true);
    axios.post(
      `https://twtravel-server.onrender.com/600/days`,{
        "userId": userId,
        "sort": renderDay[renderDay.length-1].sort+1,
        "startTime": "08:00",
        "position": [],
        "itineraryId": editId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(res => {
        // console.log(res)
        const newObj = {};
        Object.entries(res.data).forEach(item => {
          if (item[0] !== 'itineraryId' && item[0] !== 'userId') {
            newObj[item[0]] = item[1];
          }
        })
        setRenderDay([...renderDay, newObj])
        setDayLoading(false);
      })
      .catch(err => {
        // console.log(err);
        setDayLoading(false);
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

  const deleteDay = (id, day) => {
    // console.log(id, day);
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;

    Swal.fire({
      icon: 'question',
      title: '刪除當天行程',
      text: `第${day}天`,
      showCancelButton: true,
      confirmButtonText: '確認刪除',
      cancelButtonText: '離開',
      background: '#F2F8F8',
      confirmButtonColor: '#dc3545',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const today = renderItinerary.startDate;
        // 判斷總天數是否只有 1 天
        if(renderDay.length == 1){
          return await axios
            .patch(`https://twtravel-server.onrender.com/600/days/${id}`, {
              "startTime": "08:00",
              "position": [],
            },{
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(res => {
                setTime(dayjs(new Date(`${today} "08:00`)));
                setCardButtons({});
                setVehicle({});
                setChangeVehicleObj({});
                setChangeRouteTimes([])
                setStayTimes([]);
                setDriveTimes([]);
                setRenderDay([{
                  id: res.data.id,
                  sort: res.data.sort,
                  startTime: "08:00",
                  position: []
                }])
                return res.data
              })
              .catch(err => {
                return err
              })
        }else{
          return await axios
            .delete(`https://twtravel-server.onrender.com/600/days/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(res => {
                // console.log(res)
                // console.log(renderDay.length)
                const newDays = [...renderDay]
                if(day == renderDay.length){
                  // 刪除最後一天則執行 changeDay function
                  changeDay(day-1)
                  newDays.splice(day-1, 1)
                  setRenderDay(newDays)
                }else{
                  newDays.splice(day-1, 1)
                  // 設定當天出發時間
                  setTime(dayjs(new Date(`${today} ${newDays[day-1].startTime}`)));
                  // 設定 map 畫面
                  if(newDays[day-1].position.length > 0){
                    mapRef.current.setView([newDays[day-1].position[0].px, newDays[day-1].position[0].py])
                  }
                  // card button 匯入當天排序後資料
                  const buttonObj = {};
                  newDays[day-1].position.forEach(item => buttonObj[item.id] = { edit: false, vehicle: false })
                  setCardButtons(buttonObj);
                  // 交通工具 匯入當天排序後資料
                  const vehicleObj = {};
                  const changeVehicle = {};
                  newDays[day-1].position.forEach(item => {
                    vehicleObj[item.id] = { vehicle: item.vehicle, avoidHighway: item.avoidHighway }
                    changeVehicle[item.id] = typeof item.vehicle === 'number' ? 'custom' : item.vehicle;
                  })
                  // console.log(vehicleObj);
                  setVehicle(vehicleObj);
                  // 變更交通工具畫面
                  // console.log(changeVehicle);
                  setChangeVehicleObj(changeVehicle);

                  // 算出當天的 driveTime 放入 hook
                  const positions = [];
                  newDays[day-1].position.forEach(item => positions.push([item.px, item.py]))
                  calculateTime(positions, newDays[day-1], today);
                  // 找出當天的 stayTime 放入 hook
                  const stayArray = [];
                  newDays[day-1].position.forEach(item => stayArray.push(item.stayTime))
                  setStayTimes(stayArray)

                  setRenderDay(newDays)
                }
                return res
              })
              .catch(err => {
                return err;
              })
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
          // console.log(result)
          Swal.fire({
            icon: 'success',
            title: `成功刪除當天行程`,
            background: '#F2F8F8',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,
          });
        }
      }
    });
  }

  // 切換 Day 畫面
  const changeDay = (day) => {
    // 變更時間畫面如果有打開就關閉
    setIsTimeOpen(false)
    // 設定當天日期
    // const firstDate = new Date(renderItinerary.startDate);
    // const newDate = new Date(firstDate.setDate(firstDate.getDate()+(day-1)));
    // const dateOfMonth = (newDate.getMonth()+1).toString().padStart(2, '0');
    // const dateOfDay = (newDate.getDate()).toString().padStart(2, '0');
    // const today = `${newDate.getFullYear()}-${dateOfMonth}-${dateOfDay}`;
    // setDate(new Date(today));
    const today = renderItinerary.startDate;
    // 設定當天出發時間
    setTargetDay(day)
    setTime(dayjs(new Date(`${today} ${renderDay[day-1].startTime}`)));
    // 設定 map 畫面
    if(renderDay[day-1].position.length > 0){
      mapRef.current.setView([renderDay[day-1].position[0].px, renderDay[day-1].position[0].py])
    }
    // card button 匯入當天排序後資料
    const buttonObj = {};
    renderDay[day-1].position.forEach(item => buttonObj[item.id] = { edit: false, vehicle: false })
    setCardButtons(buttonObj);
    // 交通工具 匯入當天排序後資料
    const vehicleObj = {};
    const changeVehicle = {};
    renderDay[day-1].position.forEach(item => {
      vehicleObj[item.id] = { vehicle: item.vehicle, avoidHighway: item.avoidHighway }
      changeVehicle[item.id] = typeof item.vehicle === 'number' ? 'custom' : item.vehicle;
    })
    // console.log(vehicleObj);
    setVehicle(vehicleObj);
    // 變更交通工具畫面
    // console.log(changeVehicle);
    setChangeVehicleObj(changeVehicle);

    // 算出當天的 driveTime 放入 hook
    const positions = [];
    renderDay[day-1].position.forEach(item => positions.push([item.px, item.py]))
    calculateTime(positions, renderDay[day-1], today);
    // 找出當天的 stayTime 放入 hook
    const stayArray = [];
    renderDay[day-1].position.forEach(item => stayArray.push(item.stayTime))
    setStayTimes(stayArray)
  }

  // 拖曳 Days 重新排序
  const onDragDay = async(event) => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;

    // console.log(event);
    const { source, destination } = event;
    // 如果 destination 位置不正確或是位置和 source 相同就不執行
    if (!destination || source.index === destination.index) {
      return;
    }

    // 複製 renderDay
    const newRenderDay = JSON.parse(JSON.stringify(renderDay));
    // 從 source.index 剪下被拖曳的元素
    const [remove] = newRenderDay.splice(source.index, 1);
    //在 destination.index 位置貼上被拖曳的元素
    newRenderDay.splice(destination.index, 0, remove);
    // console.log(newRenderDay)

    // 重新排序後的第一筆 index
    const startSortIndex = source.index < destination.index ? source.index : destination.index;
    let sortNum = startSortIndex>0 ? newRenderDay[startSortIndex-1].sort+1 : 1;
    // 變更資料庫 days 排序
    setDayLoading(true);
    for(let i=startSortIndex; i<newRenderDay.length; i++){
      newRenderDay[i].sort = sortNum;
      await axios
        .patch(
          `https://twtravel-server.onrender.com/600/days/${newRenderDay[i].id}`,
          { sort: sortNum },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          // console.log(res.data);
          sortNum++;
        })
        .catch((err) => {
          // console.log(err);
          setDayLoading(false)
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
          return
        });
      setDayLoading(false);
    }

    const today = renderItinerary.startDate;
    // 設定當天出發時間
    const day = targetDay
    setTime(dayjs(new Date(`${today} ${newRenderDay[day-1].startTime}`)));
    // 設定 map 畫面
    if(newRenderDay[day-1].position.length > 0){
      mapRef.current.setView([newRenderDay[day-1].position[0].px, newRenderDay[day-1].position[0].py])
    }
    // card button 匯入當天排序後資料
    const buttonObj = {};
    newRenderDay[day-1].position.forEach(item => buttonObj[item.id] = { edit: false, vehicle: false })
    setCardButtons(buttonObj);
    // 交通工具 匯入當天排序後資料
    const vehicleObj = {};
    const changeVehicle = {};
    newRenderDay[day-1].position.forEach(item => {
      vehicleObj[item.id] = { vehicle: item.vehicle, avoidHighway: item.avoidHighway }
      changeVehicle[item.id] = typeof item.vehicle === 'number' ? 'custom' : item.vehicle;
    })
    // console.log(vehicleObj);
    setVehicle(vehicleObj);
    // 變更交通工具畫面
    // console.log(changeVehicle);
    setChangeVehicleObj(changeVehicle);

    // 算出當天的 driveTime 放入 hook
    const positions = [];
    newRenderDay[day-1].position.forEach(item => positions.push([item.px, item.py]))
    calculateTime(positions, newRenderDay[day-1], today);
    // 找出當天的 stayTime 放入 hook
    const stayArray = [];
    newRenderDay[day-1].position.forEach(item => stayArray.push(item.stayTime))
    setStayTimes(stayArray)

    // 設定新的 renderDay
    setRenderDay(newRenderDay);
  };

  // 處理 itinerary 資料
  const itineraryData = (data) => {
    // console.log(data);
    setRenderItinerary(data[0].itinerary);
    // 設定出發日期
    const today = data[0].itinerary.startDate;
    // 篩選掉 expand itinerary 資料
    const filterDaysData = [];
    data.forEach(item => {
      const newObj = {};
      for(let key of Object.keys(item)){
        if(key !== 'itinerary' && key !== 'itineraryId' && key !== 'userId'){
          newObj[key] = item[key]
        }
      }
      filterDaysData.push(newObj)
    })
    // 排序 Day
    filterDaysData.sort((a, b) => a.sort - b.sort);
    // 排序當天 Position
    filterDaysData.forEach(item => item.position.sort((a, b) => a.sort - b.sort));
    // filterDaysData[targetDay-1].position.sort((a, b) => a.sort - b.sort);
    // console.log(filterDaysData);
    setRenderDay(filterDaysData);
    // 設定當天出發時間
    setTime(dayjs(new Date(`${today} ${filterDaysData[targetDay-1].startTime}`)));
    // 設定 map 畫面
    if(filterDaysData[targetDay-1].position.length > 0){
      mapRef.current.setView([filterDaysData[targetDay-1].position[0].px, filterDaysData[targetDay-1].position[0].py])
    }
    // card button 匯入當天排序後資料
    const buttonObj = {};
    filterDaysData[targetDay-1].position.forEach(item => buttonObj[item.id] = { edit: false, vehicle: false })
    setCardButtons(buttonObj);
    // 交通工具 匯入當天排序後資料
    const vehicleObj = {};
    const changeVehicle = {};
    filterDaysData[targetDay-1].position.forEach(item => {
      vehicleObj[item.id] = { vehicle: item.vehicle, avoidHighway: item.avoidHighway }
      changeVehicle[item.id] = typeof item.vehicle === 'number' ? 'custom' : item.vehicle;
    })
    // console.log(vehicleObj);
    setVehicle(vehicleObj);
    // 變更交通工具畫面
    // console.log(changeVehicle);
    setChangeVehicleObj(changeVehicle);

    // 算出當天的 driveTime 放入 hook
    const positions = [];
    filterDaysData[targetDay-1].position.forEach(item => positions.push([item.px, item.py]))
    calculateTime(positions, filterDaysData[targetDay-1], today);
    // 找出當天的 stayTime 放入 hook
    const stayArray = [];
    filterDaysData[targetDay-1].position.forEach(item => stayArray.push(item.stayTime))
    setStayTimes(stayArray)
  }

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('localUserData')).accessToken;
    // setUserLoading(true);
    axios
      .get(
        `https://twtravel-server.onrender.com/600/days?itineraryId=${editId}&_expand=itinerary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log(res.data);
        itineraryData(res.data);
        // setUserLoading(false);
      })
      .catch((err) => {
        console.log(err);
        // setUserLoading(false);
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
      <div className="container">
        <div style={{ width: '150px' }}>
          <Link
            to="/user/user-list/my-itinerary"
            className="text-decoration-none text-dark"
          >
            <h5 style={{ marginTop: '130px' }}>
              <FontAwesomeIcon icon={faArrowLeft} size={'lg'} />
              <span className="ps-2">返回我的行程</span>
            </h5>
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-lg-2 mt-5 align-items-center">
          <div className="col text-center text-lg-start">
            <h1
              className="fs-3 position-relative mb-0"
              style={{ fontWeight: 'bold' }}
            >
              {renderItinerary.name}
              <FontAwesomeIcon
                className="position-absolute top-0 ps-2 text-primary"
                style={{ cursor: 'pointer' }}
                icon={faPenToSquare}
                onClick={changeName}
              />
            </h1>
          </div>
          <div className="col d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                minDate={dayjs().toDate()}
                disableToolbar
                autoOk
                inputFormat="YYYY-MM-DD"
                variant="inline"
                open={isDateOpen}
                onClose={() => setIsDateOpen(false)}
                value={date}
                onChange={(newDate) => {
                  onChangeDate(newDate);
                }}
                PopperProps={{
                  placement: 'bottom-start',
                  anchorEl: anchorEl,
                }}
                renderInput={(params) => {
                  // console.log(params)
                  return (
                    <span
                      variant="contained"
                      onClick={handleDateClick}
                      className="fs-5 mt-3 mt-lg-0 text-primary"
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      出發日期：{renderItinerary.startDate}
                    </span>
                  );
                }}
              />
            </LocalizationProvider>
            <button className="btn btn-primary mt-3 mt-lg-0">
              <FontAwesomeIcon className="pe-1" icon={faCloudArrowDown} />
              <span>下載行程</span>
            </button>
          </div>
        </div>

        {/* 行程區塊 */}
        <div className="d-flex flex-column position-relative">
          {itineraryLoading ? <ItineraryLoader /> : null}
          <div className="border border-2 border-primary rounded">
            <div className="row row-cols-1 row-cols-lg-2">
              <div className="col">
                <div
                  className="d-flex align-items-center m-2 mb-0 me-lg-0 border border-1 border-dark rounded-top"
                  style={{ background: 'gray' }}
                >
                  <h5 className="mx-2 mb-0 text-white">Day</h5>
                  <div className="flex-grow-1 border my-1 p-2 overflow-hidden position-relative">
                    {dayLoading ? <DayLoader /> : null}
                    {/* drag 區塊 */}
                    <DragDropContext onDragEnd={onDragDay}>
                      <Droppable droppableId="dropDays" direction="horizontal">
                        {(provided) => (
                          <ul
                            className="d-flex flex-nowrap overflow-auto list-unstyled mb-0"
                            ref={provided.innerRef} {...provided.droppableProps}>
                              {renderDay.map((item, i) => {
                                return (
                                  <div key={`${item.id}-${item.sort}`}>
                                    <Draggable draggableId={item.id.toString()} index={i} key={`${item.id}-${item.sort}`}>
                                      {(provided) => (
                                        <div
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          ref={provided.innerRef}
                                        >
                                          <li className={`btn ${ i + 1 == targetDay ? 'btn-primary' : 'btn-secondary' }
                                            ${i + 1 != renderDay.length ? 'me-2' : ''}`}
                                              onClick={() => changeDay(i + 1)}
                                            >
                                            {i + 1}
                                          </li>
                                        </div>
                                      )}
                                    </Draggable>
                                  </div>
                                );
                              })}
                              {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                  <FontAwesomeIcon
                    className="mx-2 text-white"
                    style={{ cursor: 'pointer' }}
                    icon={faCirclePlus}
                    size={'2x'}
                    onClick={addDay}
                  />
                </div>

                {renderDay
                  .filter((item, i) => targetDay == i + 1)
                  .map((item, i) => {
                    return (
                      <div
                        className="m-2 mt-0 me-lg-0 border border-dark rounded-bottom p-2"
                        key={item.id}
                      >
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center">
                          <div
                            className="btn btn-danger order-lg-3"
                            onClick={() => deleteDay(item.id, targetDay)}
                          >
                            <FontAwesomeIcon
                              className="pe-1"
                              icon={faTrashCan}
                            />
                            <span>刪除今天行程</span>
                          </div>
                          <h4
                            className="mb-0 mt-3 mt-lg-0"
                            style={{ fontWeight: 'bold' }}
                          >
                            第{targetDay}天
                          </h4>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              disableToolbar
                              autoOk
                              ampm={false}
                              variant="inline"
                              open={isTimeOpen}
                              onClose={() => setIsTimeOpen(false)}
                              value={time}
                              onChange={(newTime) => {
                                onChangeTime(newTime);
                              }}
                              PopperProps={{
                                placement: 'bottom-end',
                                anchorEl: anchorEl,
                              }}
                              renderInput={(params) => {
                                // console.log(params)
                                return (
                                  <span
                                    variant="contained"
                                    onClick={handleTimeClick}
                                    className="mt-2 mt-lg-0 text-primary fs-5"
                                    style={{
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    出發時間：{params.inputProps.value}
                                  </span>
                                );
                              }}
                            />
                          </LocalizationProvider>
                        </div>

                        {/* drag 區塊 */}
                        <DragDropContext onDragEnd={onDragPosition}>
                          <Droppable droppableId="dropPositions">
                            {(provided) => (
                              <ul
                                className="list-unstyled my-3 mx-2"
                                ref={provided.innerRef} {...provided.droppableProps}
                              >
                                {item.position.length === 0 ? (
                                  <h4 className="d-flex justify-content-center align-items-center my-4">
                                    今天還沒有行程
                                    <span className="ms-2 my-4">ಥ_ಥ</span>
                                  </h4>
                                ) : (
                                  item.position.map((data, i) => {
                                    return (
                                      <div key={data.id + data.name}>
                                        <Draggable draggableId={data.id.toString()} index={i} key={data.id + data.name}>
                                          {(provided) => (
                                            <div
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              ref={provided.innerRef}
                                            >
                                              <li className='bg-light'>
                                                <div className="d-flex">
                                                  {/* 地點開始結束時間 */}
                                                  <div className="d-flex flex-column justify-content-between">
                                                    <span>
                                                      {(
                                                        parseInt(
                                                          ([0, ...stayTimes]
                                                            .filter(
                                                              (data, index) => index <= i
                                                            )
                                                            .reduce((acc, cur) => {
                                                              return (
                                                                Number(acc) + Number(cur)
                                                              );
                                                            }, parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1])) +
                                                            [0, ...driveTimes]
                                                              .filter(
                                                                (data, index) => index <= i
                                                              )
                                                              .reduce((acc, cur) => {
                                                                return (
                                                                  Number(acc) + Number(cur)
                                                                );
                                                              })) /
                                                            60
                                                        ) % 24
                                                      )
                                                        .toString()
                                                        .padStart(2, '0') +
                                                        ':' +
                                                        (
                                                          ([0, ...stayTimes]
                                                            .filter(
                                                              (data, index) => index <= i
                                                            )
                                                            .reduce((acc, cur) => {
                                                              return (
                                                                Number(acc) + Number(cur)
                                                              );
                                                            }, parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1])) +
                                                            [0, ...driveTimes]
                                                              .filter(
                                                                (data, index) => index <= i
                                                              )
                                                              .reduce((acc, cur) => {
                                                                return (
                                                                  Number(acc) + Number(cur)
                                                                );
                                                              })) %
                                                          60
                                                        )
                                                          .toString()
                                                          .padStart(2, '0')}
                                                    </span>
                                                    <div
                                                      className="text-center position-relative"
                                                      style={{ cursor: 'pointer' }}
                                                      onClick={() =>
                                                        handleOnFlyTo([data.px, data.py])
                                                      }
                                                    >
                                                      <FontAwesomeIcon
                                                        className="my-1 text-primary"
                                                        icon={faLocationPin}
                                                        size={'3x'}
                                                      />
                                                      <div
                                                        className="position-absolute rounded-circle bg-light top-0 mt-2 ms-2"
                                                        style={{
                                                          width: '25px',
                                                          height: '25px',
                                                        }}
                                                      >
                                                        {i + 1}
                                                      </div>
                                                    </div>
                                                    <span>
                                                      {(
                                                        parseInt(
                                                          (stayTimes
                                                            .filter(
                                                              (data, index) => index <= i
                                                            )
                                                            .reduce((acc, cur) => {
                                                              return (
                                                                Number(acc) + Number(cur)
                                                              );
                                                            }, parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1])) +
                                                            [0, ...driveTimes]
                                                              .filter(
                                                                (data, index) => index <= i
                                                              )
                                                              .reduce((acc, cur) => {
                                                                return (
                                                                  Number(acc) + Number(cur)
                                                                );
                                                              })) /
                                                            60
                                                        ) % 24
                                                      )
                                                        .toString()
                                                        .padStart(2, '0') +
                                                        ':' +
                                                        (
                                                          (stayTimes
                                                            .filter(
                                                              (data, index) => index <= i
                                                            )
                                                            .reduce((acc, cur) => {
                                                              return (
                                                                Number(acc) + Number(cur)
                                                              );
                                                            }, parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1])) +
                                                            [0, ...driveTimes]
                                                              .filter(
                                                                (data, index) => index <= i
                                                              )
                                                              .reduce((acc, cur) => {
                                                                return (
                                                                  Number(acc) + Number(cur)
                                                                );
                                                              })) %
                                                          60
                                                        )
                                                          .toString()
                                                          .padStart(2, '0')}
                                                    </span>
                                                  </div>
                                                  {/* 地點卡片區塊 */}
                                                  <div className="flex-grow-1 ms-2 card h-100 position-relative overflow-hidden">
                                                    <div className="card-body d-flex flex-column py-2 h-100">
                                                      <div style={{ width: '90%' }}>
                                                        <span
                                                          className="text-primary"
                                                          style={{
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                          }}
                                                          onClick={() =>
                                                            changeStayTime(data, i)
                                                          }
                                                        >
                                                          停留
                                                          {` ${parseInt(
                                                            data.stayTime / 60
                                                          )}小時 ${data.stayTime % 60}分鐘`}
                                                        </span>
                                                      </div>
                                                      <div className="d-flex my-2 align-items-center">
                                                        <label htmlFor={`pictureUpload${i}`}>
                                                          <img
                                                            className="d-none d-md-flex"
                                                            style={{
                                                              width: '50px',
                                                              height: '50px',
                                                              objectFit: 'cover',
                                                              cursor: 'pointer',
                                                            }}
                                                            src={
                                                              data.picture ||
                                                              'https://www.survivorsuk.org/wp-content/uploads/2017/01/no-image.jpg'
                                                            }
                                                          />
                                                        </label>
                                                        <input
                                                          id={`pictureUpload${i}`}
                                                          type="file"
                                                          name="file"
                                                          accept="image/*"
                                                          ref={(el) =>
                                                            (pictureRef.current[i] = el)
                                                          }
                                                          className="d-none"
                                                          onChange={() =>
                                                            changePicture(data, i)
                                                          }
                                                        />
                                                        <h5
                                                          className="mb-0 ms-lg-2 text-truncate"
                                                          style={{ fontWeight: 'bold' }}
                                                        >
                                                          {data.name}
                                                        </h5>
                                                      </div>
                                                      <span className="text-truncate">
                                                        {data.address}
                                                      </span>
                                                    </div>

                                                    {/* 變更刪除地點按鈕 */}
                                                    <button
                                                      className="btn btn-sm btn-primary position-absolute end-0"
                                                      onClick={() =>
                                                        setCardButtons({
                                                          ...cardButtons,
                                                          [data.id]: {
                                                            edit: true,
                                                            vehicle:
                                                              cardButtons[data.id].vehicle,
                                                          },
                                                        })
                                                      }
                                                    >
                                                      <FontAwesomeIcon icon={faPen} />
                                                      <span className="ps-2 d-none d-sm-inline">
                                                        編輯
                                                      </span>
                                                    </button>
                                                    <div
                                                      className={`d-flex position-absolute end-0 bg-white edit-area ${
                                                        cardButtons[data.id]?.edit
                                                          ? ''
                                                          : 'active'
                                                      }`}
                                                      style={{ height: '100%' }}
                                                    >
                                                      <div className="d-flex flex-column">
                                                        <div
                                                          className="btn btn-outline-info d-flex align-items-center"
                                                          style={{
                                                            height: '50%',
                                                            fontWeight: 'bold',
                                                          }}
                                                          onClick={() =>
                                                            changePosition(
                                                              item.id,
                                                              item.position,
                                                              data,
                                                              i
                                                            )
                                                          }
                                                        >
                                                          變更地點
                                                        </div>
                                                        <div
                                                          className="btn btn-outline-danger d-flex align-items-center"
                                                          style={{
                                                            height: '50%',
                                                            fontWeight: 'bold',
                                                          }}
                                                          onClick={() =>
                                                            deletePosition(
                                                              item.id,
                                                              item.position,
                                                              data,
                                                              i
                                                            )
                                                          }
                                                        >
                                                          刪除地點
                                                        </div>
                                                      </div>
                                                      <div
                                                        className="d-flex justify-content-center align-items-center edit-btn border-start border-3 border-primary"
                                                        style={{
                                                          width: '40px',
                                                          cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                          setCardButtons({
                                                            ...cardButtons,
                                                            [data.id]: {
                                                              edit: false,
                                                              vehicle:
                                                                cardButtons[data.id]?.vehicle,
                                                            },
                                                          })
                                                        }
                                                      >
                                                        <FontAwesomeIcon
                                                          icon={faAnglesRight}
                                                          size={'2x'}
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                {/* 選擇交通工具 */}
                                                {renderDay[targetDay - 1].position.length ===
                                                i + 1 ? null : (
                                                  <div
                                                    className="border-start border-primary my-2"
                                                    style={{
                                                      marginLeft: '19.7px',
                                                      paddingLeft: '43px',
                                                    }}
                                                  >
                                                    <div className="d-flex flex-column flex-lg-row">
                                                      <div
                                                        className="text-nowrap"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                          const newButtons = {
                                                            ...cardButtons,
                                                          };
                                                          Object.keys(newButtons).forEach(
                                                            (item, i) =>
                                                              (newButtons[Number(item)] = {
                                                                edit: false,
                                                                vehicle: false,
                                                              })
                                                          );
                                                          newButtons[data.id] = {
                                                            edit: cardButtons[data.id]?.edit,
                                                            vehicle:
                                                              !cardButtons[data.id]?.vehicle,
                                                          };
                                                          setCardButtons(newButtons);
                                                        }}
                                                      >
                                                        {vehicle[data.id]?.vehicle ===
                                                        'car' ? (
                                                          <FontAwesomeIcon
                                                            icon={faCar}
                                                            size={'lg'}
                                                            className="text-primary"
                                                          />
                                                        ) : null}
                                                        {vehicle[data.id]?.vehicle ===
                                                        'scooter' ? (
                                                          <FontAwesomeIcon
                                                            icon={faMotorcycle}
                                                            size={'lg'}
                                                            className="text-primary"
                                                          />
                                                        ) : null}
                                                        {vehicle[data.id]?.vehicle ===
                                                        'cycling' ? (
                                                          <FontAwesomeIcon
                                                            icon={faBicycle}
                                                            size={'lg'}
                                                            className="text-primary"
                                                          />
                                                        ) : null}
                                                        {vehicle[data.id]?.vehicle ===
                                                        'walking' ? (
                                                          <FontAwesomeIcon
                                                            icon={faPersonWalking}
                                                            size={'lg'}
                                                            className="text-primary"
                                                          />
                                                        ) : null}
                                                        {typeof vehicle[data.id]?.vehicle ===
                                                        'number' ? (
                                                          <FontAwesomeIcon
                                                            icon={faFilePen}
                                                            size={'lg'}
                                                            className="text-primary"
                                                          />
                                                        ) : null}
                                                        <span className="ps-2">{`${parseInt(
                                                          driveTimes[i] / 60
                                                        )}小時 ${parseInt(
                                                          driveTimes[i] % 60
                                                        )}分`}</span>
                                                      </div>
                                                      <div className="form-check form-switch mt-2 mt-lg-0 ms-lg-3 mb-0">
                                                        <label>
                                                          <input
                                                            type="checkbox"
                                                            role="switch"
                                                            className="form-check-input"
                                                            id={`formCheck${i}`}
                                                            checked={
                                                              vehicle[data.id]?.avoidHighway
                                                            }
                                                            disabled={
                                                              vehicle[data.id]?.vehicle !==
                                                              'car' || highwayLoader
                                                            }
                                                            onChange={() =>
                                                              changeHighwayRadio(data.id, i)
                                                            }
                                                          />
                                                          <span
                                                            className={`text-nowrap ${
                                                              vehicle[data.id]?.vehicle !==
                                                              'car'
                                                                ? 'text-black text-opacity-25'
                                                                : ''
                                                            }`}
                                                          >
                                                            避開高速公路
                                                          </span>
                                                        </label>
                                                      </div>
                                                    </div>
                                                    <div
                                                      className={`flex-column flex-lg-row bg-secondary my-3 py-2 me-1 rounded border border-primary position-relative ${
                                                        cardButtons[data.id]?.vehicle
                                                          ? 'row'
                                                          : 'd-none'
                                                      }`}
                                                    >
                                                      {vehicleLoading ? <VehicleLoader /> : null}
                                                      <div className="col-12 col-lg-8 d-flex flex-column justify-content-between">
                                                        <div className="d-flex justify-content-between justify-content-md-around">
                                                          <FontAwesomeIcon
                                                            icon={faCar}
                                                            size={'lg'}
                                                            className={`${
                                                              changeVehicleObj[data.id] ===
                                                              'car'
                                                                ? 'text-primary'
                                                                : 'text-dark'
                                                            }`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() =>
                                                              changeVehicle(
                                                                'car',
                                                                item.position[i],
                                                                item.position[i + 1],
                                                                i
                                                              )
                                                            }
                                                          />
                                                          <FontAwesomeIcon
                                                            icon={faMotorcycle}
                                                            size={'lg'}
                                                            className={`${
                                                              changeVehicleObj[data.id] ===
                                                              'scooter'
                                                                ? 'text-primary'
                                                                : 'text-dark'
                                                            }`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() =>
                                                              changeVehicle(
                                                                'scooter',
                                                                item.position[i],
                                                                item.position[i + 1],
                                                                i
                                                              )
                                                            }
                                                          />
                                                          <FontAwesomeIcon
                                                            icon={faBicycle}
                                                            size={'lg'}
                                                            className={`${
                                                              changeVehicleObj[data.id] ===
                                                              'cycling'
                                                                ? 'text-primary'
                                                                : 'text-dark'
                                                            }`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() =>
                                                              changeVehicle(
                                                                'cycling',
                                                                item.position[i],
                                                                item.position[i + 1],
                                                                i
                                                              )
                                                            }
                                                          />
                                                          <FontAwesomeIcon
                                                            icon={faPersonWalking}
                                                            size={'lg'}
                                                            className={`${
                                                              changeVehicleObj[data.id] ===
                                                              'walking'
                                                                ? 'text-primary'
                                                                : 'text-dark'
                                                            }`}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() =>
                                                              changeVehicle(
                                                                'walking',
                                                                item.position[i],
                                                                item.position[i + 1],
                                                                i
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                        <span
                                                          className={`fs-6 text-center mt-3 m-lg-0 ${
                                                            changeVehicleObj[data.id] ===
                                                            'custom'
                                                              ? 'text-primary'
                                                              : ' text-dark'
                                                          }`}
                                                          style={{
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                          }}
                                                          onClick={() => {
                                                            changeVehicle(
                                                              'custom',
                                                              item.position[i],
                                                              item.position[i + 1],
                                                              i
                                                            );
                                                          }}
                                                        >
                                                          自訂時間
                                                        </span>
                                                      </div>
                                                      <div className="col-12 col-lg-4 d-flex flex-column">
                                                        <span className="text-center mt-3 mt-lg-0">
                                                          {`${parseInt(
                                                            changeRouteTimes[i] / 60
                                                          )}小時 ${
                                                            changeRouteTimes[i] % 60
                                                          }分鐘`}
                                                        </span>
                                                        <div
                                                          className="btn btn-sm btn-primary mt-2 mx-1 mx-lg-0"
                                                          onClick={() =>
                                                            handleChangeVehicle(data.id, i)
                                                          }
                                                        >
                                                          確定變更
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </li>
                                            </div>
                                          )}
                                        </Draggable>
                                      </div>
                                    );
                                  })
                                )}
                                {provided.placeholder}
                              </ul>
                            )}
                          </Droppable>
                        </DragDropContext>
                        {/* 新增地點 */}
                        <div className="d-flex flex-column flex-sm-row justify-content-around mb-3">
                          {stayTimes.length > 0 &&
                          (stayTimes.reduce((acc, cur) => {
                            return Number(acc) + Number(cur);
                          }, parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1])) +
                            [0, ...driveTimes]
                              .filter((item, i) => i <= driveTimes.length)
                              .reduce((acc, cur) => {
                                return Number(acc) + Number(cur);
                              })) /
                            60 >=
                            24 ? null : (
                            <>
                              <div className=" d-flex justify-content-center align-items-center">
                                <div
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setAddPositionWindow('search');
                                    window.scrollTo({
                                      top: 150,
                                      behavior: 'smooth',
                                    });
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className="me-1"
                                    icon={faMagnifyingGlass}
                                  />
                                  搜尋地點
                                </div>
                              </div>
                              <div className="d-flex justify-content-center align-items-center mt-2 mt-sm-0">
                                <div
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setAddPositionWindow('favorite');
                                    window.scrollTo({
                                      top: 150,
                                      behavior: 'smooth',
                                    });
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className="me-1"
                                    icon={faStar}
                                  />
                                  我的收藏
                                </div>
                              </div>
                              <div className="d-flex justify-content-center align-items-center mt-2 mt-sm-0">
                                <div
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setAddPositionWindow('custom');
                                    window.scrollTo({
                                      top: 150,
                                      behavior: 'smooth',
                                    });
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className="me-1"
                                    icon={faPlus}
                                    size={'lg'}
                                  />
                                  自訂地點
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="col">
                <div className="m-2 border border-2 border-dark rounded p-2">
                  {/* Open Street Map */}
                  <div
                    className="rounded overflow-hidden"
                    style={{ height: '500px' }}
                  >
                    <MapContainer
                      ref={mapRef}
                      className="h-100"
                      center={[25.03381610968445, 121.564937246889]}
                      zoom={15}
                    >
                      <LayersControl>
                        <BaseLayer checked name="Origin">
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="DE">
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="CH">
                          <TileLayer
                            url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="France">
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="HOT">
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="BZH">
                          <TileLayer
                            url="https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="OpenTopo">
                          <TileLayer
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="OPNVKarte">
                          <TileLayer
                            url="https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="CyclOSM">
                          <TileLayer
                            url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>

                        <BaseLayer name="Esri_WorldImagery">
                          <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                          />
                        </BaseLayer>
                      </LayersControl>

                      {renderDay[targetDay - 1]?.position.map((item, i) => {
                        return (
                          <Marker
                            position={[item.px, item.py]}
                            icon={positionIcon}
                            key={`${item.id}-${item.sort}`}
                          >
                            <Tooltip
                              className="position-labels"
                              permanent={true}
                              direction={'center'}
                              offset={L.point(0, -32)}
                            >
                              {i + 1}
                            </Tooltip>
                            <Popup>
                              <p>
                                {item.name}
                                <a
                                  href={`https://www.google.com/maps/place/${item.px},${item.py}`}
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
                        );
                      })}
                    </MapContainer>
                  </div>

                  {/* 測速查詢 */}
                  <div className="mt-4">
                    <div className="d-flex flex-column flex-lg-row align-items-center">
                      <div className="d-flex justify-content-between justify-content-lg-start align-items-center w-100 w-lg-auto px-2 p-lg-0">
                        <span style={{ fontWeight: 'bold' }}>
                          選擇測速相機區域：
                        </span>
                        <FontAwesomeIcon
                          className="d-lg-none"
                          style={{ cursor: 'pointer' }}
                          icon={camera}
                          size={'lg'}
                          onClick={() =>
                            camera === faEye
                              ? setCamera(faEyeSlash)
                              : setCamera(faEye)
                          }
                        />
                      </div>
                      <div className="col-12 col-lg-4 p-0 mt-2 mt-lg-0">
                        {/* hook取值: selectCity.value */}
                        <Select
                          defaultValue={selectCity}
                          value={selectCity}
                          // onChange={setSelectCity}
                          onChange={(e) => cityChange(e)}
                          options={cityOptions}
                          isSearchable={true}
                          maxMenuHeight="150px"
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: '#5C9500',
                              primary25: '#EFF4E5',
                            },
                          })}
                        />
                      </div>
                      <div className="col-12 col-lg-4 p-0 mt-2 mt-lg-0">
                        {/* hook取值: selectCity.value */}
                        <Select
                          defaultValue={selectDistrict}
                          value={selectDistrict}
                          onChange={(e) => districtChange(e)}
                          options={districtOptions}
                          isSearchable={true}
                          maxMenuHeight="155px"
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: '#5C9500',
                              primary25: '#EFF4E5',
                            },
                          })}
                        />
                      </div>
                      <FontAwesomeIcon
                        className="d-none d-lg-block ms-3"
                        style={{ cursor: 'pointer' }}
                        icon={camera}
                        size={'lg'}
                        onClick={() =>
                          camera === faEye
                            ? setCamera(faEyeSlash)
                            : setCamera(faEye)
                        }
                      />
                    </div>
                    <h5 className="mt-4">測速相機位置：</h5>
                    <p>尚未點選測速相機</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`position-absolute w-100 h-100 rounded overflow-hidden add-position d-flex flex-column justify-content-start align-items-center pt-3 px-2 ${
              !addPositionWindow ? 'd-none' : ''
            }`}
          >
            <SearchPosition
              addPositionWindow={addPositionWindow}
              setAddPositionWindow={setAddPositionWindow}
              addPosition={addPosition}
              editId={editId}
            />
            <FavoritePosition
              addPositionWindow={addPositionWindow}
              setAddPositionWindow={setAddPositionWindow}
              addPosition={addPosition}
            />
            <CustomPosition
              addPositionWindow={addPositionWindow}
              setAddPositionWindow={setAddPositionWindow}
              addPosition={addPosition}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Itinerary;