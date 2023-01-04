import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Swal from 'sweetalert2';
// import RingLoading from './Loading';
import { useAuth } from './Context';
import { LoginLoader } from './Loadings';

const Login = () => {
  const {register, handleSubmit, formState: { errors }} = useForm();
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('localUserData') !== null) {
      setToken(JSON.parse(localStorage.getItem('localUserData')).accessToken);
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  const onSubmit = (data) => {
    setLoginLoading(true);
    // console.log({...data})
    const userData = { ...data };
    axios
      .post('https://tw-travel-server.vercel.app/login', userData)
      .then((res) => {
        // console.log(res.data);
        const data = res.data;
        data.timeStamp = new Date().getTime();
        setToken(res.data.accessToken);
        localStorage.setItem('localUserData', JSON.stringify(data));
        setLoginLoading(false);
        navigate('/', { replace: true });
      })
      .catch((err) => {
        // console.log(err);
        setLoginLoading(false);
        Swal.fire({
          icon: 'error',
          title: '登入失敗',
          html: `<pre>${err.response?.data ? err.response.data+'\n請重新輸入' : err.message}</pre>`,
          background: '#F2F8F8',
          confirmButtonColor: '#5C9500',
          footer: '<a href="#/ContactUs" target="_blank">遇到問題嗎？請留言給我們</a>'
        });
      });
  };

  return (
    <>
      {loginLoading ? <LoginLoader /> : null}
      <div className="container">
        <div className="row row-cols-1 row-cols-lg-2 justify-content-between align-items-center vh-100">
          <div className="col d-none d-lg-block w-auto vh-100 ms-auto">
            <div className="d-flex flex-column justify-content-center text-primary h-100 me-5">
              <img
                src={require('../img/login.png')}
                style={{ maxHeight: '500px' }}
              />
            </div>
          </div>
          <div className="col d-flex vh-100 justify-content-center justify-content-lg-start align-items-center">
            <form
              className="form-group d-flex flex-column mx-lg-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Link to='/' className='text-decoration-none'>
                <h1 className="h1 text-center text-primary font-lilita">
                  TWTravel
                </h1>
              </Link>
              <h2 className="h2 text-center mt-4" style={{ fontWeight: 'bold' }}>
                規劃您的專屬行程
              </h2>
              <label
                className="mt-4"
                htmlFor="account"
                style={{ fontWeight: 'bold' }}
              >
                帳號
              </label>
              <input
                className="mt-2 form-control"
                type="text"
                name="email"
                id="account"
                placeholder="請輸入 Email"
                {...register('email', {
                  required: { value: true, message: '請輸入帳號' },
                  pattern: {
                    value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, // eslint-disable-line
                    message: '不符合 Email 規則',
                  },
                })}
              />
              <span className="text-danger mt-1 ms-2">
                {errors.email?.message}
              </span>
              <label
                className="mt-4"
                htmlFor="password"
                style={{ fontWeight: 'bold' }}
              >
                密碼
              </label>
              <input
                className="mt-2 form-control"
                type="password"
                name="password"
                id="password"
                placeholder="請輸入密碼"
                {...register('password', {
                  required: { value: true, message: '請輸入密碼' },
                })}
              />
              <span className="text-danger mt-1 ms-2">
                {errors.password?.message}
              </span>
              <input
                className="btn btn-primary w-50 mx-auto mt-5"
                type="submit"
                disabled={Object.keys(errors).length > 0}
                value="登入"
              />
              <Link to="/signUp" className="mx-auto mt-4 text-decoration-none">
                註冊帳號
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
