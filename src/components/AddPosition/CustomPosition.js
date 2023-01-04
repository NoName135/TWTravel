import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';

import axios from 'axios';
import Swal from 'sweetalert2';
import { CustomPictureLoader } from '../Loadings';

function CustomPosition(props) {
  const { addPositionWindow, setAddPositionWindow, addPosition } = props;
  const {register, handleSubmit, formState: { errors }} = useForm();

  const useState = React.useState;
  const pictureRef = React.useRef();
  const [picture, setPicture] = useState('');
  const [pictureLoading, setPictureLoading] = useState(false);

  const handleUpload = () => {
    // console.log(pictureRef.current.files[0]);
    let formData = new FormData();
    formData.append('image', pictureRef.current.files[0]);

    // 上傳圖片到 Imgur
    // 在 Localhost 執行的話 index.html需加入 <meta name="referrer" content="no-referrer">
    if (pictureRef.current.files[0]){
      setPictureLoading(true);
      axios
        .post('https://api.imgur.com/3/image', formData, {
          headers: {
            Authorization: 'Client-ID ' + '0361c3fa7d90333',
          },
          mimeType: 'multipart/form-data',
        })
        .then((res) => {
          // console.log(res)
          setPicture(res.data.data.link);
          setPictureLoading(false);
        })
        .catch((err) => {
          // console.log(err)
          setPictureLoading(false);
          Swal.fire({
            icon: 'error',
            title: '上傳失敗',
            background: '#F2F8F8',
            confirmButtonColor: '#dc3545',
            footer:
              '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>',
          });
        });
      }
  }

  const onSubmit = async(data) => {
    // console.log(data)
    const MAP_API_KEY = 'o0Ej3PsJCAkZfp1e9GyxUu56E8oEHTyVbhh8aevKa7E';
    const encodeAddress = encodeURI(data.positionAddress);
    let px;
    let py;
    await axios
      .get(
        `https://geocoder.ls.hereapi.com/6.2/geocode.json?searchtext=${encodeAddress}&gen=9&apiKey=${MAP_API_KEY}`
      )
        .then((res) => {
          if (!res.data.Response.View[0]?.Result[0]){
            Swal.fire({
              icon: 'warning',
              title: '找不到地址，請重新輸入',
              background: '#F2F8F8',
              confirmButtonColor: '#5C9500',
            });
            document.querySelector('#positionAddress').value=''
          }else if(res.data.Response.View[0]?.Result[0].Location.Address.Country !== 'TWN'){
            Swal.fire({
              icon: 'warning',
              title: '地址僅限台灣地區',
              background: '#F2F8F8',
              confirmButtonColor: '#5C9500',
            });
            document.querySelector('#positionAddress').value = '';
          }else{
            px = res.data.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude;
            py = res.data.Response.View[0].Result[0].Location.NavigationPosition[0].Longitude;
          }
        })
        .catch((err) => {
          console.log(err);
        });

    if(px && py){
      const customData = {
        name: data.positionName,
        picture: picture,
        address: data.positionAddress,
        px: px,
        py: py
      };
      addPosition('custom', customData);
      document.querySelector('#positionName').value = '';
      document.querySelector('#positionAddress').value = '';
      setAddPositionWindow('');
    }
  }

  return (
    <div
      className={`d-flex flex-column align-items-center w-100 ${
        addPositionWindow !== 'custom' ? 'd-none' : ''
      }`}
    >
      {/* 自訂地點 */}
      <div className="bg-secondary p-3 custom-column rounded-top position-relative">
        <FontAwesomeIcon
          className="position-absolute top-0 end-0 pt-2 pe-2"
          style={{ cursor: 'pointer' }}
          icon={faXmarkCircle}
          size={'2x'}
          onClick={() => setAddPositionWindow('')}
        />
        <h4 className="m-0" style={{ fontWeight: 'bold' }}>
          自訂地點
        </h4>
      </div>
      {/* 自訂地點內容區塊 */}
      <div className="pt-4 custom-column bg-light rounded-bottom d-flex justify-content-center align-items-center">
        <div
          className="m-0 d-flex flex-column justify-content-center align-items-center px-3 px-lg-0"
          style={{ width: '100%' }}
        >
          <div className="card custom-position position-relative">
            <img
              className="card-img"
              style={{ objectFit: 'cover', height: '250px' }}
              src={
                picture ||
                'https://www.survivorsuk.org/wp-content/uploads/2017/01/no-image.jpg'
              }
            />
            {pictureLoading ? <CustomPictureLoader /> : null}
          </div>
          <label htmlFor="fileUpload" className="btn btn-primary mt-2">
            選擇圖片
          </label>
          <input
            id="fileUpload"
            type="file"
            name="file"
            accept="image/*"
            ref={pictureRef}
            className="position-fixed top-0"
            onChange={handleUpload}
          />
          <form
            className="form-group w-100 d-flex flex-column align-items-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="d-flex align-items-center mt-5 custom-position">
              <label
                htmlFor="positionName"
                className="fs-6 fs-lg-5 text-nowrap"
              >
                名稱：
              </label>
              <input
                type="text"
                className="form-control"
                id="positionName"
                name="positionName"
                placeholder="請輸入名稱"
                {...register('positionName', {
                  required: { value: true, message: '欄位不得為空' },
                })}
              />
            </div>
            <span
              className="text-danger mt-1 text-start ps-lg-5"
              style={{ width: '90%', marginLeft: '90px' }}
            >
              {errors.positionName?.message}
            </span>
            <div className="d-flex align-items-center mt-3 custom-position">
              <label
                htmlFor="positionAddress"
                className="fs-6 fs-lg-5 text-nowrap"
              >
                地址：
              </label>
              <input
                type="text"
                className="form-control"
                id="positionAddress"
                name="positionAddress"
                placeholder="請輸入地址"
                {...register('positionAddress', {
                  required: { value: true, message: '欄位不得為空' },
                })}
              />
            </div>
            <span
              className="text-danger mt-1 text-start ps-lg-5"
              style={{ width: '90%', marginLeft: '90px' }}
            >
              {errors.positionAddress?.message}
            </span>
            <input
              type="submit"
              className="btn btn-outline-primary my-4 custom-position"
              disabled={Object.keys(errors).length > 0}
              value="新增地點"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomPosition;
