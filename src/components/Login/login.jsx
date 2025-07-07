import { useState } from "react";
import './login.css';
import loginimage from '../../assets/images/eqms-bg1.png';
import drdologo from '../../assets/images/drdologo.png';
import { MdPerson, MdVisibility, MdVisibilityOff } from "react-icons/md";
//import bgImage from '../../assets/images/gradient-blue.jpg';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import withRouter from "../../common/with-router";
import { login } from "../../services/auth.service";

const LoginPage = (props) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const initialValues = { username: "", password: "" };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(3, "Password must be at least 3 characters")
      .max(40, "Password must not exceed 40 characters"),
  });

  const handleLoginSubmit = async (values) => {
    setMessage("");
    setLoading(true);
    const { username, password } = values;
    await login(username, password).then(
      (response) => {
        if (!response.data) {
          setLoading(false);
          showError("Login failed. Please try again.");
        } else {
          localStorage.setItem("usertoken", JSON.stringify(response.data.token));
          props.router.navigate("/dashboard");
        }
      },
      (error) => {
        let resMessage;
        if (error.response && error.response.status === 401) {
          resMessage = "Username or password is incorrect";
        } else {
          resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
        }
        setLoading(false);
        showError(resMessage);
      }
    );
  };

  const showError = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-wrapper d-flex flex-column">
      <header className="navbar navbar-expand-lg navbar-dark custom-header-bg px-2 py-2">
        <div className="d-flex align-items-center mx-auto">
          <img src={drdologo} alt="Logo" height="70" width="70" className="me-4" />
          <h4 className="text-white mb-0">Equipment & Project Inventory Monitoring System (EQPIMS Ver1.0)</h4>
        </div>
      </header>

      <main className="flex-grow-1 d-flex justify-content-center align-items-center p-4"
      // style={{
      //   backgroundImage: `url(${bgImage})`,
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      //   backgroundRepeat: 'no-repeat',
      // }}
      >
        <div className="card card-custom overflow-hidden w-100">
          <div className="row g-0" style={{ height: '500px' }}>
            <div className="col-md-6 d-flex align-items-center justify-content-center  p-4">
              <img
                src={loginimage}
                alt="loginimage"
                className="img-fluid"
                style={{ maxWidth: '530px', maxHeight: '100%' }}
              />
            </div>

            <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
              <h5 className="text-center text-brand mb-2">Welcome To EQPIMS</h5>
              <h4 className="text-center mb-4">Login</h4>
              {message && (
                <div className="form-group">
                  <div className="alert alert-danger" role="alert">
                    {message}
                  </div>
                </div>
              )}
              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleLoginSubmit}>
                {({ errors, touched, handleChange, values }) => (
                  <Form className="d-flex flex-column align-items-center">
                    <div className="mb-3 w-75 position-relative">
                      <input
                        name="username"
                        type="text"
                        className="form-control custom-input pe-5"
                        placeholder="Username"
                        value={values.username}
                        onChange={handleChange}
                      />
                      <MdPerson className="input-icon-end" />
                      {errors.username && touched.username && <div className="text-danger small text-start">{errors.username}</div>}
                    </div>

                    <div className="mb-3 w-75 position-relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control custom-input pe-5"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChange}
                      />
                      <span
                        className="input-icon-end password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </span>
                      {errors.password && touched.password && <div className="text-danger small text-start">{errors.password}</div>}
                    </div>

                    <div className="w-75 py-2">
                      <button type="submit" className="btn bg-primary text-white custom-btn">Login</button>
                    </div>
                  </Form>
                )}

              </Formik>

            </div>
          </div>
        </div>
      </main>

      <footer className="py-2 text-center text-white custom-header-bg">
        <small>Website maintained by Vedant Tech Solutions</small>
      </footer>
    </div>



  );
};

export default withRouter(LoginPage);
