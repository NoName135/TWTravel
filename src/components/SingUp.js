import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Swal from 'sweetalert2';

import { LoginLoader } from './Loadings';

const SignUp = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [pwdCheck, setPwdCheck] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);

  const onSubmit = (data) => {
    setLoginLoading(true);

    delete data.passwordCheck
    const userData = {...data, photo: ''};

    axios
      .post('https://tw-travel-server.vercel.app/users', userData)
      .then((res) => {
        // console.log(res)
        setLoginLoading(false);
        Swal.fire({
          icon: 'success',
          title: `${res.data.user.nickname} 註冊成功`,
          text: '將跳轉至登入頁面',
          background: '#F2F8F8',
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 2000,
        });
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, '2000');
      })
      .catch((err) => {
        // console.log(err);
        setLoginLoading(false);
        Swal.fire({
          icon: 'error',
          title: '註冊失敗',
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
                style={{ maxHeight: '590px' }}
              />
            </div>
          </div>
          <div className="col d-flex vh-100 justify-content-center justify-content-lg-start align-items-center">
            <form
              className="form-group d-flex flex-column mx-lg-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <h2
                className="h2 text-center mt-4"
                style={{ fontWeight: 'bold' }}
              >
                註冊帳號
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
                htmlFor="nickname"
                style={{ fontWeight: 'bold' }}
              >
                您的暱稱
              </label>
              <input
                className="mt-2 form-control"
                type="text"
                name="nickname"
                id="nickname"
                placeholder="請輸入您的暱稱(最多8字)"
                {...register('nickname', {
                  required: { value: true, message: '此欄位必填' },
                  maxLength: { value: 8, message: '不可超過8個字' },
                })}
              />
              <span className="text-danger mt-1 ms-2">
                {errors.nickname?.message}
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
                onInput={() => setPwdCheck('')}
                {...register('password', {
                  required: { value: true, message: '此欄位必填' },
                  minLength: { value: 8, message: '密碼至少為8碼' },
                })}
              />
              <span className="text-danger mt-1 ms-2">
                {errors.password?.message}
              </span>
              <label
                className="mt-4"
                htmlFor="nickname"
                style={{ fontWeight: 'bold' }}
              >
                再次輸入密碼
              </label>
              <input
                className="mt-2 form-control"
                type="password"
                name="passwordCheck"
                id="passwordCheck"
                placeholder="請再次輸入密碼"
                value={pwdCheck}
                onInput={(e) => setPwdCheck(e.target.value)}
                {...register('passwordCheck', {
                  required: { value: true, message: '此欄位必填' },
                  validate: (value) => {
                    return value === watch('password') || '密碼不一致';
                  },
                })}
              />
              <span className="text-danger mt-1 ms-2 pb-3">
                {errors.passwordCheck?.message}
              </span>
              <input
                className="btn btn-primary w-50 mx-auto mt-4"
                type="submit"
                disabled={Object.keys(errors).length > 0}
                value="註冊"
              />
              <Link to="/login" className="mx-auto mt-4 text-decoration-none">
                登入會員
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
