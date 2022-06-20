import axios from "axios";
import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import useInput from "../../hooks/useInput";
import {
  Button,
  Error,
  Form,
  Header,
  Input,
  Label,
  LinkContainer,
  Success,
} from "./styles";

function Signup() {
  const [email, onChangeEmail] = useInput("");
  const [password, , setPassword] = useInput("");
  const [nickname, onChangeNickname] = useInput("");
  const [passwordCheck, , setPasswordCheck] = useInput("");
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // const onChangeEmail = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setemail(e.target.value);
  //   },
  //   []
  // );

  const onChangePassword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck, setPassword]
  );
  const onChangePasswordCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password, setPasswordCheck]
  );
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!nickname || !nickname.trim()) {
        return;
      }
      setSignUpError("");
      setSignUpSuccess(false);
      axios
        .post("http://localhost:3095/api/users", {
          email,
          nickname,
          password,
        })
        .then((data) => {
          console.log("dd", data);
          setSignUpSuccess(true);
        })
        .catch((err) => {
          console.log(err);
          setSignUpError(err.response.data);
        });
    },
    [email, password, nickname]
  );

  return (
    <div id="container">
      <Header>signup</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChangeEmail}
            />
          </div>
        </Label>
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input
              type="text"
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={onChangeNickname}
            />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChangePassword}
            />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {!nickname && <Error>닉네임을 입력해주세요.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && (
            <Success>회원가입되었습니다! 로그인해주세요.</Success>
          )}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
}

export default Signup;
