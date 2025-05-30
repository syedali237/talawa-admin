/**
 * @file LoginPage.tsx
 * @description This file contains the implementation of the Login and Registration page for the Talawa Admin application.
 * It includes functionality for user authentication, password validation, reCAPTCHA verification, and organization selection.
 * The page supports both admin and user roles and provides localization support.
 *
 * @module LoginPage
 *
 * @requires react
 * @requires react-router-dom
 * @requires react-bootstrap
 * @requires react-google-recaptcha
 * @requires @apollo/client
 * @requires @mui/icons-material
 * @requires @mui/material
 * @requires react-toastify
 * @requires i18next
 * @requires utils/errorHandler
 * @requires utils/useLocalstorage
 * @requires utils/useSession
 * @requires utils/i18n
 * @requires GraphQl/Mutations/mutations
 * @requires GraphQl/Queries/Queries
 * @requires components/ChangeLanguageDropdown/ChangeLanguageDropDown
 * @requires components/LoginPortalToggle/LoginPortalToggle
 * @requires assets/svgs/palisadoes.svg
 * @requires assets/svgs/talawa.svg
 *
 * @component
 * @description The `loginPage` component renders a login and registration interface with the following features:
 * - Login and registration forms with validation.
 * - Password strength checks and visibility toggles.
 * - reCAPTCHA integration for bot prevention.
 * - Organization selection using an autocomplete dropdown.
 * - Social media links and community branding.
 * - Role-based navigation for admin and user.
 *
 * @returns {JSX.Element} The rendered login and registration page.
 *
 * @example
 * ```tsx
 * import LoginPage from './LoginPage';
 *
 * const App = () => {
 *   return <LoginPage />;
 * };
 *
 * export default App;
 * ```
 */
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Check, Clear } from '@mui/icons-material';
import type { ChangeEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import {
  BACKEND_URL,
  REACT_APP_USE_RECAPTCHA,
  RECAPTCHA_SITE_KEY,
} from 'Constant/constant';
import {
  RECAPTCHA_MUTATION,
  SIGNUP_MUTATION,
} from 'GraphQl/Mutations/mutations';
import {
  ORGANIZATION_LIST,
  SIGNIN_QUERY,
  GET_COMMUNITY_DATA_PG,
} from 'GraphQl/Queries/Queries';
import PalisadoesLogo from 'assets/svgs/palisadoes.svg?react';
import TalawaLogo from 'assets/svgs/talawa.svg?react';
import ChangeLanguageDropDown from 'components/ChangeLanguageDropdown/ChangeLanguageDropDown';
import { errorHandler } from 'utils/errorHandler';
import useLocalStorage from 'utils/useLocalstorage';
import { socialMediaLinks } from '../../constants';
import styles from '../../style/app-fixed.module.css';
import type { InterfaceQueryOrganizationListObject } from 'utils/interfaces';
import { Autocomplete, TextField } from '@mui/material';
import useSession from 'utils/useSession';
import i18n from 'utils/i18n';

const loginPage = (): JSX.Element => {
  const { t } = useTranslation('translation', { keyPrefix: 'loginPage' });
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');

  const navigate = useNavigate();

  const { getItem, setItem } = useLocalStorage();

  document.title = t('title');

  type PasswordValidation = {
    lowercaseChar: boolean;
    uppercaseChar: boolean;
    numericValue: boolean;
    specialChar: boolean;
  };

  const loginRecaptchaRef = useRef<ReCAPTCHA>(null);
  const SignupRecaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showTab, setShowTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [signformState, setSignFormState] = useState({
    signName: '',
    signEmail: '',
    signPassword: '',
    cPassword: '',
    signOrg: '',
  });
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<PasswordValidation>({
    lowercaseChar: true,
    uppercaseChar: true,
    numericValue: true,
    specialChar: true,
  });
  const [organizations, setOrganizations] = useState([]);
  const location = useLocation();
  const passwordValidationRegExp = {
    lowercaseCharRegExp: new RegExp('[a-z]'),
    uppercaseCharRegExp: new RegExp('[A-Z]'),
    numericalValueRegExp: new RegExp('\\d'),
    specialCharRegExp: new RegExp('[!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\/-]'),
  };

  const handlePasswordCheck = (pass: string): void => {
    setShowAlert({
      lowercaseChar: !passwordValidationRegExp.lowercaseCharRegExp.test(pass),
      uppercaseChar: !passwordValidationRegExp.uppercaseCharRegExp.test(pass),
      numericValue: !passwordValidationRegExp.numericalValueRegExp.test(pass),
      specialChar: !passwordValidationRegExp.specialCharRegExp.test(pass),
    });
  };

  useEffect(() => {
    const isRegister = location.pathname === '/register';
    if (isRegister) {
      setShowTab('REGISTER');
    }
    const isAdmin = location.pathname === '/admin';
    if (isAdmin) {
      setRole('admin');
    } else {
      setRole('user');
    }
  }, [location.pathname]);

  useEffect(() => {
    const isLoggedIn = getItem('IsLoggedIn');
    if (isLoggedIn == 'TRUE') {
      navigate(getItem('userId') !== null ? '/user/organizations' : '/orglist');
      extendSession();
    }
  }, []);

  const togglePassword = (): void => setShowPassword(!showPassword);
  const toggleConfirmPassword = (): void =>
    setShowConfirmPassword(!showConfirmPassword);

  const { data, refetch } = useQuery(GET_COMMUNITY_DATA_PG);
  useEffect(() => {
    // refetching the data if the pre-login data updates
    refetch();
  }, [data]);
  const [signin, { loading: loginLoading }] = useLazyQuery(SIGNIN_QUERY);
  const [signup, { loading: signinLoading }] = useMutation(SIGNUP_MUTATION);
  const [recaptcha] = useMutation(RECAPTCHA_MUTATION);
  const { data: orgData } = useQuery(ORGANIZATION_LIST);
  const { startSession, extendSession } = useSession();
  useEffect(() => {
    if (orgData) {
      const options = orgData.organizations.map(
        (org: InterfaceQueryOrganizationListObject) => {
          const tempObj: { label: string; id: string } | null = {} as {
            label: string;
            id: string;
          };
          tempObj['label'] =
            `${org.name}(${org.address?.city},${org.address?.state},${org.address?.countryCode})`;
          tempObj['id'] = org._id;
          return tempObj;
        },
      );
      setOrganizations(options);
    }
  }, [orgData]);

  useEffect(() => {
    async function loadResource(): Promise<void> {
      try {
        await fetch(BACKEND_URL as string);
      } catch (error) {
        errorHandler(t, error);
      }
    }

    loadResource();
  }, []);

  const verifyRecaptcha = async (
    recaptchaToken: string | null,
  ): Promise<boolean | void> => {
    try {
      if (REACT_APP_USE_RECAPTCHA !== 'yes') {
        return true;
      }
      const { data } = await recaptcha({
        variables: {
          recaptchaToken,
        },
      });

      return data.recaptcha;
    } catch {
      toast.error(t('captchaError') as string);
    }
  };

  const handleCaptcha = (token: string | null): void => {
    setRecaptchaToken(token);
  };

  const signupLink = async (e: ChangeEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const { signName, signEmail, signPassword, cPassword } = signformState;

    const isVerified = await verifyRecaptcha(recaptchaToken);

    if (!isVerified) {
      toast.error(t('Please_check_the_captcha') as string);
      return;
    }

    const isValidName = (value: string): boolean => {
      // Allow letters, spaces, and hyphens, but not consecutive spaces or hyphens
      return /^[a-zA-Z]+(?:[-\s][a-zA-Z]+)*$/.test(value.trim());
    };

    const validatePassword = (password: string): boolean => {
      const lengthCheck = new RegExp('^.{6,}$');
      return (
        lengthCheck.test(password) &&
        passwordValidationRegExp.lowercaseCharRegExp.test(password) &&
        passwordValidationRegExp.uppercaseCharRegExp.test(password) &&
        passwordValidationRegExp.numericalValueRegExp.test(password) &&
        passwordValidationRegExp.specialCharRegExp.test(password)
      );
    };

    if (
      isValidName(signName) &&
      signName.trim().length > 1 &&
      signEmail.length >= 8 &&
      signPassword.length > 1 &&
      validatePassword(signPassword)
    ) {
      if (cPassword == signPassword) {
        try {
          const { data: signUpData } = await signup({
            variables: {
              name: signName,
              email: signEmail,
              password: signPassword,
            },
          });

          if (signUpData) {
            toast.success(
              t(
                role === 'admin' ? 'successfullyRegistered' : 'afterRegister',
              ) as string,
            );
            setShowTab('LOGIN');
            setSignFormState({
              signName: '',
              signEmail: '',
              signPassword: '',
              cPassword: '',
              signOrg: '',
            });
            SignupRecaptchaRef.current?.reset();
          }
        } catch (error) {
          errorHandler(t, error);
          SignupRecaptchaRef.current?.reset();
        }
      } else {
        toast.warn(t('passwordMismatches') as string);
      }
    } else {
      if (!isValidName(signName)) {
        toast.warn(t('name_invalid') as string);
      }
      if (!validatePassword(signPassword)) {
        toast.warn(t('password_invalid') as string);
      }
      if (signEmail.length < 8) {
        toast.warn(t('email_invalid') as string);
      }
    }
  };

  const loginLink = async (e: ChangeEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const isVerified = await verifyRecaptcha(recaptchaToken);

    if (!isVerified) {
      toast.error(t('Please_check_the_captcha') as string);
      return;
    }

    try {
      const { data: signInData } = await signin({
        variables: { email: formState.email, password: formState.password },
      });

      if (signInData) {
        if (signInData.signIn.user.countryCode !== null) {
          i18n.changeLanguage(signInData.signIn.user.countryCode);
        }

        const { signIn } = signInData;
        const { user, authenticationToken } = signIn;
        const isAdmin: boolean = user.role === 'administrator';
        if (role === 'admin' && !isAdmin) {
          toast.warn(tErrors('notAuthorised') as string);
          return;
        }
        const loggedInUserId = user.id;

        setItem('token', authenticationToken);
        setItem('IsLoggedIn', 'TRUE');
        setItem('name', user.name);
        setItem('email', user.emailAddress);
        setItem('role', user.role);
        setItem('UserImage', user.avatarURL || '');
        // setItem('FirstName', user.firstName);
        // setItem('LastName', user.lastName);
        // setItem('UserImage', user.avatarURL);
        if (role === 'admin') {
          setItem('id', loggedInUserId);
        } else {
          setItem('userId', loggedInUserId);
        }

        navigate(role === 'admin' ? '/orglist' : '/user/organizations');
        startSession();
      } else {
        toast.warn(tErrors('notFound') as string);
      }
    } catch (error) {
      errorHandler(t, error);
      loginRecaptchaRef.current?.reset();
    }
  };

  const socialIconsList = socialMediaLinks.map(({ href, logo, tag }, index) =>
    data?.community ? (
      data.community?.[tag] && (
        <a
          key={index}
          href={data.community?.[tag]}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="preLoginSocialMedia"
        >
          <img src={logo} />
        </a>
      )
    ) : (
      <a
        key={index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="PalisadoesSocialMedia"
      >
        <img src={logo} />
      </a>
    ),
  );

  return (
    <>
      <section className={styles.login_background}>
        <Row className={styles.row}>
          <Col sm={0} md={6} lg={7} className={styles.left_portion}>
            <div className={styles.inner}>
              {data?.community ? (
                <a
                  href={data.community.websiteURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.communityLogo}`}
                >
                  <img
                    src={data.community.logoURL}
                    alt="Community Logo"
                    data-testid="preLoginLogo"
                  />
                  <p className="text-center">{data.community.name}</p>
                </a>
              ) : (
                <a
                  href="https://www.palisadoes.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PalisadoesLogo
                    className={styles.palisadoes_logo}
                    data-testid="PalisadoesLogo"
                  />
                  <p className="text-center">{t('fromPalisadoes')}</p>
                </a>
              )}
            </div>
            <div className={styles.socialIcons}>{socialIconsList}</div>
          </Col>
          <Col sm={12} md={6} lg={5}>
            <div className={styles.right_portion}>
              <ChangeLanguageDropDown
                parentContainerStyle={styles.langChangeBtn}
                btnStyle={styles.langChangeBtnStyle}
              />
              <TalawaLogo
                className={`${styles.talawa_logo}  ${
                  showTab === 'REGISTER' && styles.marginTopForReg
                }`}
              />
              {/* LOGIN FORM */}
              <div
                className={`${
                  showTab === 'LOGIN' ? styles.active_tab : 'd-none'
                }`}
              >
                <form onSubmit={loginLink}>
                  <h1 className="fs-2 fw-bold text-dark mb-3">
                    {/* {role === 'admin' ? tCommon('login') : t('userLogin')} */}
                    {role === 'admin' ? t('adminLogin') : t('userLogin')}
                  </h1>
                  <Form.Label>{tCommon('email')}</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="email"
                      disabled={loginLoading}
                      placeholder={tCommon('enterEmail')}
                      required
                      value={formState.email}
                      onChange={(e): void => {
                        setFormState({
                          ...formState,
                          email: e.target.value,
                        });
                      }}
                      autoComplete="username"
                      data-testid="loginEmail"
                    />
                    <Button tabIndex={-1} className={styles.email_button}>
                      <EmailOutlinedIcon />
                    </Button>
                  </div>
                  <Form.Label className="mt-3">
                    {tCommon('password')}
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      className="input_box_second lh-1"
                      placeholder={tCommon('enterPassword')}
                      required
                      value={formState.password}
                      data-testid="password"
                      onChange={(e): void => {
                        setFormState({
                          ...formState,
                          password: e.target.value,
                        });
                      }}
                      disabled={loginLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      onClick={togglePassword}
                      data-testid="showLoginPassword"
                      className={styles.email_button}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye"></i>
                      ) : (
                        <i className="fas fa-eye-slash"></i>
                      )}
                    </Button>
                  </div>
                  <div className="text-end mt-3">
                    <Link
                      to="/forgotPassword"
                      className="text-secondary"
                      tabIndex={-1}
                    >
                      {tCommon('forgotPassword')}
                    </Link>
                  </div>
                  {REACT_APP_USE_RECAPTCHA === 'yes' ? (
                    <div className="googleRecaptcha">
                      <ReCAPTCHA
                        ref={loginRecaptchaRef}
                        className="mt-2"
                        sitekey={
                          RECAPTCHA_SITE_KEY ? RECAPTCHA_SITE_KEY : 'XXX'
                        }
                        onChange={handleCaptcha}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  <Button
                    disabled={loginLoading}
                    type="submit"
                    className={styles.login_btn}
                    value="Login"
                    data-testid="loginBtn"
                  >
                    {tCommon('login')}
                  </Button>
                  {location.pathname === '/admin' || (
                    <div>
                      <div className="position-relative my-2">
                        <hr />
                        <span className={styles.orText}>{tCommon('OR')}</span>
                      </div>
                      <Button
                        variant="outline-secondary"
                        value="Register"
                        className={styles.reg_btn}
                        data-testid="goToRegisterPortion"
                        onClick={(): void => {
                          setShowTab('REGISTER');
                          setShowPassword(false);
                        }}
                      >
                        <Link to={'/register'} className="text-decoration-none">
                          {tCommon('register')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </form>
              </div>
              {/* REGISTER FORM */}
              <div
                className={`${
                  showTab === 'REGISTER' ? styles.active_tab : 'd-none'
                }`}
              >
                <Form onSubmit={signupLink}>
                  <h1
                    className="fs-2 fw-bold text-dark mb-3"
                    data-testid="register-text"
                  >
                    {tCommon('register')}
                  </h1>
                  <Row>
                    {/* <Col sm={6}> */}
                    <div>
                      <Form.Label>{tCommon('Name')}</Form.Label>
                      <Form.Control
                        disabled={signinLoading}
                        type="text"
                        id="signname"
                        className="mb-3"
                        placeholder={tCommon('Name')}
                        required
                        value={signformState.signName}
                        onChange={(e): void => {
                          setSignFormState({
                            ...signformState,
                            signName: e.target.value,
                          });
                        }}
                      />
                    </div>
                    {/* </Col> */}
                    {/* <Col sm={6}>
                      <div>
                        <Form.Label>{tCommon('lastName')}</Form.Label>
                        <Form.Control
                          disabled={signinLoading}
                          type="text"
                          id="signlastname"
                          className="mb-3"
                          placeholder={tCommon('lastName')}
                          required
                          value={signformState.signlastName}
                          onChange={(e): void => {
                            setSignFormState({
                              ...signformState,
                              signlastName: e.target.value,
                            });
                          }}
                        />dwdwdw
                      </div>
                    </Col> */}
                  </Row>
                  <div className="position-relative">
                    <Form.Label>{tCommon('email')}</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        disabled={signinLoading}
                        type="email"
                        data-testid="signInEmail"
                        className="mb-3"
                        placeholder={tCommon('email')}
                        autoComplete="username"
                        required
                        value={signformState.signEmail}
                        onChange={(e): void => {
                          setSignFormState({
                            ...signformState,
                            signEmail: e.target.value.toLowerCase(),
                          });
                        }}
                      />
                      <Button
                        tabIndex={-1}
                        className={`${styles.email_button}`}
                      >
                        <EmailOutlinedIcon />
                      </Button>
                    </div>
                  </div>

                  <div className="position-relative mb-3">
                    <Form.Label>{tCommon('password')}</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        disabled={signinLoading}
                        type={showPassword ? 'text' : 'password'}
                        data-testid="passwordField"
                        placeholder={tCommon('password')}
                        autoComplete="new-password"
                        onFocus={(): void => setIsInputFocused(true)}
                        onBlur={(): void => setIsInputFocused(false)}
                        required
                        value={signformState.signPassword}
                        onChange={(e): void => {
                          setSignFormState({
                            ...signformState,
                            signPassword: e.target.value,
                          });
                          handlePasswordCheck(e.target.value);
                        }}
                      />
                      <Button
                        onClick={togglePassword}
                        data-testid="showPassword"
                        className={`${styles.email_button}`}
                      >
                        {showPassword ? (
                          <i className="fas fa-eye"></i>
                        ) : (
                          <i className="fas fa-eye-slash"></i>
                        )}
                      </Button>
                    </div>
                    <div className={styles.password_checks}>
                      {isInputFocused ? (
                        signformState.signPassword.length < 6 ? (
                          <div data-testid="passwordCheck">
                            <p
                              className={`form-text text-danger ${styles.password_check_element_top}`}
                            >
                              <span>
                                <Clear className="" />
                              </span>
                              {t('atleast_6_char_long')}
                            </p>
                          </div>
                        ) : (
                          <p
                            className={`form-text text-success ${styles.password_check_element_top}`}
                          >
                            <span>
                              <Check />
                            </span>
                            {t('atleast_6_char_long')}
                          </p>
                        )
                      ) : null}

                      {!isInputFocused &&
                        signformState.signPassword.length > 0 &&
                        signformState.signPassword.length < 6 && (
                          <div
                            className={`form-text text-danger ${styles.password_check_element}`}
                            data-testid="passwordCheck"
                          >
                            <span>
                              <Check className="size-sm" />
                            </span>
                            {t('atleast_6_char_long')}
                          </div>
                        )}
                      {isInputFocused && (
                        <p
                          className={`form-text ${
                            showAlert.lowercaseChar
                              ? 'text-danger'
                              : 'text-success'
                          } ${styles.password_check_element}`}
                        >
                          {showAlert.lowercaseChar ? (
                            <span>
                              <Clear />
                            </span>
                          ) : (
                            <span>
                              <Check />
                            </span>
                          )}
                          {t('lowercase_check')}
                        </p>
                      )}
                      {isInputFocused && (
                        <p
                          className={`form-text ${
                            showAlert.uppercaseChar
                              ? 'text-danger'
                              : 'text-success'
                          } ${styles.password_check_element}`}
                        >
                          {showAlert.uppercaseChar ? (
                            <span>
                              <Clear />
                            </span>
                          ) : (
                            <span>
                              <Check />
                            </span>
                          )}
                          {t('uppercase_check')}
                        </p>
                      )}
                      {isInputFocused && (
                        <p
                          className={`form-text ${
                            showAlert.numericValue
                              ? 'text-danger'
                              : 'text-success'
                          } ${styles.password_check_element}`}
                        >
                          {showAlert.numericValue ? (
                            <span>
                              <Clear />
                            </span>
                          ) : (
                            <span>
                              <Check />
                            </span>
                          )}
                          {t('numeric_value_check')}
                        </p>
                      )}
                      {isInputFocused && (
                        <p
                          className={`form-text ${
                            showAlert.specialChar
                              ? 'text-danger'
                              : 'text-success'
                          } ${styles.password_check_element} ${
                            styles.password_check_element_bottom
                          }`}
                        >
                          {showAlert.specialChar ? (
                            <span>
                              <Clear />
                            </span>
                          ) : (
                            <span>
                              <Check />
                            </span>
                          )}
                          {t('special_char_check')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="position-relative">
                    <Form.Label>{tCommon('confirmPassword')}</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        disabled={signinLoading}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={tCommon('confirmPassword')}
                        required
                        value={signformState.cPassword}
                        onChange={(e): void => {
                          setSignFormState({
                            ...signformState,
                            cPassword: e.target.value,
                          });
                        }}
                        data-testid="cpassword"
                        autoComplete="new-password"
                      />
                      <Button
                        data-testid="showPasswordCon"
                        onClick={toggleConfirmPassword}
                        className={`${styles.email_button}`}
                      >
                        {showConfirmPassword ? (
                          <i className="fas fa-eye"></i>
                        ) : (
                          <i className="fas fa-eye-slash"></i>
                        )}
                      </Button>
                    </div>
                    {signformState.cPassword.length > 0 &&
                      signformState.signPassword !==
                        signformState.cPassword && (
                        <div
                          className="form-text text-danger"
                          data-testid="passwordCheck"
                        >
                          {t('Password_and_Confirm_password_mismatches.')}
                        </div>
                      )}
                  </div>
                  <div className="position-relative  my-2">
                    <Form.Label>{t('selectOrg')}</Form.Label>
                    <div className="position-relative">
                      <Autocomplete
                        disablePortal
                        data-testid="selectOrg"
                        onChange={(
                          event,
                          value: { label: string; id: string } | null,
                        ) => {
                          setSignFormState({
                            ...signformState,
                            signOrg: value?.id ?? '',
                          });
                        }}
                        options={organizations}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Organizations"
                            className={styles.selectOrgText}
                          />
                        )}
                      />
                    </div>
                  </div>
                  {REACT_APP_USE_RECAPTCHA === 'yes' ? (
                    <div className="mt-3">
                      <ReCAPTCHA
                        ref={SignupRecaptchaRef}
                        sitekey={
                          RECAPTCHA_SITE_KEY ? RECAPTCHA_SITE_KEY : 'XXX'
                        }
                        onChange={handleCaptcha}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  <Button
                    type="submit"
                    className={`mt-4 fw-bold w-100 mb-3 ${styles.login_btn}`}
                    value="Register"
                    data-testid="registrationBtn"
                    disabled={signinLoading}
                  >
                    {tCommon('register')}
                  </Button>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default loginPage;
